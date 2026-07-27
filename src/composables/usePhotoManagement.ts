import { ref, computed } from 'vue'
import type { Photo } from '../types/gallery'
import {
  API,
  loadPhotos as apiLoadPhotos,
  uploadFiles,
  deletePhotos,
  deletePhotosAsAdmin,
  loadStorage as apiLoadStorage,
  downloadSingle,
  downloadBulk,
} from '../services/galleryApi'
import heic2any from 'heic2any'
import exifr from 'exifr'

const PAGE_SIZE = 100

export function usePhotoManagement(
  password: { value: string },
  ownerId: { value: string },
  adminMode = false,
) {
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

  // Download-States
  const downloadingIds = ref<Set<string>>(new Set())
  const downloadingBulk = ref(false)

  const showOnlyMine = ref(false)
  const sortField = ref<'taken_at' | 'created_at'>('taken_at')
  const sortDir = ref<'asc' | 'desc'>('desc')

  const selectedIds = ref<Set<string>>(new Set())

  const currentPage = ref(1)
  const totalPhotos = ref(0)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalPhotos.value / PAGE_SIZE)))

  const isDev = import.meta.env.DEV

  const masonryColWidth = computed(() => {
    if (typeof window === 'undefined') return 280
    return window.innerWidth < 640 ? 110 : 280
  })

  const filteredPhotos = computed<Photo[]>(() => {
    let result = [...photos.value]
    if (showOnlyMine.value && !adminMode) {
      result = result.filter((p) => p.owner_id === ownerId.value)
    }
    result.sort((a, b) => {
      if (sortField.value === 'taken_at') {
        const dateA = a.taken_at ?? null
        const dateB = b.taken_at ?? null
        if (dateA === null && dateB === null) return 0
        if (dateA === null) return 1
        if (dateB === null) return -1
        return sortDir.value === 'desc' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB)
      } else {
        return sortDir.value === 'desc' ? b.created_at - a.created_at : a.created_at - b.created_at
      }
    })
    return result
  })

  const canDeleteAny = computed<boolean>(() => {
    if (adminMode) return selectedIds.value.size > 0 && !!password.value
    if (isDev) return selectedIds.value.size > 0
    return photos.value.some((p) => selectedIds.value.has(p.id) && p.owner_id === ownerId.value)
  })

  const isDownloading = computed(() => downloadingIds.value.size > 0 || downloadingBulk.value)

  async function loadPhotos(): Promise<void> {
    loading.value = true
    errorMsg.value = ''
    try {
      const offset = (currentPage.value - 1) * PAGE_SIZE
      const data = await apiLoadPhotos(PAGE_SIZE, offset)
      photos.value = data.photos ?? []
      totalPhotos.value = data.total
    } catch (e: unknown) {
      console.error('loadPhotos:', e)
      errorMsg.value = 'Fotos konnten nicht geladen werden.'
    } finally {
      loading.value = false
    }
  }

  function setPage(page: number): void {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return
    currentPage.value = page
    selectedIds.value = new Set()
    loadPhotos()
  }

  async function handleUpload(e: Event): Promise<void> {
    if (adminMode) return
    const input = e.target as HTMLInputElement
    const files = input.files
    if (!files || files.length === 0) return

    uploading.value = true
    errorMsg.value = ''
    uploadProgress.value = ''
    uploadDone.value = 0
    uploadTotal.value = files.length

    try {
      const metaDates: Record<string, string> = {}
      const fileArray = await Promise.all(
        Array.from(files).map(async (file) => {
          let takenAt: string | null = null
          try {
            const exif = await exifr.parse(file, ['DateTimeOriginal'])
            if (exif?.DateTimeOriginal) {
              takenAt = exif.DateTimeOriginal.toISOString()
            }
          } catch {
            /* ignore */
          }

          if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
            const result = await heic2any({ blob: file, toType: 'image/webp', quality: 0.82 })
            const blob = Array.isArray(result) ? result[0] : result
            if (!blob) return file
            const newFile = new File([blob], file.name.replace(/\.heic$/i, '.webp'), {
              type: 'image/webp',
            })
            if (takenAt) metaDates[newFile.name] = takenAt
            return newFile
          }
          if (takenAt) metaDates[file.name] = takenAt
          return file
        }),
      )
      const count = await uploadFiles(
        fileArray,
        metaDates,
        password.value,
        ownerId.value,
        (done) => {
          uploadDone.value = done
        },
      )
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

  // === NEU: Einzeldownload über API ===
  async function downloadPhoto(photo: Photo): Promise<void> {
    if (downloadingIds.value.has(photo.id)) return

    downloadingIds.value = new Set([...downloadingIds.value, photo.id])
    errorMsg.value = ''

    try {
      await downloadSingle(photo.id, photo.filename.replace(/\.webp$/, '') + '.webp', ownerId.value)
    } catch (e: unknown) {
      console.error('Download fehlgeschlagen:', e)
      errorMsg.value = `Download "${photo.filename}" fehlgeschlagen.`
    } finally {
      const next = new Set(downloadingIds.value)
      next.delete(photo.id)
      downloadingIds.value = next
    }
  }

  // === NEU: Bulk-ZIP-Download ===
  async function downloadSelected(): Promise<void> {
    const ids = Array.from(selectedIds.value)
    if (ids.length === 0) return

    if (ids.length === 1) {
      // Einzelnes Foto direkt laden
      const photo = photos.value.find((p) => p.id === ids[0])
      if (photo) {
        await downloadPhoto(photo)
        return
      }
    }

    // Mehrere Fotos als ZIP
    downloadingBulk.value = true
    errorMsg.value = ''

    try {
      await downloadBulk(ids, ownerId.value)
      // Optional: Auswahl nach erfolgreichem Download leeren
      // selectedIds.value = new Set()
    } catch (e: unknown) {
      console.error('Bulk-Download fehlgeschlagen:', e)
      errorMsg.value = 'ZIP-Download fehlgeschlagen.'
    } finally {
      downloadingBulk.value = false
    }
  }

  // Deprecated: Alte direkte URL-Download-Funktion entfernt
  // Falls noch direkter Zugriff auf Thumbnails/Previews nötig:
  function getPhotoUrl(photo: Photo): string {
    return `${API}/uploads/${photo.filename}`
  }

  function getThumbnailUrl(photo: Photo): string {
    return `${API}/thumbs/${photo.thumb}`
  }

  async function deleteSelected(): Promise<void> {
    const ids = Array.from(selectedIds.value)
    if (ids.length === 0) return
    if (!confirm(`${ids.length} Foto(s) wirklich löschen?`)) return

    deletingIds.value = new Set(ids)
    selectedIds.value = new Set()

    try {
      const result = adminMode
        ? await deletePhotosAsAdmin(ids, password.value)
        : await deletePhotos(ids, ownerId.value, password.value)

      await new Promise((r) => setTimeout(r, 300))
      photos.value = photos.value.filter((p) => !result.deleted.includes(p.id))
      deletingIds.value = new Set()
      if (!adminMode) await loadStorage()

      if (result.failed.length > 0) {
        const reasons = result.failed.map((f) => `${f.id}: ${f.reason}`).join('\n')
        errorMsg.value = `${result.failed.length} Foto(s) konnten nicht gelöscht werden:\n${reasons}`
      }
    } catch (e: unknown) {
      deletingIds.value = new Set()
      if (adminMode && e instanceof Error && e.message === 'UNAUTHORIZED') {
        errorMsg.value = 'Admin-Passwort falsch.'
      } else {
        errorMsg.value = (e as Error).message
      }
    }
  }

  function photoBelongsToUser(photo: Photo): boolean {
    if (adminMode) return true
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
    downloadingIds,
    downloadingBulk,
    isDownloading,
    storageUsed,
    storageTotal,
    showOnlyMine,
    sortField,
    sortDir,
    selectedIds,
    canDeleteAny,
    masonryColWidth,
    isDev,
    currentPage,
    totalPhotos,
    totalPages,
    PAGE_SIZE,
    loadPhotos,
    setPage,
    handleUpload,
    deleteSelected,
    downloadPhoto,
    downloadSelected,
    loadStorage,
    toggleSelect,
    handlePhotoClick,
    photoBelongsToUser,
    getPhotoUrl,
    getThumbnailUrl,
  }
}
