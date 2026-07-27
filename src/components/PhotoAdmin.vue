<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PhotoGrid from './PhotoGrid.vue'
import BulkActionBar from './BulkActionBar.vue'
import { usePhotoManagement } from '../composables/usePhotoManagement'
import type { Photo } from '@/types/gallery.ts'


const adminPassword = ref('')
const dummyOwnerId = ref('') // im Admin-Modus ungenutzt

const {
  filteredPhotos,
  loading,
  errorMsg,
  deletingIds,
  selectedIds,
  canDeleteAny,
  masonryColWidth,
  isDev,
  currentPage,
  totalPhotos,
  totalPages,
  loadPhotos,
  setPage,
  deleteSelected,
  downloadSelected,
  toggleSelect,
} = usePhotoManagement(adminPassword, dummyOwnerId, true)

onMounted(loadPhotos)
</script>

<template>
  <section>
    <h2 class="text-4xl font-extrabold mb-8 text-secondary border-b-4 border-red-500 inline-block">
      Galerie-Verwaltung
    </h2>

    <div class="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-2xl max-w-md">
      <label class="block text-xs font-bold uppercase text-red-700 mb-2">
        Admin-Passwort (zum Löschen erforderlich)
      </label>
      <input v-model="adminPassword" type="password" placeholder="Passwort eingeben…" autocomplete="off"
        class="w-full px-4 py-2 rounded-lg border-2 border-red-300 focus:border-red-500 focus:outline-none font-mono" />
    </div>

    <div v-if="errorMsg" class="mb-4 p-3 bg-red-100 text-red-800 rounded-xl text-sm whitespace-pre-line">
      {{ errorMsg }}
    </div>

    <div v-if="loading" class="text-center py-10 text-lg opacity-70">Lade Fotos…</div>
    <div v-else-if="filteredPhotos.length === 0" class="text-center py-10 text-lg opacity-70">
      Keine Fotos in der Galerie.
    </div>

    <PhotoGrid v-else :photos="filteredPhotos" :masonry-col-width="masonryColWidth" :selected-ids="selectedIds"
      :deleting-ids="deletingIds" :is-dev="isDev" :storage-used="0" :storage-total="0" :show-only-mine="false"
      sort-field="created_at" sort-dir="desc" :admin-mode="true" @toggle-select="toggleSelect"
      @photo-click="(photo: Photo) => toggleSelect(photo.id)" />

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 mt-8 mb-6">
      <button
        class="px-4 py-2 text-sm font-bold rounded-full border border-accent/40 transition-colors disabled:opacity-30"
        :disabled="currentPage === 1" @click="setPage(currentPage - 1)">
        ← Zurück
      </button>
      <span class="text-sm font-mono opacity-70">
        Seite {{ currentPage }} / {{ totalPages }}
        <span class="opacity-50">({{ totalPhotos }} Fotos)</span>
      </span>
      <button
        class="px-4 py-2 text-sm font-bold rounded-full border border-accent/40 transition-colors disabled:opacity-30"
        :disabled="currentPage === totalPages" @click="setPage(currentPage + 1)">
        Weiter →
      </button>
    </div>

    <BulkActionBar :selected-count="selectedIds.size" :can-delete="canDeleteAny" @download="downloadSelected"
      @delete="deleteSelected" @clear="selectedIds = new Set()" />
  </section>
</template>
