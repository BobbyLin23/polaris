<script lang="ts" setup>
import { SparkleIcon } from 'lucide-vue-next'
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator'

const { mutate: createProject, isPending } = useCreateProject()

const openCommandDialog = ref(false)

const keys = useMagicKeys()
const ctrlK = keys['Ctrl+k']
const cmdK = keys['Cmd+k']

watch(() => ctrlK?.value, () => {
  if (ctrlK?.value) {
    openCommandDialog.value = true
  }
})

watch(() => cmdK?.value, () => {
  if (cmdK?.value) {
    openCommandDialog.value = true
  }
})

function handleCreateProject() {
  const projectName = uniqueNamesGenerator({
    dictionaries: [
      adjectives,
      animals,
      colors,
    ],
    separator: '-',
    length: 3,
  })

  createProject({
    name: projectName,
  })
}
</script>

<template>
  <ProjectsCommandDialog
    :open="openCommandDialog"
    @update:open="openCommandDialog = $event"
  />
  <div class="min-h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16">
    <div class="w-full max-w-sm mx-auto flex flex-col gap-4 items-center">
      <div class="flex justify-between gap-4 w-full items-center">
        <div class="flex items-center gap-2 w-full group/logo">
          <NuxtImg src="/logo.svg" alt="Polaris" class="size-[32px] md:size-[46px]" />
          <h1 class="text-4xl md:text-5xl font-semibold font-[Poppins]">
            Polaris
          </h1>
        </div>
      </div>

      <div class="flex flex-col gap-4 w-full">
        <div class="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            class="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
            :disabled="isPending"
            @click="handleCreateProject"
          >
            <div class="flex items-center justify-between w-full">
              <Spinner v-if="isPending" class="size-4" />
              <SparkleIcon v-else class="size-4" />
              <Kbd class="bg-accent border">
                ⌘J
              </Kbd>
            </div>
            <div>
              <span class="text-sm">
                New
              </span>
            </div>
          </Button>
          <Button
            variant="outline"
            class="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
          >
            <div class="flex items-center justify-between w-full">
              <Icon name="mdi:github" class="size-6" />
              <Kbd class="bg-accent border">
                ⌘I
              </Kbd>
            </div>
            <div>
              <span class="text-sm">
                Import
              </span>
            </div>
          </Button>
        </div>
        <ProjectsList @view-all="openCommandDialog = true" />
      </div>
    </div>
  </div>
</template>
