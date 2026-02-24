<script lang="ts" setup>
import { cn } from '~/lib/utils'

const activeView = ref<'editor' | 'preview'>('editor')
</script>

<template>
  <div class="h-full flex flex-col">
    <nav class="h-8.75 flex items-center bg-sidebar border-b">
      <Tab
        label="Code"
        :is-active="activeView === 'editor'"
        @click="() => { activeView = 'editor' }"
      />
      <Tab
        label="Preview"
        :is-active="activeView === 'preview'"
        @click="() => { activeView = 'preview' }"
      />
      <div class="flex-1 flex justify-end h-full">
        <div class="flex items-center gap-1.5 h-full px-3 cursor-pointer text-muted-foreground border-l hover:bg-accent/30">
          <Icon name="mdi:github" class="size-3.5" />
          <span class="text-sm">Export</span>
        </div>
      </div>
    </nav>
    <div class="flex-1 relative">
      <div :class="cn('absolute inset-0', activeView === 'editor' ? 'visible' : 'invisible')">
        <div>Editor</div>
      </div>
      <div :class="cn('absolute inset-0', activeView === 'preview' ? 'visible' : 'invisible')">
        <div>Preview</div>
      </div>
    </div>
  </div>
</template>
