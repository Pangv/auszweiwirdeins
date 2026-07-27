<template>
  <!-- Mobile: floating pill (unchanged, it works) -->
  <div v-if="selectedCount > 0"
    class="fixed bottom-8 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col sm:hidden items-stretch gap-2 bg-white border-2 border-accent/30 rounded-2xl shadow-2xl px-4 py-3 w-[calc(100%-2rem)] max-w-sm">
    <span class="text-sm font-bold text-center whitespace-nowrap">{{ selectedCount }} ausgewählt</span>
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

  <!-- Desktop: slim top toolbar -->
  <Transition name="slide-down">
    <div v-if="selectedCount > 0"
      class="hidden sm:flex fixed top-0 left-0 right-0 z-40 items-center gap-6 bg-accent text-white px-6 py-2.5 shadow-lg">
      <span class="text-sm font-bold whitespace-nowrap">{{ selectedCount }} ausgewählt</span>

      <div class="flex items-center gap-2 ml-auto">
        <button
          class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm bg-white/15 hover:bg-white/25 transition-colors"
          @click="$emit('download')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
          </svg>
          Herunterladen
        </button>
        <button v-if="canDelete"
          class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm bg-red-500/90 hover:bg-red-600 transition-colors"
          @click="$emit('delete')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
          </svg>
          Löschen
        </button>
        <button
          class="text-sm text-white/70 hover:text-white transition-colors underline underline-offset-2"
          @click="$emit('clear')">
          Abwählen
        </button>
      </div>
    </div>
  </Transition>
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

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
