<template>
  <div>
    <label
      class="inline-block cursor-pointer bg-accent text-white font-display text-xl px-8 py-3 rounded-full shadow-xl hover:scale-100 transition-transform"
      :class="{ 'opacity-50 pointer-events-none': uploading }">
      {{ uploading ? 'Lädt hoch…' : '+ Fotos hochladen' }}
      <input type="file" accept="image/*" multiple class="hidden" :disabled="uploading" @change="$emit('upload', $event)" />
    </label>

    <div v-if="uploadDone > 0 || uploadTotal > 0" class="mt-3 max-w-xs">
      <div class="bg-gray-200 rounded-full h-2 w-full">
        <div class="bg-accent h-2 rounded-full transition-all duration-300"
          :style="{ width: uploadTotal > 0 ? (uploadDone / uploadTotal) * 100 + '%' : '0%' }"></div>
      </div>
      <p v-if="uploadProgress" class="text-xs mt-1 font-bold text-primary">
        {{ uploadProgress }}
      </p>
    </div>

    <p v-if="error" class="mt-3 font-bold text-accent">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  uploading: boolean
  uploadDone: number
  uploadTotal: number
  uploadProgress: string
  error: string
  dragOver: boolean
}>()

defineEmits<{
  upload: [e: Event]
}>()
</script>