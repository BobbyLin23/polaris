<script lang="ts" setup>
defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const router = useRouter()

const { data: projects } = useGetProjects()

function handleSelect(projectId: string) {
  router.push(`/projects/${projectId}`)
  emit('update:open', false)
}
</script>

<template>
  <CommandDialog
    :open="open"
    title="Search Projects"
    description="Search and navigate to your projects"
    @update:open="emit('update:open', $event)"
  >
    <CommandInput placeholder="Search projects..." />
    <CommandList>
      <CommandEmpty>No projects found.</CommandEmpty>
      <CommandGroup heading="Projects">
        <CommandItem
          v-for="project in projects"
          :key="project.id"
          :value="`${project.name}-${project.id}`"
          @select="handleSelect(project.id)"
        >
          <component :is="getProjectIcon(project as SelectProject)" />
          <span>{{ project.name }}</span>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>
