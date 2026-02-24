import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

export function useCreateProject() {
  const { $orpc } = useNuxtApp()
  const queryClient = useQueryClient()

  return useMutation($orpc.projects.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: $orpc.projects.get.queryKey() })
      queryClient.invalidateQueries({ queryKey: $orpc.projects.getPartial.queryKey({ input: { limit: 6 } }) })
    },
  }))
}

export function useGetProjects() {
  const { $orpc } = useNuxtApp()

  return useQuery($orpc.projects.get.queryOptions())
}

export function useGetProjectsPartial(limit: number) {
  const { $orpc } = useNuxtApp()

  return useQuery($orpc.projects.getPartial.queryOptions({
    input: {
      limit,
    },
  }))
}
