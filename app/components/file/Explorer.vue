<script lang="ts" setup>
import { ChevronRightIcon, CopyMinusIcon, FilePlusCornerIcon, FolderPlusIcon } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = defineProps<{
  projectId: string
}>()

const isOpen = ref(true)
const isCreating = ref<'file' | 'folder' | null>(null)
const collapseKey = ref(0)

const { data: project } = useProject(props.projectId)
const { data: rootFiles } = useFolderContents({
  projectId: props.projectId,
  enabled: isOpen,
})

const { mutate: createFile } = useCreateFile({
  projectId: props.projectId,
  parentId: undefined,
})

const { mutate: createFolder } = useCreateFolder({
  projectId: props.projectId,
  parentId: undefined,
})

function handleCreate(name: string) {
  if (isCreating.value === 'file') {
    createFile({
      projectId: props.projectId,
      name,
      content: '',
      parentId: undefined,
    })
  }
  else if (isCreating.value === 'folder') {
    createFolder({
      projectId: props.projectId,
      name,
      parentId: undefined,
    })
  }
  isCreating.value = null
}
</script>

<template>
  <div class="h-full bg-sidebar">
    <ScrollArea>
      <div
        role="button"
        class="group/project cursor-pointer w-full text-left flex items-center gap-0.5 h-5.5 bg-accent font-bold"
        @click="isOpen = !isOpen"
      >
        <ChevronRightIcon
          :class="cn(
            'size-4 shrink-0 text-muted-foreground',
            isOpen && 'rotate-90',
          )"
        />
        <p class="text-xs uppercase line-clamp-1">
          {{ project?.name ?? 'Loading...' }}
        </p>
        <div class="opacity-0 group-hover/project:opacity-100 transition-none duration-0 flex items-center gap-0.5 ml-auto">
          <Button
            variant="highlight"
            size="icon-xs"
            @click.prevent.stop="() => {
              isCreating = 'file'
              isOpen = true
            }"
          >
            <FilePlusCornerIcon class="size-3.5" />
          </Button>
          <Button
            variant="highlight"
            size="icon-xs"
            @click.prevent.stop="() => {
              isCreating = 'folder'
              isOpen = true
            }"
          >
            <FolderPlusIcon class="size-3.5" />
          </Button>
          <Button
            variant="highlight"
            size="icon-xs"
            @click.prevent.stop="() => {
              collapseKey++
            }"
          >
            <CopyMinusIcon class="size-3.5" />
          </Button>
        </div>
      </div>
      <template v-if="isOpen">
        <FileLoadingView v-if="rootFiles === undefined" :level="0" />
        <FileCreateInput
          v-if="isCreating"
          :level="0"
          :type="isCreating"
          @submit="handleCreate"
          @cancel="isCreating = null"
        />
        <FileTheTree
          v-for="file in rootFiles ?? []"
          :key="`${file.id}-${collapseKey}`"
          :item="file"
          :level="0"
          :project-id="projectId"
        />
      </template>
    </ScrollArea>
  </div>
</template>
