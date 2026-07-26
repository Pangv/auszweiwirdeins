<template>
  <div class="min-h-screen flex flex-col">
    <div class="section-padding max-w-6xl mx-auto flex-1">
      <h1 class="heading-huge text-primary fancy mb-10">Galerie</h1>
      <p class="mb-8 text-lg max-w-2xl">
        Teilt eure schönsten Momente mit uns! Ladet eure Fotos hoch – so entsteht gemeinsam unser
        Hochzeitsalbum.
      </p>

      <GalleryCodePrompt
        :show="showCodePrompt"
        :code-input="codeInput"
        :recovering="codeRecovering"
        @update:code-input="codeInput = $event"
        @recover="handleRecover"
        @request-new="handleRequestNew"
      />

      <PasswordPrompt
        :show="showPasswordPrompt && !!galleryCode && !isPasswordVerified"
        :password="password"
        :verifying="passwordVerifying"
        :error="passwordError"
        :mode="editingCodeMode"
        :gallery-code="galleryCode"
        :verified="isPasswordVerified"
        @update:password="password = $event"
        @update:mode="editingCodeMode = $event"
        @verify="handleVerifyPassword"
        @back="editingCodeMode = null"
      />

      <template v-if="galleryCode && isPasswordVerified">
        <div class="mb-8 p-4 border-2 border-accent/30 rounded-2xl bg-accent/5">
          <p class="font-bold uppercase opacity-50 text-xs sm:text-sm mb-1">
            Euer Zugangscode zur Galerie
          </p>
          <p class="text-2xl sm:text-3xl font-mono font-bold tracking-widest text-accent select-all break-all">
            {{ galleryCode }}
          </p>
        </div>

        <div class="relative mb-10" @dragover.prevent="onDragOver" @drop.prevent="onDrop" @dragleave="onDragLeave">
          <div v-if="dragOver"
            class="absolute inset-0 z-10 border-4 border-dashed border-accent rounded-3xl bg-accent/10 flex items-center justify-center text-lg font-display">
            Fotos hier ablegen
          </div>
          <StorageBar />
          <UploadArea
            :uploading="uploading"
            :upload-done="uploadDone"
            :upload-total="uploadTotal"
            :upload-progress="uploadProgress"
            :error="errorMsg"
            :drag-over="dragOver"
            @upload="handleUpload"
          />
        </div>

        <div class="flex flex-wrap gap-4 items-center mb-6">
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input v-model="showOnlyMine" type="checkbox" class="accent-accent w-4 h-4" />
            Nur meine Fotos
          </label>
          <div class="flex items-center gap-2">
            <span class="text-sm opacity-70">Sortieren:</span>
            <div class="flex rounded-full border border-accent/40 overflow-hidden">
              <button class="px-3 py-1 text-xs font-bold transition-colors"
                :class="sortField === 'taken_at' ? 'bg-accent text-white' : 'bg-white text-primary hover:bg-accent/10'"
                @click="sortField = 'taken_at'">
                Aufnahmedatum
              </button>
              <button class="px-3 py-1 text-xs font-bold transition-colors"
                :class="sortField === 'created_at' ? 'bg-accent text-white' : 'bg-white text-primary hover:bg-accent/10'"
                @click="sortField = 'created_at'">
                Upload-Datum
              </button>
            </div>
            <button class="text-sm opacity-70 hover:opacity-100 transition-opacity"
              @click="sortDir = sortDir === 'desc' ? 'asc' : 'desc'"
              :title="sortDir === 'desc' ? 'Neueste zuerst' : 'Älteste zuerst'">
              {{ sortDir === 'desc' ? '↓ Neueste' : '↑ Älteste' }}
            </button>
          </div>
        </div>

        <div
          class="mb-6 p-3 sm:p-4 border border-accent/20 rounded-2xl bg-accent/5 text-xs sm:text-sm text-primary/70 leading-relaxed">
          <p>🖼️ <strong>Tipp:</strong> Tippe auf ein Foto, um es in der <strong>Lightbox</strong> zu öffnen. Dort
            kannst du <strong>wischen</strong> ← → oder die <strong>Pfeiltasten</strong> zum Blättern nutzen, mit
            <strong>Esc / Tap</strong> schließen oder das <strong>Original</strong> herunterladen.
          </p>
        </div>

        <div v-if="loading" class="text-center py-10 text-lg opacity-70">Lade Fotos…</div>
        <div v-else-if="filteredPhotos.length === 0" class="text-center py-10 text-lg opacity-70">
          Noch keine Fotos – sei die/der Erste!
        </div>

        <div v-if="!loading && storageTotal > 0" class="mb-4 px-4 py-2 rounded-lg text-sm font-mono"
          :class="isDev ? 'bg-yellow-900/40 text-yellow-200 border border-yellow-700' : 'bg-gray-100 dark:bg-gray-800'">
          <span v-if="isDev">🔧 Dev: </span>
          Speicher: {{ (storageUsed / 1024 / 1024).toFixed(1) }} /
          {{ (storageTotal / 1024 / 1024).toFixed(1) }} MB
          ({{ ((storageUsed / storageTotal) * 100).toFixed(0) }}% belegt)
        </div>

        <PhotoGrid
          :photos="filteredPhotos"
          :masonry-col-width="masonryColWidth"
          :selected-ids="selectedIds"
          :deleting-ids="deletingIds"
          :is-dev="isDev"
          :storage-used="storageUsed"
          :storage-total="storageTotal"
          :show-only-mine="showOnlyMine"
          :sort-field="sortField"
          :sort-dir="sortDir"
          @toggle-select="toggleSelect"
          @photo-click="handlePhotoClick"
        />

        <BulkActionBar
          :selected-count="selectedIds.size"
          :can-delete="canDeleteAny"
          @download="downloadSelected"
          @delete="deleteSelected"
          @clear="selectedIds = new Set()"
        />
      </template>
    </div>
    <Footer>Bitte lächeln</Footer>

    <Lightbox
      :src="lightboxSrc"
      :photo="lightboxPhoto"
      @close="closeLightbox"
      @download="downloadPhoto"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
      @click="onLightboxClick"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Footer from '@/components/Footer.vue'
