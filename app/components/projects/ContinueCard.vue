<script lang="ts" setup>
import { ArrowRightIcon } from 'lucide-vue-next'

defineProps<{
  data: SelectProject
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="text-xs text-muted-foreground">
      Last updated
    </span>
    <Button
      variant="outline"
      as-child
      class="h-auto items-start justify-start p-4 bg-background border rounded-none flex flex-col gap-2"
    >
      <NuxtLink :href="`/projects/${data.id}`" class="group">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <component :is="getProjectIcon(data)" />
            <span class="font-medium truncate">
              {{ data.name }}
            </span>
          </div>
          <ArrowRightIcon class="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </div>
        <span class="text-xs text-muted-foreground">
          {{ formatTimestamp(data.updatedAt.getTime()) }}
        </span>
      </NuxtLink>
    </Button>
  </div>
</template>
