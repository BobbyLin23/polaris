<script lang="ts" setup>
import { cn } from '~/lib/utils'

defineProps<{
  label: string
  isActive: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div
    :class="cn(
      'flex items-center gap-2 h-full px-3 cursor-pointer text-muted-foreground border-r hover:bg-accent/30',
      isActive && 'bg-background text-foreground',
    )"
    @click="$emit('click')"
  >
    <span class="text-sm">{{ label }}</span>
  </div>
</template>
