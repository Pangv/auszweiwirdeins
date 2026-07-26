<template>
  <div v-if="src"
    class="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-2 sm:p-4"
    @click="$emit('click')" @touchstart="$emit('touchstart', $event)" @touchend="$emit('touchend', $event)">
    <button
      class="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 text-white text-3xl sm:text-4xl font-bold hover:text-accent transition-colors w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center"
      @click.stop="$emit('close')">
      ✕
    </button>
    <div class="flex flex-col items-center w-full max-w-2xl px-1 sm:px-4">
      <img :src="src" class="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain rounded-lg" />

      <div v-if="photo" class="mt-3 sm:mt-4 text-center w-full">
        <p v-if="getPhotoDateLabel(photo)" class="text-white text-xs sm:text-sm mb-1 break-words px-2">
          📷 {{ getPhotoDateLabel(photo) }}
        </p>
        <p v-if="getPhotoSizeLabel(photo)" class="text-white/50 text-xs">
          {{ getPhotoSizeLabel(photo) }}
        </p>
      </div>

      <button
        class="mt-4 sm:mt-6 bg-primary text-secondary font-display px-6 sm:px-8 py-3 sm:py-2 rounded-full hover:bg-accent transition-colors w-full sm:w-auto text-sm sm:text-base"
        @click.stop="$emit('download', getFilenameFromUrl(src))">
        ⬇️ Original herunterladen
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Photo } from '../types/gallery'
import { getPhotoDateLabel, getPhotoSizeLabel, getFilenameFromUrl } from '../utils/format'

defineProps<{
  src: string | null
  photo: Photo | null
}>()

defineEmits<{
  close: []
  download: [filename: string]
  touchstart: [e: TouchEvent]
  touchend: [e: TouchEvent]
  click: []
}>()
</script>