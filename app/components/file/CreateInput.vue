<script lang="ts" setup>
import { ChevronRightIcon } from 'lucide-vue-next'

defineProps<{
  level: number
  type: 'file' | 'folder'
}>()

const emit = defineEmits<{
  (e: 'submit', name: string): void
  (e: 'cancel'): void
}>()

const value = ref('')

function handleSubmit() {
  const trimmedValue = value.value.trim()
  if (trimmedValue) {
    emit('submit', trimmedValue)
  }
  else {
    emit('cancel')
  }
}
</script>

<template>
  <div
    class="w-full flex items-center gap-1 h-5.5 bg-accent/30"
    :style="{ paddingLeft: `${getItemPadding(level, type === 'file')}px` }"
  >
    <div class="flex items-center gap-0.5">
      <ChevronRightIcon v-if="type === 'folder'" class="size-4 shrink-0 text-muted-foreground" />
      <Icon v-if="type === 'folder'" :name="getFolderIconName(value)" class="size-4" />
      <Icon v-if="type === 'file'" :name="getFileIcon(value)" class="size-4" />
    </div>
    <input
      v-model="value"
      autoFocus
      type="text"
      class="flex-1 bg-transparent text-sm outline-none focus:ring-1 focus:ring-inset focus:ring-ring"
      @blur="handleSubmit"
      @keydown.enter="handleSubmit"
      @keydown.escape="emit('cancel')"
    >
  </div>
</template>
