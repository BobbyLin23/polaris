<script lang="ts" setup>
import type { Extension } from '@codemirror/state'
import { indentWithTab } from '@codemirror/commands'
import { Compartment } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView, keymap } from '@codemirror/view'
import { indentationMarkers } from '@replit/codemirror-indentation-markers'
import { customSetup } from './extensions/custom-setup'
import { getLanguageExtension } from './extensions/language-extension'
import { minimap } from './extensions/minimap'
import { customTheme } from './extensions/theme'

const props = withDefaults(
  defineProps<{
    initialValue?: string
    fileName: string
  }>(),
  {
    initialValue: '',
  },
)

const emits = defineEmits<{
  (e: 'change', value: string): void
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const viewRef = ref<EditorView | null>(null)

const languageCompartment = new Compartment()

const baseExtensions: Extension[] = [
  oneDark,
  customTheme,
  customSetup,
  keymap.of([indentWithTab]),
  minimap(),
  indentationMarkers(),
  EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      emits('change', update.state.doc.toString())
    }
  }),
]

onMounted(() => {
  if (!editorRef.value) {
    return
  }

  const view = new EditorView({
    doc: props.initialValue,
    parent: editorRef.value,
    extensions: [
      ...baseExtensions,
      languageCompartment.of(getLanguageExtension(props.fileName)),
    ],
  })

  viewRef.value = view
})

watch(() => props.fileName, (fileName) => {
  const view = viewRef.value
  if (!view) return

  view.dispatch({
    effects: languageCompartment.reconfigure(getLanguageExtension(fileName)),
  })
})

onUnmounted(() => {
  viewRef.value?.destroy()
})
</script>

<template>
  <div ref="editorRef" class="size-full pl-4 bg-background" />
</template>
