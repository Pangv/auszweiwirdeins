<template>
  <div class="min-h-screen flex flex-col">
    <div class="section-padding imx-auto flex-1">



      <div class="flex flex-col md:flex-row justify-between gap-4">

        <header>
          <h1 class="heading-huge text-primary fancy">Galerie</h1>
          <p class="mt-6 mb-8 text-lg max-w-2xl">
            Teilt eure schönsten Momente mit uns! Ladet eure Fotos hoch – so entsteht gemeinsam unser
            Hochzeitsalbum.
          </p>
        </header>
        <div v-if="isPasswordVerified" class="flex-shrink-0 self-start">
          <UploadArea :uploading="uploading" :upload-done="uploadDone" :upload-total="uploadTotal"
            :upload-progress="uploadProgress" :error="errorMsg" :drag-over="dragOver" @upload="handleUpload" />
        </div>
      </div>

      <PasswordGate v-if="!isPasswordVerified" @verified="onPasswordVerified" />


      <div v-if="isPasswordVerified" class="drop-zone hidden md:block" @dragover.prevent="onDragOver"
        @drop.prevent="onDrop" @dragleave="onDragLeave">
        <div v-if="dragOver" class="drop-active">
          📸 Fotos hier ablegen
        </div>
        <div v-else class="drop-inactive">
          📸 Fotos per Drag & Drop hier ablegen
        </div>
      </div>


      <div v-if="isPasswordVerified">

        <div class="mb-6 mt-2 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div class="flex-1 min-w-0">
            <StorageBar />
          </div>
          <div v-if="galleryCode" class="flex items-center gap-2 flex-shrink-0 relative self-start md:self-auto">
            <div class="code-badge"
              title="Dein persönlicher Code zum Bearbeiten deiner Fotos auf anderen Geräten. Klicken zum Kopieren."
              @click="copyCode">
              <span class="code-label">Code</span>
              <span class="code-value">{{ galleryCode }}</span>
            </div>
            <button v-if="!showCodeInput" class="text-xs underline opacity-70 hover:opacity-100 transition-opacity"
              @click="showCodeInput = true">
              Code eingeben?
            </button>
            <div v-else class="flex items-center gap-1">
              <input v-model="recoveryCode" type="text" class="code-input" placeholder="8-stelliger Code" maxlength="8"
                :disabled="recoveryVerifying" @keyup.enter="submitRecoveryCode" />
              <button class="code-submit" :disabled="recoveryVerifying || recoveryCode.length !== 8"
                @click="submitRecoveryCode">
                {{ recoveryVerifying ? '…' : 'OK' }}
              </button>
              <button class="text-xs underline opacity-70 hover:opacity-100" @click="showCodeInput = false">x</button>
            </div>
            <p v-if="recoveryError" class="text-xs text-accent font-bold absolute top-full mt-1">{{ recoveryError }}</p>
          </div>
          <div v-else class="flex-shrink-0">
            <button class="text-xs underline opacity-70 hover:opacity-100" @click="requestNewCode">
              Code anfordern
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-4 items-center mb-4">
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input v-model="showOnlyMine" type="checkbox" class="accent-accent w-4 h-4" />
            Nur meine Fotos
          </label>
          <div class="flex items-center gap-2">
            <span class="text-sm opacity-80">Sortieren:</span>
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

        <div v-if="loading" class="text-center py-10 text-lg opacity-80">Lade Fotos…</div>
        <div v-else-if="filteredPhotos.length === 0" class="text-center py-10 text-lg opacity-80">
          Noch keine Fotos – sei die/der Erste!
        </div>

        <div v-if="!loading && storageTotal > 0" class="mb-4 px-4 py-2 rounded-lg text-sm font-mono"
          :class="isDev ? 'bg-yellow-900/40 text-yellow-200 border border-yellow-700' : 'bg-gray-100 dark:bg-gray-800'">
          <span v-if="isDev">🔧 Dev: </span>
          Speicher: {{ (storageUsed / 1024 / 1024).toFixed(1) }} /
          {{ (storageTotal / 1024 / 1024).toFixed(1) }} MB
          ({{ ((storageUsed / storageTotal) * 100).toFixed(0) }}% belegt)
        </div>

        <PhotoGrid :photos="filteredPhotos" :masonry-col-width="masonryColWidth" :selected-ids="selectedIds"
          :deleting-ids="deletingIds" :is-dev="isDev" :storage-used="storageUsed" :storage-total="storageTotal"
          :show-only-mine="showOnlyMine" :sort-field="sortField" :sort-dir="sortDir" @toggle-select="toggleSelect"
          @photo-click="wrappedPhotoClick" />

        <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 mt-8 mb-6">
          <button
            class="px-4 py-2 text-sm font-bold rounded-full border border-accent/40 transition-colors disabled:opacity-30"
            :class="currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-accent/10'"
            :disabled="currentPage === 1" @click="setPage(currentPage - 1)">
            ← Zurück
          </button>
          <span class="text-sm font-mono opacity-80">
            Seite {{ currentPage }} / {{ totalPages }}
            <span class="opacity-60">({{ totalPhotos }} Fotos)</span>
          </span>
          <button
            class="px-4 py-2 text-sm font-bold rounded-full border border-accent/40 transition-colors disabled:opacity-30"
            :class="currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-accent/10'"
            :disabled="currentPage === totalPages" @click="setPage(currentPage + 1)">
            Weiter →
          </button>
        </div>

        <BulkActionBar :selected-count="selectedIds.size" :can-delete="canDeleteAny" @download="downloadSelected"
          @delete="deleteSelected" @clear="selectedIds = new Set()" />
      </div>
    </div>



    <Footer>Bitte lächeln</Footer>

    <Lightbox :src="lightboxSrc" :photo="lightboxPhoto" @close="closeLightbox" @download="downloadPhoto"
      @touchstart="onTouchStart" @touchend="onTouchEnd" @click="onLightboxClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Footer from '@/components/Footer.vue'
