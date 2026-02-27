<script lang="ts" setup>
const route = useRoute()

const projectId = route.params.projectId as string
</script>

<template>
  <div class="w-full h-screen flex flex-col">
    <ProjectsNavbar :project-id="projectId" />
    <div class="flex-1 flex overflow-hidden flex-col">
      <ResizablePanelGroup
        direction="horizontal"
        class="flex-1"
      >
        <ResizablePanel :default-size="40" :min-size="20" :max-size="80">
          <ConversationsSidebar :project-id="projectId" />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel :default-size="60">
          <ProjectsIdView :project-id="projectId" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  </div>
</template>
