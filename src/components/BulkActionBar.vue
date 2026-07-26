<template>
  <div v-if="selectedCount > 0"
    class="fixed bottom-8 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-white border-2 border-accent/30 rounded-2xl sm:rounded-full shadow-2xl px-4 sm:px-6 py-3 w-[calc(100%-2rem)] sm:w-auto max-w-sm sm:max-w-none">
    <span class="text-sm font-bold text-center sm:text-left whitespace-nowrap">{{ selectedCount }}
      ausgewählt</span>
    <button
      class="bg-accent text-white font-display px-5 py-2 rounded-full text-sm hover:bg-accent/80 transition-colors"
      @click="$emit('download')">
      ⬇️ Herunterladen
    </button>
    <button v-if="canDelete"
      class="bg-red-500 text-white font-display px-5 py-2 rounded-full text-sm hover:bg-red-700 transition-colors"
      @click="$emit('delete')">
      ✕ Löschen
    </button>
    <button class="text-sm underline opacity-60 hover:opacity-100" @click="$emit('clear')">
      Abwählen
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedCount: number
  canDelete: boolean
}>()

defineEmits<{
  download: []
  delete: []
  clear: []
}>()
</script>