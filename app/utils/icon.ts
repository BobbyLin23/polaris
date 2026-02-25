import type { LucideIcon } from 'lucide-vue-next'
import { AlertCircleIcon, GithubIcon, GlobeIcon, Loader2Icon } from 'lucide-vue-next'
import { getIconForFile, getIconForFolder } from 'vscode-icons-js'
import { h } from 'vue'

export function getProjectIcon(project: SelectProject) {
  const classMap: Record<'completed' | 'failed' | 'importing', {
    component: LucideIcon
    class: string
  }> = {
    completed: { component: GithubIcon, class: 'size-3.5 text-muted-foreground' },
    failed: { component: AlertCircleIcon, class: 'size-3.5 text-red-500' },
    importing: { component: Loader2Icon, class: 'size-3.5 text-blue-500 animate-spin' },
  }

  if (!project.importStatus) {
    return h(GlobeIcon, { class: 'size-3.5 text-gray-500' })
  }

  const config = classMap[project.importStatus]

  return h(config.component, { class: config.class })
}

export function getFileIcon(fileName: string) {
  const raw = getIconForFile(fileName)
  if (!raw)
    return 'vscode-icons:default-file'
  const name = raw.replace('.svg', '').replace(/_/g, '-')
  return `vscode-icons:${name}`
}

export function getFolderIconName(folderName: string) {
  const raw = getIconForFolder(folderName)
  if (!raw)
    return 'vscode-icons:folder'
  const name = raw.replace('.svg', '').replace(/_/g, '-')
  return `vscode-icons:${name}`
}
