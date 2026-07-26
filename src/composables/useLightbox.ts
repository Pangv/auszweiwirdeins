import { ref } from 'vue'
import type { Photo } from '../types/gallery'
import { API } from '../services/galleryApi'

export function useLightbox(filteredPhotos: { value: Photo[] }) {
  const lightboxSrc = ref<string | null>(null)
  const lightboxPhoto = ref<Photo | null>(null)
  let touchStartX = 0
  let touchStartY = 0
  let touchSwiped = false

  function openLightbox(photo: Photo): void {
    lightboxSrc.value = `${API}/uploads/${photo.filename}`
    lightboxPhoto.value = photo
  }

  function closeLightbox(): void {
    lightboxSrc.value = null
    lightboxPhoto.value = null
  }

  function navigatePhoto(dir: 'prev' | 'next'): void {
    if (!lightboxSrc.value) return
    const current = filteredPhotos.value.findIndex(
      (p) => `${API}/uploads/${p.filename}` === lightboxSrc.value,
    )
    if (current === -1) return
    const next =
      dir === 'next'
        ? (current + 1) % filteredPhotos.value.length
        : (current - 1 + filteredPhotos.value.length) % filteredPhotos.value.length
    const nextPhoto = filteredPhotos.value[next]
    if (nextPhoto) {
      lightboxSrc.value = `${API}/uploads/${nextPhoto.filename}`
      lightboxPhoto.value = nextPhoto
    }
  }

  function onTouchStart(e: TouchEvent): void {
    const t = e.touches[0]
    if (!t) return
    touchStartX = t.clientX
    touchStartY = t.clientY
    touchSwiped = false
  }

  function onTouchEnd(e: TouchEvent): void {
    const t = e.changedTouches[0]
    if (!t) return
    const dx = t.clientX - touchStartX
    const dy = t.clientY - touchStartY
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      touchSwiped = true
      navigatePhoto(dx > 0 ? 'prev' : 'next')
    }
  }

  function onLightboxClick(): void {
    if (touchSwiped) return
    closeLightbox()
  }

  function onKeydown(e: KeyboardEvent): void {
    if (!lightboxSrc.value) return
    switch (e.key) {
      case 'Escape':
        closeLightbox()
        break
      case 'ArrowRight':
        navigatePhoto('next')
        break
      case 'ArrowLeft':
        navigatePhoto('prev')
        break
    }
  }

  return {
    lightboxSrc,
    lightboxPhoto,
    openLightbox,
    closeLightbox,
    navigatePhoto,
    onTouchStart,
    onTouchEnd,
    onLightboxClick,
    onKeydown,
  }
}