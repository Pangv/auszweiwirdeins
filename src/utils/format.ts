export function formatDate(value: number | string | null | undefined, style: 'long' | 'short' = 'long'): string {
  let date: Date
  if (typeof value === 'number') {
    date = new Date(value)
  } else if (typeof value === 'string') {
    date = new Date(value)
  } else {
    return ''
  }
  if (isNaN(date.getTime())) return ''

  const d = date.getDate().toString().padStart(2, '0')
  const mo = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  const h = date.getHours().toString().padStart(2, '0')
  const mi = date.getMinutes().toString().padStart(2, '0')

  if (style === 'short') return `${d}.${mo}.${y}`
  return `${d}.${mo}.${y}, ${h}:${mi}`
}

export function getPhotoDateLabel(photo: { taken_at?: string | null; created_at?: number }): string {
  if (photo.taken_at) {
    return formatDate(photo.taken_at)
  }
  if (photo.created_at) {
    return `Hochgeladen am ${formatDate(photo.created_at, 'short')}`
  }
  return ''
}

export function getPhotoSizeLabel(photo: { size?: number }): string {
  if (!photo.size) return ''
  const mb = photo.size / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${(photo.size / 1024).toFixed(0)} KB`
}

export function getFilenameFromUrl(url: string): string {
  return url.split('/').pop() ?? ''
}

export function generateCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}