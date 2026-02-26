<script lang="ts" setup>
const props = defineProps<{
  projectId: string
}>()

const timeoutRef = ref<ReturnType<typeof setTimeout> | null>(null)

const { activeTabId } = useEditor(props.projectId)

const { data: activeFile } = useFile(activeTabId.value)

const { mutate: updateFile } = useUpdateFile({
  projectId: props.projectId,
  fileId: '',
  parentId: '',
})

const isActiveFileText = computed(() => !!activeFile.value && !activeFile.value.storageId)

function handleContentChange(content: string) {
  if (timeoutRef.value) {
    clearTimeout(timeoutRef.value)
  }
  timeoutRef.value = setTimeout(() => {
    updateFile({
      fileId: activeFile.value?.id ?? '',
      content,
    })
  }, 1500)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center">
      <EditorTopNavigation :project-id="projectId" />
    </div>
    <EditorFileBreadcrumbs v-if="activeTabId" :project-id="projectId" />
    <div class="flex-1 min-h-0 bg-background">
      <div v-if="activeFile === undefined" class="size-full flex items-center justify-center">
        <NuxtImg
          src="/logo-alt.svg"
          alt="Polaris"
          :width="50"
          :height="50"
          class="opacity-25"
        />
      </div>
      <EditorCodeEditor
        v-if="isActiveFileText"
        :file-name="activeFile?.name ?? ''"
        :initial-value="activeFile?.content ?? ''"
        @change="handleContentChange"
      />
    </div>
  </div>
</template>
