import { ref, onMounted, onUnmounted } from 'vue'

export interface GalleryStats {
  totalPhotos: number
  totalSizeBytes: number
  maxSizeBytes: number
  usedPercent: number
  totalSizeGb: number
  maxSizeGb: number
}

const API_URL = import.meta.env.VITE_API_URL || ''

export function useStats(pollIntervalMs = 30000) {
  const stats = ref<GalleryStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`galerie.${API_URL}/api/stats`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      if (!text) throw new Error('Empty response')
      try {
        stats.value = JSON.parse(text)
      } catch {
        throw new Error(`Invalid JSON: ${text.slice(0, 200)}`)
      }
    } catch (e: any) {
      error.value = `Stats-Fehler: ${e.message}`
      console.error('Stats fetch failed:', e)
    } finally {
      loading.value = false
    }
  }

  let interval: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    fetchStats()
    interval = setInterval(fetchStats, pollIntervalMs)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })

  return { stats, loading, error, refresh: fetchStats }
}
