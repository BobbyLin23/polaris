<script lang="ts" setup>
import { formatDistanceToNow } from 'date-fns'

const props = defineProps<{
  open: boolean
  projectId: string
}>()

const emits = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'select', conversationId: string): void
}>()

const { data: conversations } = useConversations(props.projectId)

function handleSelect(conversationId: string) {
  emits('select', conversationId)
  emits('update:open', false)
}
</script>

<template>
  <CommandDialog
    :open="open"
    title="Past Conversations"
    description="Search and select a past conversation"
    @update:open="emits('update:open', $event)"
  >
    <CommandInput placeholder="Search conversations..." />
    <CommandList>
      <CommandEmpty>No conversations found.</CommandEmpty>
      <CommandGroup heading="Conversations">
        <CommandItem
          v-for="conversation in (conversations ?? [])"
          :key="conversation.id"
          :value="`${conversation.title}-${conversation.id}`"
          @select="handleSelect(conversation.id)"
        >
          <div class="flex flex-col gap-0.5">
            <span>{{ conversation.title }}</span>
            <span class="text-xs text-muted-foreground">
              {{
                formatDistanceToNow(conversation.createdAt, {
                  addSuffix: true,
                })
              }}
            </span>
          </div>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>