import StorageBar from '@/components/StorageBar.vue'
import GalleryCodePrompt from '@/components/GalleryCodePrompt.vue'
import PasswordPrompt from '@/components/PasswordPrompt.vue'
import UploadArea from '@/components/UploadArea.vue'
import PhotoGrid from '@/components/PhotoGrid.vue'
import Lightbox from '@/components/Lightbox.vue'
import BulkActionBar from '@/components/BulkActionBar.vue'
import { useGalleryAuth } from '@/composables/useGalleryAuth'
import { usePhotoManagement } from '@/composables/usePhotoManagement'
import { useLightbox } from '@/composables/useLightbox'
import { useDragDrop } from '@/composables/useDragDrop'

const {
  ownerId, galleryCode, password, isPasswordVerified,
  showCodePrompt, codeInput, codeRecovering,
  showPasswordPrompt, passwordVerifying, passwordError, editingCodeMode,
  initAuth, requestNewCode, recoverByCode, recoverOwnerId,
  verifyPassword, handleUnauthorizedUpload,
} = useGalleryAuth()

const {
  photos, filteredPhotos, loading, errorMsg,
  uploading, uploadProgress, uploadDone, uploadTotal,
  deletingIds, storageUsed, storageTotal,
  showOnlyMine, sortField, sortDir,
  selectedIds, canDeleteAny, masonryColWidth, isDev,
  loadPhotos, handleUpload, deleteSelected, downloadSelected, downloadPhoto,
  loadStorage, toggleSelect, handlePhotoClick,
} = usePhotoManagement(password, ownerId)

const {
  lightboxSrc, lightboxPhoto,
  openLightbox, closeLightbox,
  onTouchStart, onTouchEnd, onLightboxClick, onKeydown,
} = useLightbox(filteredPhotos)

const { dragOver, onDragOver, onDragLeave, onDrop } = useDragDrop((files) => {
  const fakeInput = { files } as unknown as HTMLInputElement
  handleUpload({ target: fakeInput } as unknown as Event).catch((e: Error) => {
    if (e.message === 'UNAUTHORIZED') handleUnauthorizedUpload()
  })
})

const originalPhotoClick = handlePhotoClick
function wrappedPhotoClick(photo: any) {
  if (selectedIds.value.size > 0) {
    toggleSelect(photo.id)
  } else {
    openLightbox(photo)
  }
}

async function handleRecover() {
  errorMsg.value = ''
  try {
    await recoverByCode()
    await loadPhotos()
    await loadStorage()
  } catch (e: unknown) {
    errorMsg.value = (e as Error).message
  }
}

async function handleRequestNew() {
  errorMsg.value = ''
  try {
    await requestNewCode()
    await loadPhotos()
  } catch (e: unknown) {
    errorMsg.value = (e as Error).message
  }
}

async function handleVerifyPassword() {
  const ok = await verifyPassword()
  if (ok) {
    await loadPhotos()
    await loadStorage()
  }
}

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  await initAuth()
  if (!galleryCode.value) {
    showCodePrompt.value = true
  } else {
    if (!ownerId.value) {
      await recoverOwnerId()
    }
    await loadPhotos()
    await loadStorage()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.photo-grid-move {
  transition: transform 300ms ease-out;
}
.photo-grid-leave-active {
  transition: opacity 250ms ease-out, transform 250ms ease-out;
  position: absolute;
  width: 100%;
  pointer-events: none;
}
.photo-grid-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
.photo-grid-enter-active {
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}
.photo-grid-enter-from {
  opacity: 0;
  transform: scale(0.96);
}
</style>