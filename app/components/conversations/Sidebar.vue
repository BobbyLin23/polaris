<script lang="ts" setup>
import type { PromptInputMessage } from '../ai-elements/prompt-input'
import { useQueryClient } from '@tanstack/vue-query'
import ky from 'ky'
import { CopyIcon, HistoryIcon, LoaderIcon, PlusIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  projectId: string
}>()

const { $orpc } = useNuxtApp()
const queryClient = useQueryClient()

const input = ref('')

const selectedConversationId = ref<string | null>(null)

const { mutateAsync: createConversation } = useCreateConversation(props.projectId)

const { data: conversations } = useConversations(props.projectId)

const activeConversationId = computed(() => {
  return selectedConversationId.value ?? conversations.value?.[0]?.id ?? null
})

const { data: activeConversation } = useConversation(activeConversationId)

const { data: conversationMessages, refetch: refetchMessages } = useMessages(activeConversationId)

const isProcessing = computed(() => {
  return conversationMessages.value?.some(message => message.status === 'processing') ?? false
})

// Poll for updates while AI is processing
watch(isProcessing, (processing) => {
  if (!processing)
    return
  const interval = setInterval(() => refetchMessages(), 2000)
  return () => clearInterval(interval)
}, { immediate: true })

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

async function handleCreateConversation() {
  try {
    const res = await createConversation({
      projectId: props.projectId,
      title: DEFAULT_CONVERSATION_TITLE,
    })
    selectedConversationId.value = res.id
    return res.id
  }
  catch (error) {
    console.error(error)
    toast.error('Failed to create conversation')
    return null
  }
}

async function handleSubmit(message: PromptInputMessage) {
  if (isProcessing.value && !message.text) {
    input.value = ''
    return
  }

  let conversationId = activeConversationId.value

  if (!conversationId) {
    conversationId = await handleCreateConversation()
    if (!conversationId) {
      return
    }
  }

  try {
    await ky.post('/api/messages', {
      json: {
        conversationId,
        message: message.text,
      },
    })
    queryClient.invalidateQueries({
      queryKey: $orpc.conversations.getMessages.queryKey({ input: { conversationId } }),
    })
  }
  catch {
    toast.error('Failed to submit message')
  }

  input.value = ''
}
</script>

<template>
  <div class="flex h-full flex-col bg-sidebar">
    <div class="h-8.75 flex items-center justify-between border-b">
      <div class="text-sm truncate pl-3">
        {{ activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE }}
      </div>
      <div class="flex items-center px-1 gap-1">
        <Button
          size="icon-xs"
          variant="highlight"
        >
          <HistoryIcon class="size-3.5" />
        </Button>
        <Button
          size="icon-xs"
          variant="highlight"
          @click="handleCreateConversation"
        >
          <PlusIcon class="size-3.5" />
        </Button>
      </div>
    </div>
    <Conversation class="flex-1">
      <ConversationContent>
        <Message v-for="(message, messageIndex) in (conversationMessages ?? [])" :key="message.id" :from="message.role">
          <MessageContent>
            <template v-if="message.status === 'processing'">
              <div class="flex items-center gap-2 text-muted-foreground">
                <LoaderIcon class="size-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </template>
            <MessageResponse v-else>
              {{ message.content }}
            </MessageResponse>
          </MessageContent>
          <MessageActions v-if="message.role === 'assistant' && message.status === 'completed' && messageIndex === ((conversationMessages ?? []).length - 1)">
            <MessageAction
              label="Copy"
              @click="copyToClipboard(message.content)"
            >
              <CopyIcon class="size-3" />
            </MessageAction>
          </MessageActions>
        </Message>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
    <div class="p-3">
      <PromptInput class="mt-2" @submit="handleSubmit">
        <PromptInputBody>
          <PromptInputTextarea v-model="input" :disabled="isProcessing" placeholder="Ask Polaris anything..." />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit :disabled="isProcessing ? false : !input" :status="isProcessing ? 'streaming' : undefined" />
        </PromptInputFooter>
      </PromptInput>
    </div>
  </div>
</template>
