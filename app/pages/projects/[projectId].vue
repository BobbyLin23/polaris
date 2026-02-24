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
          <div class="flex h-[200px] items-center justify-center p-6">
            <span class="font-semibold">One</span>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel :default-size="60">
          <ProjectsIdView />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  </div>
</template>
