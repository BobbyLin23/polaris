<script lang="ts" setup>
import { ChevronRightIcon } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = defineProps<{
  type: 'file' | 'folder'
  isOpen?: boolean
  level: number
  defaultValue: string
}>()

const emits = defineEmits<{
  (e: 'submit', name: string): void
  (e: 'cancel'): void
}>()

const value = ref(props.defaultValue)

function handleSubmit() {
  const trimmedValue = value.value.trim() || props.defaultValue
  emits('submit', trimmedValue)
}
</script>

<template>
  <div
    class="w-full flex items-center gap-1 h-5.5 bg-accent/30"
    :style="{
      paddingLeft: `${getItemPadding(level, type === 'file')}px`,
    }"
  >
    <div class="flex items-center gap-0.5">
      <ChevronRightIcon
        v-if="type === 'folder'"
        :class="cn('size-4 shrink-0 text-muted-foreground', isOpen && 'rotate-90')"
      />
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
      @keydown.escape="emits('cancel')"
      @focus="(e) => {
        if (type === 'folder') {
          (e.target as HTMLInputElement).select()
        }
        else {
          const value = (e.target as HTMLInputElement).value
          const lastDotIndex = value.lastIndexOf('.')
          if (lastDotIndex > 0) {
            (e.target as HTMLInputElement).setSelectionRange(0, lastDotIndex)
          }
          else {
            (e.target as HTMLInputElement).select()
          }
        }
      }"
    >
  </div>
</template>
