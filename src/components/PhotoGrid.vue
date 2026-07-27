<template>
  <div class="w-full">
    <!-- Mobile: select-mode toggle button -->
    <div v-if="isMobile" class="flex justify-end mb-2">
      <button class="px-4 py-1.5 rounded-full text-sm font-display transition-colors"
        :class="selectMode ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700'" @click="selectMode = !selectMode">
        {{ selectMode ? 'Fertig' : 'Auswählen' }}
      </button>
    </div>

    <!-- Mobile: 3-column square grid (Instagram style) -->
    <div v-if="isMobile" class="grid grid-cols-3 gap-1">
      <div v-for="photo in photos" :key="photo.id"
        class="relative aspect-square overflow-hidden bg-gray-100 transition-all duration-300"
        :class="{ 'opacity-40 scale-95': deletingIds.has(photo.id) }" @click="onMobilePhotoClick(photo)">
        <img :src="`${API}/uploads/thumbs/${photo.thumb}`" :alt="`Foto ${photo.id}`" loading="lazy" decoding="async"
          class="w-full h-full object-cover" />
        <!-- Selection indicator in select mode -->
        <div v-if="selectMode"
          class="absolute top-1 right-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
          :class="selectedIds.has(photo.id)
            ? 'bg-accent border-accent text-white'
            : 'bg-black/30 border-white'">
          <span v-if="selectedIds.has(photo.id)" class="text-xs">✓</span>
        </div>
      </div>
    </div>

    <!-- Tablet/Desktop: masonry with checkboxes and info overlay -->
    <MasonryWall v-else :items="photos" :column-width="masonryColWidth" :gap="16" :ssr-columns="2" class="w-full">
      <template #default="{ item: photo }">
        <div :key="photo.id" class="mb-2 rounded shadow-lg bg-white overflow-hidden transition-all duration-300"
          :class="{ 'opacity-40 scale-95': deletingIds.has(photo.id) }">
          <div class="relative">
            <img :src="`${API}/uploads/thumbs/${photo.thumb}`" :alt="`Foto ${photo.id}`" loading="lazy" decoding="async"
              class="w-full h-auto block cursor-pointer hover:opacity-95 transition-opacity"
              @click="$emit('photoClick', photo)" />
            <input type="checkbox" :checked="selectedIds.has(photo.id)"
              class="absolute top-2 left-2 w-5 h-5 accent-accent cursor-pointer" @click.stop
              @change="$emit('toggleSelect', photo.id)" />

            <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1">
              <div class="flex justify-between">
                <span>⬆️ {{ formatDate(photo.created_at, 'short') }}</span>
                <span>{{ getPhotoSizeLabel(photo) }}</span>
              </div>
              <div v-if="photo.taken_at" class="flex justify-between">
                <span>📷 {{ formatDate(photo.taken_at, 'short') }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </MasonryWall>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { Photo } from '../types/gallery'
import { MasonryWall } from '@yeger/vue-masonry-wall'
import { API } from '../services/galleryApi'
import { formatDate, getPhotoSizeLabel } from '../utils/format'

const props = defineProps<{
  photos: Photo[]
  masonryColWidth: number
  selectedIds: Set<string>
  deletingIds: Set<string>
  isDev: boolean
  storageUsed: number
  storageTotal: number
  showOnlyMine: boolean
  sortField: string
  sortDir: string
}>()

const emit = defineEmits<{
  toggleSelect: [id: string]
  photoClick: [photo: Photo]
}>()

// --- Breakpoint detection (mini useMediaQuery, matches Tailwind's `md`) ---
const isMobile = ref(false)
const selectMode = ref(false)

let mql: MediaQueryList | null = null
const onChange = (e: MediaQueryListEvent) => {
  isMobile.value = !e.matches
}

onMounted(() => {
  mql = window.matchMedia('(min-width: 768px)')
  isMobile.value = !mql.matches
  mql.addEventListener('change', onChange)
})

onBeforeUnmount(() => {
  mql?.removeEventListener('change', onChange)
})

// --- Mobile interaction ---
function onMobilePhotoClick(photo: Photo) {
  if (selectMode.value) {
    emit('toggleSelect', photo.id)
  } else {
    emit('photoClick', photo) // opens lightbox with dates/size info
  }
}
</script>
