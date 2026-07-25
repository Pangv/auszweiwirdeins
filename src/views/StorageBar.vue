<!-- src/components/StorageBar.vue -->
<template>
  <div class="storage-bar" v-if="stats">
    <div class="stats-row">
      <span class="photos-count">
        {{ formatNumber(stats.totalPhotos) }} Fotos
      </span>
      <span class="size-info">
        {{ stats.totalSizeGb.toFixed(2) }} / {{ stats.maxSizeGb }} GB
      </span>
      <span class="percent" :class="{ warning: stats.usedPercent > 80, danger: stats.usedPercent > 95 }">
        {{ stats.usedPercent }}%
      </span>
    </div>

    <div class="progress-track">
      <div class="progress-fill" :style="{ width: `${Math.min(stats.usedPercent, 100)}%` }"
        :class="{ warning: stats.usedPercent > 80, danger: stats.usedPercent > 95 }" />
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
import { useStats } from './useStats'

const { stats, error } = useStats()
// Oder ohne Polling: const { stats, error, refresh } = useStats(0) + manuell refresh

function formatNumber(n: number): string {
  return n.toLocaleString('de-DE')
}
</script>

<style scoped>
.storage-bar {
  width: 280px;
  font-size: 0.85rem;
  color: var(--text-muted, #666);
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
  gap: 8px;
}

.photos-count {
  font-weight: 500;
  color: var(--text-color, #222);
}

.size-info {
  flex: 1;
  text-align: right;
  opacity: 0.8;
}

.percent {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  min-width: 3em;
  text-align: right;
}

.percent.warning {
  color: #c8810a;
}

.percent.danger {
  color: #dc2626;
}

.progress-track {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  /* emerald-500 */
  border-radius: 3px;
  transition: width 0.5s ease, background 0.3s ease;
}

.progress-fill.warning {
  background: #f59e0b;
}

.progress-fill.danger {
  background: #ef4444;
}

.error {
  color: #dc2626;
  cursor: help;
}

.loading {
  opacity: 0.5;
}
</style>
