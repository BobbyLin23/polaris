<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<{
  level: number
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    :class="cn('h-5.5 flex items-center text-muted-foreground', props.class)"
    :style="{ paddingLeft: `${getItemPadding(level, true)}px` }"
  >
    <Spinner class="size-4 text-ring ml-0.5" />
  </div>
</template>
