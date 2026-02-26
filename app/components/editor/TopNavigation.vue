<script lang="ts" setup>
const props = defineProps<{
  projectId: string
}>()

const { openTabs } = useEditor(props.projectId)
</script>

<template>
  <ScrollArea class="flex-1">
    <nav class="bg-sidebar flex items-center h-8.75 border-b">
      <EditorTab
        v-for="(fileId, index) in openTabs"
        :key="fileId"
        :file-id="fileId"
        :is-first="index === 0"
        :project-id="projectId"
      />
    </nav>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
</template>
