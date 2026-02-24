<script lang="ts" setup>
defineProps<{
  data: SelectProject
}>()
</script>

<template>
  <NuxtLink
    :href="`/projects/${data.id}`"
    class="text-sm text-foreground/60 font-medium hover:text-foreground py-1 flex items-center justify-between w-full group"
  >
    <div class="flex items-center gap-2">
      <component :is="getProjectIcon(data)" />
      <span class="truncate">{{ data.name }}</span>
    </div>
    <span class="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors">
      {{ formatTimestamp(data.updatedAt.getTime()) }}
    </span>
  </NuxtLink>
</template>
