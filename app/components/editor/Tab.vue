<script lang="ts" setup>
import { XIcon } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = defineProps<{
  fileId: string
  isFirst: boolean
  projectId: string
}>()

const { data: file } = useFile(props.fileId)

const { setActiveTab, openFile, activeTabId, previewTabId, closeTab } = useEditor(props.projectId)

const isActive = computed(() => props.fileId === activeTabId.value)
const isPreview = computed(() => props.fileId === previewTabId.value)
const fileName = computed(() => file.value?.name ?? 'Loading...')
</script>

<template>
  <div
    :class="cn(
      'flex items-center gap-2 h-8.75 pl-2 pr-1.5 cursor-pointer text-muted-foreground group border-y border-x border-transparent hover:bg-accent/30',
      isActive && 'bg-background text-foreground border-x-border border-b-background -mb-px drop-shadow',
      isFirst && 'border-l-transparent!',
    )"
    @click="setActiveTab(fileId)"
    @dblclick="openFile(fileId, { pinned: true })"
  >
    <Spinner v-if="file === undefined" class="text-ring" />
    <Icon v-else :name="getFileIcon(fileName)" class="size-4" />
    <span
      :class="cn(
        'text-sm whitespace-nowrap',
        isPreview && 'italic',
      )"
    >
      {{ fileName }}
    </span>
    <button
      :class="cn('p-0.5 rounded-sm hover:bg-white/10 opacity-0 group-hover:opacity-100', isActive && 'opacity-100')"
      @click.prevent.stop="closeTab(fileId)"
      @keydown.enter.prevent.stop="closeTab(fileId)"
      @keydown.space.prevent.stop="closeTab(fileId)"
    >
      <XIcon class="size-3.5" />
    </button>
  </div>
</template>
