import { ref, computed } from 'vue'
import type { Photo } from '../types/gallery'
import { API, loadPhotos as apiLoadPhotos, uploadFiles, deletePhotos, loadStorage as apiLoadStorage } from '../services/galleryApi'

export function usePhotoManagement(password: { value: string }, ownerId: { value: string }) {
  const photos = ref<Photo[]>([])
  const loading = ref(false)
  const errorMsg = ref('')

  const uploading = ref(false)
  const uploadProgress = ref('')
  const uploadDone = ref(0)
  const uploadTotal = ref(0)

  const deletingIds = ref<Set<string>>(new Set())
  const storageUsed = ref(0)
  const storageTotal = ref(0)

  const showOnlyMine = ref(false)
  const sortField = ref<'taken_at' | 'created_at'>('taken_at')
  const sortDir = ref<'asc' | 'desc'>('desc')

  const selectedIds = ref<Set<string>>(new Set())

  const isDev = import.meta.env.DEV

  const masonryColWidth = computed(() => {
    if (typeof window === 'undefined') return 280
    return window.innerWidth < 640 ? 110 : 280
  })

  const filteredPhotos = computed<Photo[]>(() => {
    let result = [...photos.value]
    if (showOnlyMine.value) {
      result = result.filter((p) => p.owner_id === ownerId.value)
    }
    result.sort((a, b) => {
      if (sortField.value === 'taken_at') {
        const dateA = a.taken_at ?? null
        const dateB = b.taken_at ?? null
        if (dateA === null && dateB === null) return 0
        if (dateA === null) return 1
        if (dateB === null) return -1
        return sortDir.value === 'desc'
          ? dateB.localeCompare(dateA)
          : dateA.localeCompare(dateB)
      } else {
        return sortDir.value === 'desc'
          ? b.created_at - a.created_at
          : a.created_at - b.created_at
      }
    })
    return result
  })

  const canDeleteAny = computed<boolean>(() => {
    if (isDev) return selectedIds.value.size > 0
    return photos.value.some(
      (p) => selectedIds.value.has(p.id) && p.owner_id === ownerId.value,
    )
  })

  async function loadPhotos(): Promise<void> {
    loading.value = true
    errorMsg.value = ''
    try {
      photos.value = await apiLoadPhotos()
    } catch (e: unknown) {
      console.error('loadPhotos:', e)
      errorMsg.value = 'Fotos konnten nicht geladen werden.'
    } finally {
      loading.value = false
    }
  }

  async function handleUpload(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement
    const files = input.files
    if (!files || files.length === 0) return

    uploading.value = true
    errorMsg.value = ''
    uploadProgress.value = ''
    uploadDone.value = 0
    uploadTotal.value = files.length

    try {
      const fileArray = Array.from(files)
      const count = await uploadFiles(fileArray, password.value, ownerId.value, (done) => {
        uploadDone.value = done
      })
      uploadProgress.value = `${count} Foto(s) hochgeladen!`
      await loadPhotos()
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'UNAUTHORIZED') throw e
      errorMsg.value = (e as Error).message
    } finally {
      uploading.value = false
      input.value = ''
      setTimeout(() => (uploadProgress.value = ''), 4000)
    }
  }

  async function loadStorage(): Promise<void> {
    const data = await apiLoadStorage(password.value)
    storageUsed.value = data.used
    storageTotal.value = data.total
  }

  function toggleSelect(id: string): void {
    const next = new Set(selectedIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedIds.value = next
  }

  function handlePhotoClick(photo: Photo): void {
    if (selectedIds.value.size > 0) {
      toggleSelect(photo.id)
    }
  }

  function downloadPhoto(filename: string): void {
    const link = document.createElement('a')
    link.href = `${API}/uploads/${filename}`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function downloadSelected(): void {
    const selected = photos.value.filter((p) => selectedIds.value.has(p.id))
    selected.forEach((photo) => downloadPhoto(photo.filename))
  }

  async function deleteSelected(): Promise<void> {
    const ids = Array.from(selectedIds.value)
    if (!confirm(`${ids.length} Foto(s) wirklich löschen?`)) return

    deletingIds.value = new Set(ids)
    selectedIds.value = new Set()

    try {
      const result = await deletePhotos(ids, ownerId.value, password.value)
      await new Promise((r) => setTimeout(r, 300))
      photos.value = photos.value.filter((p) => !result.deleted.includes(p.id))
      deletingIds.value = new Set()
      await loadStorage()

      if (result.failed.length > 0) {
        const reasons = result.failed.map((f) => `${f.id}: ${f.reason}`).join('\n')
        errorMsg.value = `${result.failed.length} Foto(s) konnten nicht gelöscht werden:\n${reasons}`
      }
    } catch (e: unknown) {
      deletingIds.value = new Set()
      errorMsg.value = (e as Error).message
    }
  }

  function photoBelongsToUser(photo: Photo): boolean {
    return photo.owner_id === ownerId.value
  }

  return {
    photos,
    filteredPhotos,
    loading,
    errorMsg,
    uploading,
    uploadProgress,
    uploadDone,
    uploadTotal,
    deletingIds,
    storageUsed,
    storageTotal,
    showOnlyMine,
    sortField,
    sortDir,
    selectedIds,
    canDeleteAny,
    masonryColWidth,
    isDev,
    loadPhotos,
    handleUpload,
    deleteSelected,
    downloadSelected,
    downloadPhoto,
    loadStorage,
    toggleSelect,
    handlePhotoClick,
    photoBelongsToUser,
  }
}