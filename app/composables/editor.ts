export function useEditor(projectId: string) {
  const store = useEditorStore()

  const tabState = computed(() => store.getTabState(projectId))

  function openFile(fileId: string, options: { pinned: boolean }) {
    store.openFile(projectId, fileId, options)
  }

  function closeTab(fileId: string) {
    store.closeTab(projectId, fileId)
  }

  function closeAllTabs() {
    store.closeAllTabs(projectId)
  }

  function setActiveTab(fileId: string) {
    store.setActiveTab(projectId, fileId)
  }

  return {
    openTabs: computed(() => tabState.value.openTabs),
    activeTabId: computed(() => tabState.value.activeTabId),
    previewTabId: computed(() => tabState.value.previewTabId),
    openFile,
    closeTab,
    closeAllTabs,
    setActiveTab,
  }
}
