<script lang="ts" setup>
import { cn } from '~/lib/utils'

defineProps<{
  item: SelectFile
  level: number
  isActive?: boolean
}>()

defineEmits<{
  (e: 'click'): void
  (e: 'rename'): void
  (e: 'delete'): void
  (e: 'doubleClick'): void
  (e: 'createFile'): void
  (e: 'createFolder'): void
}>()
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <button
        type="button"
        :class="cn('group flex items-center gap-1 w-full h-5.5 hover:bg-accent/30 outline-none focus:ring-1 focus:ring-inset focus:ring-ring', isActive && 'bg-accent/30')"
        :style="{ paddingLeft: `${getItemPadding(level, item.type === 'file')}px` }"
        @click="$emit('click')"
        @dblclick="$emit('doubleClick')"
        @keydown.enter.prevent="$emit('rename')"
      >
        <slot />
      </button>
    </ContextMenuTrigger>
    <ContextMenuContent class="w-64">
      <template v-if="item.type === 'folder'">
        <ContextMenuItem class="text-sm" @click="$emit('createFile')">
          New File...
        </ContextMenuItem>
        <ContextMenuItem class="text-sm" @click="$emit('createFolder')">
          New Folder...
        </ContextMenuItem>
        <ContextMenuSeparator />
      </template>
      <ContextMenuItem class="text-sm" @click="$emit('rename')">
        Rename...
        <ContextMenuShortcut>
          Enter
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem class="text-sm" @click="$emit('delete')">
        Delete...
        <ContextMenuShortcut>
          ⌘Backspace
        </ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
