<template>
  <div v-if="show" class="mb-8 p-6 border-4 border-accent rounded-3xl bg-accent/10 max-w-md">
    <p class="font-bold mb-3">🔒 Persönlicher Bearbeitungs-Code</p>
    <p class="text-sm opacity-70 mb-4">
      Dieser Code schützt deine hochgeladenen Fotos – nur damit kannst du später eigene Fotos
      bearbeiten oder löschen.
    </p>

    <div v-if="!mode" class="flex flex-col gap-2 mb-2">
      <button
        class="bg-primary text-secondary font-display px-6 py-2 rounded-full hover:bg-accent transition-colors text-left"
        @click="$emit('update:mode', 'new')">
        ✨ Ich bin zum ersten Mal hier
      </button>
      <button
        class="border-2 border-primary text-primary font-display px-6 py-2 rounded-full hover:bg-primary/10 transition-colors text-left"
        @click="$emit('update:mode', 'existing')">
        🔑 Ich habe bereits einen Bearbeitungs-Code
      </button>
    </div>

    <div v-else-if="mode === 'new'" class="mb-2">
      <p class="text-sm mb-3">
        Diesen Bearbeitungs-Code hast du (z.B. auf eurer Einladungskarte) von den Brautleuten
        erhalten. Gib ihn hier einmalig ein – danach merkt sich dein Browser ihn automatisch.
      </p>
      <input :value="password" type="password" class="form-input mb-3" :class="{ 'border-red-500': error }"
        placeholder="Bearbeitungs-Code…" :disabled="verifying"
        @input="onPasswordInput" @keyup.enter="$emit('verify')" />
      <div class="flex gap-2">
        <button
          class="bg-primary text-secondary font-display px-6 py-2 rounded-full hover:bg-accent transition-colors"
          :disabled="verifying || !password" @click="$emit('verify')">
          {{ verifying ? 'Prüfe…' : 'Bestätigen' }}
        </button>
        <button class="text-sm underline opacity-60 hover:opacity-100" @click="$emit('back')">
          Zurück
        </button>
      </div>
    </div>

    <div v-else-if="mode === 'existing'" class="mb-2">
      <input :value="password" type="password" class="form-input mb-3" :class="{ 'border-red-500': error }"
        placeholder="Deinen Bearbeitungs-Code eingeben…" :disabled="verifying"
        @input="onPasswordInput" @keyup.enter="$emit('verify')" />
      <div class="flex gap-2">
        <button
          class="bg-primary text-secondary font-display px-6 py-2 rounded-full hover:bg-accent transition-colors"
          :disabled="verifying || !password" @click="$emit('verify')">
          {{ verifying ? 'Prüfe…' : 'Bestätigen' }}
        </button>
        <button class="text-sm underline opacity-60 hover:opacity-100" @click="$emit('back')">
          Zurück
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-3 font-bold text-accent text-sm">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  password: string
  verifying: boolean
  error: string
  mode: 'new' | 'existing' | null
  galleryCode: string
  verified: boolean
}>()

const emit = defineEmits<{
  'update:password': [value: string]
  'update:mode': [value: 'new' | 'existing' | null]
  verify: []
  back: []
}>()

function onPasswordInput(e: Event) {
  emit('update:password', (e.target as HTMLInputElement).value)
}
</script>