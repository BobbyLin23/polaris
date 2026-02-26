interface TabState {
  openTabs: string[]
  activeTabId: string | null
  previewTabId: string | null
}

const defaultTabState: TabState = {
  openTabs: [],
  activeTabId: null,
  previewTabId: null,
}

export const useEditorStore = defineStore('editor', () => {
  const tabs = ref(new Map<string, TabState>())

  function getTabState(projectId: string): TabState {
    return tabs.value.get(projectId) ?? defaultTabState
  }

  function openFile(
    projectId: string,
    fileId: string,
    options: { pinned: boolean },
  ) {
    const newTabs = new Map(tabs.value)
    const state = newTabs.get(projectId) ?? defaultTabState
    const { openTabs, previewTabId } = state
    const isOpen = openTabs.includes(fileId)

    if (!isOpen && !options.pinned) {
      const newOpenTabs = previewTabId
        ? openTabs.map(id => (id === previewTabId ? fileId : id))
        : [...openTabs, fileId]

      newTabs.set(projectId, {
        openTabs: newOpenTabs,
        activeTabId: fileId,
        previewTabId: fileId,
      })
      tabs.value = newTabs
      return
    }

    if (!isOpen && options.pinned) {
      newTabs.set(projectId, {
        ...state,
        openTabs: [...openTabs, fileId],
        activeTabId: fileId,
      })
      tabs.value = newTabs
      return
    }

    const shouldPin = options.pinned && previewTabId === fileId
    newTabs.set(projectId, {
      ...state,
      activeTabId: fileId,
      previewTabId: shouldPin ? null : previewTabId,
    })
    tabs.value = newTabs
  }

  function closeTab(projectId: string, fileId: string) {
    const newTabs = new Map(tabs.value)
    const state = newTabs.get(projectId) ?? defaultTabState
    const { openTabs, activeTabId, previewTabId } = state
    const tabIndex = openTabs.indexOf(fileId)

    if (tabIndex === -1)
      return

    const filteredTabs = openTabs.filter(id => id !== fileId)

    let newActiveTabId: string | null = activeTabId
    if (activeTabId === fileId) {
      if (filteredTabs.length === 0) {
        newActiveTabId = null
      }
      else if (tabIndex >= filteredTabs.length) {
        newActiveTabId = filteredTabs[filteredTabs.length - 1] ?? null
      }
      else {
        newActiveTabId = filteredTabs[tabIndex] ?? null
      }
    }

    newTabs.set(projectId, {
      openTabs: filteredTabs,
      activeTabId: newActiveTabId,
      previewTabId: previewTabId === fileId ? null : previewTabId,
    })
    tabs.value = newTabs
  }

  function closeAllTabs(projectId: string) {
    const newTabs = new Map(tabs.value)
    newTabs.set(projectId, defaultTabState)
    tabs.value = newTabs
  }

  function setActiveTab(projectId: string, fileId: string) {
    const newTabs = new Map(tabs.value)
    const state = newTabs.get(projectId) ?? defaultTabState
    newTabs.set(projectId, { ...state, activeTabId: fileId })
    tabs.value = newTabs
  }

  return {
    tabs,
    getTabState,
    openFile,
    closeTab,
    closeAllTabs,
    setActiveTab,
  }
})
