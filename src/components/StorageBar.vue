<template>
  <div class="storage-bar" v-if="stats">
    <div class="stats-row">
      <span class="photos-count">
        {{ formatNumber(stats.totalPhotos) }} Fotos
      </span>
      <span class="size-info">
        {{ formatSize(stats.totalSizeBytes) }} / {{ stats.maxSizeGb }} GB
      </span>
      <span class="percent" :class="{ warning: usedPercent > 80, danger: usedPercent > 95 }">
        {{ usedPercent }}%
      </span>
    </div>

    <div class="progress-track">
      <div class="progress-fill" :style="{ width: `${Math.min(usedPercent, 100)}%` }"
        :class="{ warning: usedPercent > 80, danger: usedPercent > 95 }" />
    </div>
  </div>

  <div v-else-if="error" class="storage-bar error" title="Kann Statistik nicht laden">
    ⚠️
  </div>

  <div v-else class="storage-bar loading">
    …
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStats } from '../composables/useStats'

const { stats, error } = useStats()

const usedPercent = computed(() => {
  if (!stats.value || stats.value.maxSizeBytes <= 0) return 0
  return Math.round((stats.value.totalSizeBytes / stats.value.maxSizeBytes) * 100)
})

function formatNumber(n: number): string {
  return n.toLocaleString('de-DE')
}

function formatSize(bytes: number): string {
  const mb = bytes / 1024 / 1024
  if (mb >= 1) return mb.toFixed(1) + ' MB'
  const kb = bytes / 1024
  if (kb >= 1) return kb.toFixed(0) + ' KB'
  return bytes + ' B'
}
</script>

<style scoped>
.storage-bar {
  font-size: 0.85rem;
  color: var(--text-color, #222);
}
.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
  gap: 8px;
}
.photos-count {
  font-weight: 600;
  color: #111;
}
.size-info {
  flex: 1;
  text-align: right;
  color: #374151;
  font-weight: 500;
}
.percent {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 3em;
  text-align: right;
  color: #111;
}
.percent.warning {
  color: #b45309;
}
.percent.danger {
  color: #dc2626;
}
.progress-track {
  height: 6px;
  background: #d1d5db;
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #059669;
  border-radius: 3px;
  transition: width 0.5s ease, background 0.3s ease;
}
.progress-fill.warning {
  background: #d97706;
}
.progress-fill.danger {
  background: #dc2626;
}
.error {
  color: #dc2626;
  cursor: help;
  font-weight: 600;
}
.loading {
  color: #6b7280;
  font-weight: 500;
}
</style>