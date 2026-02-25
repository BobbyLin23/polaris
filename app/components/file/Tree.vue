<script lang="ts" setup>
import { ChevronRightIcon } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  item: SelectFile
  level?: number
  projectId: string
}>(), {
  level: 0,
})

const isOpen = ref(false)
const isRenaming = ref(false)
const creating = ref<'file' | 'folder' | null>(null)
const displayName = ref(props.item.name)
watch(() => props.item.name, (name) => {
  displayName.value = name
})

const { data: folderContents } = useFolderContents({
  projectId: props.item.projectId,
  parentId: props.item.id,
  enabled: computed(() => props.item.type === 'folder' && isOpen.value),
})

const { mutate: renameFile } = useRenameFile({
  projectId: props.item.projectId,
  fileId: props.item.id,
  parentId: props.item.parentId ?? undefined,
})

const { mutate: deleteFile } = useDeleteFile({
  projectId: props.item.projectId,
  fileId: props.item.id,
  parentId: props.item.parentId ?? undefined,
})

const { mutate: createFile } = useCreateFile({
  projectId: props.item.projectId,
  parentId: props.item.id,
})

const { mutate: createFolder } = useCreateFolder({
  projectId: props.item.projectId,
  parentId: props.item.id,
})

function handleRename(newName: string) {
  isRenaming.value = false

  if (newName === props.item.name) {
    return
  }

  displayName.value = newName
  renameFile({
    fileId: props.item.id,
    name: newName,
  }, {
    onError: () => { displayName.value = props.item.name },
  })
}

function handleCreate(name: string) {
  if (creating.value === 'file') {
    createFile({
      projectId: props.item.projectId,
      name,
      content: '',
      parentId: props.item.id,
    })
  }
  else if (creating.value === 'folder') {
    createFolder({
      projectId: props.item.projectId,
      name,
      parentId: props.item.id,
    })
  }

  creating.value = null
}

function startCreating(type: 'file' | 'folder') {
  creating.value = type
  isOpen.value = true
}
</script>

<template>
  <template v-if="item.type === 'file'">
    <FileRenameInput
      v-if="isRenaming"
      type="file"
      :level="level"
      :default-value="item.name"
      @submit="handleRename"
      @cancel="isRenaming = false"
    />
    <FileTreeItemWrapper
      v-else
      :item="item"
      :level="level"
      :is-active="false"
      @click="() => {}"
      @rename="isRenaming = true"
      @delete="() => {
        deleteFile({
          fileId: item.id,
        })
      }"
    >
      <Icon :name="getFileIcon(displayName)" class="size-4" />
      <span class="text-sm truncate">
        {{ displayName }}
      </span>
    </FileTreeItemWrapper>
  </template>
  <template v-else>
    <template v-if="creating">
      <button
        class="roup flex items-center gap-1 h-5.5 hover:bg-accent/30 w-full"
        :style="{ paddingLeft: `${getItemPadding(level, creating === 'file')}px` }"
        @click="isOpen = !isOpen"
      >
        <div class="flex items-center gap-0.5">
          <ChevronRightIcon
            :class="cn('size-4 shrink-0 text-muted-foreground', isOpen && 'rotate-90')"
          />
          <Icon :name="getFolderIconName(displayName)" class="size-4" />
        </div>
        <span class="text-sm truncate">
          {{ displayName }}
        </span>
      </button>
      <template v-if="isOpen">
        <FileLoadingView v-if="folderContents === undefined" :level="level + 1" />
        <FileCreateInput
          :level="level + 1"
          :type="creating"
          @submit="handleCreate"
          @cancel="creating = null"
        />
        <FileTree
          v-for="subItem in folderContents ?? []"
          :key="subItem.id"
          :item="subItem"
          :level="level + 1"
          :project-id="item.projectId"
        />
      </template>
    </template>
    <template v-else-if="isRenaming">
      <FileRenameInput
        type="folder"
        :level="level"
        :is-open="isOpen"
        :default-value="item.name"
        @submit="handleRename"
        @cancel="isRenaming = false"
      />
      <template v-if="isOpen">
        <FileLoadingView v-if="folderContents === undefined" :level="level + 1" />
        <FileTree
          v-for="subItem in folderContents ?? []"
          :key="subItem.id"
          :item="subItem"
          :level="level + 1"
          :project-id="item.projectId"
        />
      </template>
    </template>
    <template v-else>
      <FileTreeItemWrapper
        :item="item"
        :level="level"
        :is-active="false"
        @click="isOpen = !isOpen"
        @rename="isRenaming = true"
        @delete="() => {
          deleteFile({
            fileId: item.id,
          })
        }"
        @create-file="startCreating('file')"
        @create-folder="startCreating('folder')"
      >
        <div class="flex items-center gap-0.5">
          <ChevronRightIcon
            :class="cn('size-4 shrink-0 text-muted-foreground', isOpen && 'rotate-90')"
          />
          <Icon :name="getFolderIconName(displayName)" class="size-4" />
        </div>
        <span class="text-sm truncate">
          {{ displayName }}
        </span>
      </FileTreeItemWrapper>
      <template v-if="isOpen">
        <FileLoadingView v-if="folderContents === undefined" :level="level + 1" />
        <FileTree
          v-for="subItem in folderContents ?? []"
          :key="subItem.id"
          :item="subItem"
          :level="level + 1"
          :project-id="item.projectId"
        />
      </template>
    </template>
  </template>
</template>
