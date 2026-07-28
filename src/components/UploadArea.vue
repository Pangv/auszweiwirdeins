<template>
  <div>
    <label
      class="w-full inline-block cursor-pointer bg-accent text-white font-display text-xl px-8 py-3 rounded-full shadow-xl hover:scale-100 transition-transform"
      :class="{ 'opacity-50 pointer-events-none': uploading }">
      {{ uploading ? 'Lädt hoch…' : '+ Fotos hochladen' }}
      <input type="file" accept="image/*" multiple class="hidden" :disabled="uploading"
        @change="$emit('upload', $event)" />
    </label>

    <div v-if="uploading" class="mt-3">
      <div class="spinner"></div>
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

<style scoped>
.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 3px solid var(--color-border, #d1d5db);
  border-top-color: var(--color-accent, #e8a87c);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
