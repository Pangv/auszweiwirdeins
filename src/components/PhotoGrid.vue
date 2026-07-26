<template>
  <MasonryWall :items="photos" :column-width="masonryColWidth" :gap="16" :ssr-columns="2" class="w-full">
    <template #default="{ item: photo }">
      <div :key="photo.id" class="mb-2 rounded shadow-lg bg-white overflow-hidden transition-all duration-300"
        :class="{ 'opacity-40 scale-95': deletingIds.has(photo.id) }">
        <div class="relative">
          <img :src="`${API}/uploads/thumbs/${photo.thumb}`" :alt="`Foto ${photo.id}`" loading="lazy"
            decoding="async" class="w-full h-auto block cursor-pointer hover:opacity-95 transition-opacity"
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
</template>

<script setup lang="ts">
import type { Photo } from '../types/gallery'
import { MasonryWall } from '@yeger/vue-masonry-wall'
import { API } from '../services/galleryApi'
import { formatDate, getPhotoSizeLabel } from '../utils/format'

defineProps<{
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

defineEmits<{
  toggleSelect: [id: string]
  photoClick: [photo: Photo]
}>()
</script>