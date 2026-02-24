<script lang="ts" setup>
import { formatDistanceToNow } from 'date-fns'
import { CloudCheckIcon, LoaderIcon } from 'lucide-vue-next'

const props = defineProps<{
  projectId: string
}>()

const isRenaming = ref(false)
const name = ref('')

const { data: project } = useProject(props.projectId)

const { mutate: renameProject } = useRenameProject(props.projectId)

function handleStartRename() {
  if (!project.value)
    return
  name.value = project.value.name
  isRenaming.value = true
}

function handleSubmit() {
  if (!project.value) {
    return
  }
  isRenaming.value = false
  const trimmedName = name.value.trim()
  if (!trimmedName || trimmedName === project.value.name) {
    return
  }
  renameProject({
    id: props.projectId,
    name: trimmedName,
  })
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleSubmit()
  }
  else if (e.key === 'Escape') {
    isRenaming.value = false
  }
}
</script>

<template>
  <nav class="flex justify-between items-center gap-x-2 p-2 bg-sidebar border-b">
    <div class="flex items-center gap-x-2">
      <Breadcrumb>
        <BreadcrumbList class="gap-0!">
          <BreadcrumbItem>
            <BreadcrumbLink
              class="flex items-center gap-1.5"
              as-child
            >
              <Button
                variant="ghost"
                class="w-fit! p-1.5! h-7!"
                as-child
              >
                <NuxtLink href="/">
                  <NuxtImg
                    src="/logo.svg"
                    alt="Logo"
                    :width="20"
                    :height="20"
                  />
                  <span class="text-sm font-medium font-[Poppins]">
                    Polaris
                  </span>
                </NuxtLink>
              </Button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator class="ml-0! mr-1" />
          <BreadcrumbItem>
            <input
              v-if="isRenaming"
              v-model="name"
              autofocus
              type="text"
              class="text-sm bg-transparent text-foreground outline-none focus:ring-1 focus:ring-inset focus:ring-ring font-medium max-w-40 truncate"
              @blur="handleSubmit"
              @keydown="handleKeyDown"
            >
            <BreadcrumbPage
              v-else
              class="text-sm cursor-pointer hover:text-primary font-medium max-w-40 truncate"
              @click="handleStartRename"
            >
              {{ project?.name ?? "Loading..." }}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <TooltipProvider>
        <Tooltip v-if="project?.importStatus === 'importing'">
          <TooltipTrigger as-child>
            <LoaderIcon class="size-4 text-muted-foreground animate-spin" />
          </TooltipTrigger>
          <TooltipContent>Importing...</TooltipContent>
        </Tooltip>
        <Tooltip v-else>
          <TooltipTrigger as-child>
            <CloudCheckIcon class="size-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            Saved{{ " " }}
            {{ project?.updatedAt
              ? formatDistanceToNow(
                project.updatedAt,
                { addSuffix: true },
              )
              : "Loading..." }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <div class="flex items-center gap-2">
      <UserButton />
    </div>
  </nav>
</template>
