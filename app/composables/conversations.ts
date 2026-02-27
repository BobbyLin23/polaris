import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

export function useConversation(id: Ref<string | null>) {
  const { $orpc } = useNuxtApp()

  return useQuery(
    computed(() =>
      $orpc.system.getConversationById.queryOptions({
        input: id.value ? { id: id.value } : skipToken,
      }),
    ),
  )
}

export function useMessages(conversationId: Ref<string | null>) {
  const { $orpc } = useNuxtApp()

  return useQuery(
    computed(() =>
      $orpc.conversations.getMessages.queryOptions({
        input: conversationId.value ? { conversationId: conversationId.value } : skipToken,
      }),
    ),
  )
}

export function useConversations(projectId: string) {
  const { $orpc } = useNuxtApp()

  return useQuery($orpc.conversations.getByProject.queryOptions({
    input: {
      projectId,
    },
  }))
}

export function useCreateConversation(projectId: string) {
  const { $orpc } = useNuxtApp()

  const queryClient = useQueryClient()

  return useMutation($orpc.conversations.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: $orpc.conversations.getByProject.queryKey({ input: { projectId } }) })
    },
  }))
}
