<script lang="ts" setup>
const props = defineProps<{
  projectId: string
}>()

const { activeTabId } = useEditor(props.projectId)

const { data: filePath } = useFilePath(activeTabId.value)
</script>

<template>
  <template v-if="filePath === undefined || !activeTabId">
    <div class="p-2 bg-background pl-4 border-b">
      <Breadcrumb>
        <BreadcrumbList class="sm:gap-0.5 gap-0.5">
          <BreadcrumbItem class="text-sm">
            <BreadcrumbPage>&nbsp;</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </template>
  <template v-else>
    <div class="p-2 bg-background pl-4 border-b">
      <Breadcrumb>
        <BreadcrumbList class="sm:gap-0.5 gap-0.5">
          <template v-for="(item, index) in filePath" :key="item.id">
            <BreadcrumbItem class="text-sm">
              <BreadcrumbPage v-if="index === filePath.length - 1" class="flex items-center gap-1">
                <Icon
                  :name="getFileIcon(item.name)"
                  class="size-4"
                />
                {{ item.name }}
              </BreadcrumbPage>
              <BreadcrumbLink v-else href="#">
                {{ item.name }}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="index !== filePath.length - 1" />
          </template>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </template>
</template>
