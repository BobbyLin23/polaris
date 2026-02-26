import { createId } from '@paralleldrive/cuid2'
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

function sortFolderContents(files: SelectFile[]) {
  return [...files].sort((a, b) => {
    if (a.type === 'folder' && b.type === 'file')
      return -1
    if (a.type === 'file' && b.type === 'folder')
      return 1
    return a.name.localeCompare(b.name)
  })
}

export function useFolderContents({ projectId, parentId, enabled = true }: {
  projectId: string
  parentId?: string
  enabled?: boolean | Ref<boolean>
}) {
  const { $orpc } = useNuxtApp()
  const enabledRef = computed(() => (typeof enabled === 'boolean' ? enabled : enabled.value))

  return useQuery({
    ...$orpc.files.getFolder.queryOptions({
      input: {
        projectId,
        parentId,
      },
    }),
    enabled: enabledRef,
  })
}

export function useCreateFile({ projectId, parentId }: {
  projectId: string
  parentId?: string
}) {
  const { $orpc } = useNuxtApp()
  const queryClient = useQueryClient()

  return useMutation($orpc.files.createFile.mutationOptions({
    onMutate: async (variables) => {
      const queryKey = $orpc.files.getFolder.queryKey({
        input: { projectId, parentId },
      })
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<SelectFile[]>(queryKey)
      const optimisticFile: SelectFile = {
        id: createId(),
        projectId,
        parentId: variables.parentId ?? null,
        name: variables.name,
        type: 'file',
        content: variables.content,
        storageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      queryClient.setQueryData(queryKey, sortFolderContents([...(previousData ?? []), optimisticFile]))
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData !== undefined) {
        const queryKey = $orpc.files.getFolder.queryKey({
          input: { projectId, parentId },
        })
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: $orpc.files.getFolder.queryKey({
        input: { projectId, parentId },
      }) })
    },
  }))
}

export function useCreateFolder({ projectId, parentId }: {
  projectId: string
  parentId?: string
}) {
  const { $orpc } = useNuxtApp()
  const queryClient = useQueryClient()

  return useMutation($orpc.files.createFolder.mutationOptions({
    onMutate: async (variables) => {
      const queryKey = $orpc.files.getFolder.queryKey({
        input: { projectId, parentId },
      })
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<SelectFile[]>(queryKey)
      const optimisticFolder: SelectFile = {
        id: createId(),
        projectId,
        parentId: variables.parentId ?? null,
        name: variables.name,
        type: 'folder',
        content: null,
        storageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      queryClient.setQueryData(queryKey, sortFolderContents([...(previousData ?? []), optimisticFolder]))
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData !== undefined) {
        const queryKey = $orpc.files.getFolder.queryKey({
          input: { projectId, parentId },
        })
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: $orpc.files.getFolder.queryKey({ input: { projectId, parentId } }) })
    },
  }))
}

export function useRenameFile({ projectId, fileId, parentId }: {
  projectId: string
  fileId: string
  parentId?: string
}) {
  const { $orpc } = useNuxtApp()
  const queryClient = useQueryClient()

  return useMutation($orpc.files.renameFile.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: $orpc.files.getFolder.queryKey({ input: { projectId, parentId } }) })
      queryClient.invalidateQueries({ queryKey: $orpc.files.getFile.queryKey({ input: { fileId } }) })
    },
  }))
}

export function useDeleteFile({ projectId, fileId, parentId }: {
  projectId: string
  fileId: string
  parentId?: string
}) {
  const { $orpc } = useNuxtApp()
  const queryClient = useQueryClient()

  return useMutation($orpc.files.deleteFile.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: $orpc.files.getFolder.queryKey({ input: { projectId, parentId } }) })
      queryClient.invalidateQueries({ queryKey: $orpc.files.getFile.queryKey({ input: { fileId } }) })
    },
  }))
}

export function useFile(fileId: string | null) {
  const { $orpc } = useNuxtApp()
  return useQuery({
    ...$orpc.files.getFile.queryOptions({
      input: fileId ? { fileId } : skipToken,
    }),
  })
}

export function useFilePath(fileId: string | null) {
  const { $orpc } = useNuxtApp()
  return useQuery({
    ...$orpc.files.getFilePath.queryOptions({
      input: fileId ? { fileId } : skipToken,
    }),
  })
}

export function useUpdateFile({ projectId, fileId, parentId }: {
  projectId: string
  fileId: string
  parentId?: string
}) {
  const { $orpc } = useNuxtApp()
  const queryClient = useQueryClient()

  return useMutation($orpc.files.updateFile.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: $orpc.files.getFolder.queryKey({ input: { projectId, parentId } }) })
      queryClient.invalidateQueries({ queryKey: $orpc.files.getFile.queryKey({ input: { fileId } }) })
    },
  }))
}
