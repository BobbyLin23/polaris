<script lang="ts" setup>
import { useGetProjectsPartial } from '~/composables/projects'

defineEmits<{
  (e: 'viewAll'): void
}>()

const { data: projects, isPending } = useGetProjectsPartial(6)

const mostRecent = computed(() => projects.value?.[0] as SelectProject)
const rest = computed(() => projects.value?.slice(1) as SelectProject[])
</script>

<template>
  <template v-if="isPending">
    <Spinner class="size-4 text-ring" />
  </template>
  <template v-else>
    <div class="flex flex-col gap-4">
      <ProjectsContinueCard v-if="mostRecent" :data="mostRecent" />
      <template v-if="rest?.length && rest.length > 0">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs text-muted-foreground">
              Recent projects
            </span>
            <button
              class="flex items-center gap-2 text-muted-foreground text-xs hover:text-foreground transition-colors"
              @click="$emit('viewAll')"
            >
              <span>View all</span>
              <Kbd class="bg-accent border">
                ⌘K
              </Kbd>
            </button>
          </div>
          <ul class="flex flex-col">
            <ProjectsItem v-for="project in rest" :key="project.id" :data="project" />
          </ul>
        </div>
      </template>
    </div>
  </template>
</template>
