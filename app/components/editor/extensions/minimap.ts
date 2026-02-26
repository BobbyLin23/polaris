import { showMinimap } from '@replit/codemirror-minimap'

function createMinimap() {
  const dom = document.createElement('div')
  return { dom }
}

export function minimap() {
  return [
    showMinimap.compute(['doc'], () => {
      return {
        create: createMinimap,
      }
    }),
  ]
}
