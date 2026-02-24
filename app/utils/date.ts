import { formatDistanceToNow } from 'date-fns'

export function formatTimestamp(timestamp: number) {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  })
}
