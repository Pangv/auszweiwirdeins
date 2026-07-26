<template>
  <div v-if="show" class="mb-8 p-6 border-4 border-accent rounded-3xl bg-accent/10 max-w-md">
    <p class="font-bold mb-3">🔑 Zugangscode eingeben</p>
    <p class="text-sm opacity-70 mb-3">
      Hast du bereits einen Zugangscode zur Galerie? Dann gib ihn ein. Sonst fordere einen
      neuen an.
    </p>
    <div class="flex gap-2 mb-3">
      <input :value="codeInput" type="text" class="form-input uppercase flex-1"
        placeholder="8-stelliger Zugangscode" maxlength="8"
        @input="$emit('update:codeInput', ($event.target as HTMLInputElement).value)"
        @keyup.enter="$emit('recover')" />
      <button
        class="bg-accent text-white font-display px-4 py-2 rounded-full hover:bg-accent/80 transition-colors text-sm"
        :disabled="recovering" @click="$emit('recover')">
        {{ recovering ? '…' : 'Laden' }}
      </button>
    </div>
    <button class="text-sm underline opacity-70 hover:opacity-100" @click="$emit('requestNew')">
      Ich bin neu hier – Zugangscode anfordern
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  codeInput: string
  recovering: boolean
}>()

defineEmits<{
  'update:codeInput': [value: string]
  recover: []
  requestNew: []
}>()
</script>