import PasswordGate from '@/components/PasswordGate.vue'
import StorageBar from '@/components/StorageBar.vue'
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
  initAuth, requestNewCode, recoverOwnerId, recoverByCode,
  handleUnauthorizedUpload,
} = useGalleryAuth()

const {
  photos, filteredPhotos, loading, errorMsg,
  uploading, uploadProgress, uploadDone, uploadTotal,
  deletingIds, storageUsed, storageTotal,
  showOnlyMine, sortField, sortDir,
  selectedIds, canDeleteAny, masonryColWidth, isDev,
  currentPage, totalPhotos, totalPages,
  loadPhotos, setPage, handleUpload, deleteSelected, downloadSelected, downloadPhoto,
  loadStorage, toggleSelect,
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

async function onPasswordVerified() {
  await loadPhotos()
  await loadStorage()
  if (!galleryCode.value) {
    try {
      await requestNewCode()
    } catch (e) {
      console.error('Code-Erstellung fehlgeschlagen:', e)
    }
  }
}

function copyCode() {
  if (galleryCode.value) {
    navigator.clipboard.writeText(galleryCode.value).catch(() => { })
  }
}

const showCodeInput = ref(false)
const recoveryCode = ref('')
const recoveryVerifying = ref(false)
const recoveryError = ref('')

async function submitRecoveryCode() {
  if (recoveryCode.value.length !== 8) return
  recoveryVerifying.value = true
  recoveryError.value = ''
  try {
    await recoverByCode(recoveryCode.value)
    window.location.reload()
  } catch (e: unknown) {
    recoveryError.value = (e as Error).message
  } finally {
    recoveryVerifying.value = false
  }
}

function wrappedPhotoClick(photo: any) {
  if (selectedIds.value.size > 0) {
    toggleSelect(photo.id)
  } else {
    openLightbox(photo)
  }
}

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  await initAuth()
  if (isPasswordVerified.value) {
    if (!ownerId.value) {
      await recoverOwnerId()
    }
    await loadPhotos()
    await loadStorage()
    if (!galleryCode.value) {
      try {
        await requestNewCode()
      } catch (e) {
        console.error('Code-Erstellung (onMounted) fehlgeschlagen:', e)
      }
    }
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

.code-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--color-accent, #e8a87c);
  border-radius: 9999px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}

.code-badge:hover {
  background: rgba(232, 168, 124, 0.1);
}

.code-label {
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.65rem;
}

.code-value {
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--color-accent, #e8a87c);
}

.code-input {
  width: 7rem;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-family: monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.code-input:focus {
  outline: none;
  border-color: var(--color-accent, #e8a87c);
}

.code-submit {
  padding: 0.2rem 0.6rem;
  background: var(--color-accent, #e8a87c);
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
}

.code-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drop-zone {
  margin-top: 1rem;
  margin-bottom: 2rem;
  border: 2px dashed var(--color-border, #d1d5db);
  border-radius: 1rem;
  transition: border-color 0.2s, background 0.2s;
  cursor: default;
}

.drop-zone:hover {
  border-color: var(--color-accent, #e8a87c);
}

.drop-active {
  padding: 3rem 1rem;
  text-align: center;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-accent, #e8a87c);
  background: rgba(232, 168, 124, 0.1);
  border-radius: 1rem;
}

.drop-inactive {
  padding: 1.5rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-muted, #6b7280);
}
</style>
