<template>
  <div class="password-container">
    <div class="password-form">
      <h2>{{ title }}</h2>
      <p class="text-sm opacity-80 mb-4">
        Bitte das gemeinsame Galerie-Passwort eingeben, um Zugriff zu erhalten.
      </p>

      <form @submit.prevent="submitPassword">
        <div class="input-group">
          <input
            v-model="password"
            type="password"
            placeholder="Passwort eingeben"
            required
            :disabled="verifying"
          />
        </div>
        <button type="submit" class="submit-button" :disabled="verifying || !password">
          {{ verifying ? 'Prüfe…' : 'Bestätigen' }}
        </button>
      </form>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div v-if="codeRecovery" class="code-section">
        <button
          v-if="!showCodeRecovery"
          class="code-toggle"
          @click="showCodeRecovery = true"
        >
          🖊️ Bereits hochgeladene Fotos bearbeiten?
        </button>

        <div v-else class="code-recovery">
          <p class="text-sm opacity-70 mb-3">
            Gib deinen persönlichen 8-stelligen Code ein, um Fotos von einem anderen Gerät zu
            bearbeiten.
          </p>
          <div class="flex gap-2">
            <input
              v-model="codeInput"
              type="text"
              class="form-input uppercase flex-1"
              placeholder="8-stelliger Code"
              maxlength="8"
              :disabled="codeVerifying"
              @keyup.enter="submitCode"
            />
            <button
              class="code-submit"
              :disabled="codeVerifying || codeInput.length !== 8"
              @click="submitCode"
            >
              {{ codeVerifying ? '…' : 'Bestätigen' }}
            </button>
          </div>
          <p v-if="codeError" class="error-message">{{ codeError }}</p>
          <button class="code-back" @click="showCodeRecovery = false">
            Zurück
          </button>
        </div>
      </div>

      <div v-if="codeCreated" class="code-banner">
        <p class="font-bold">✅ Dein persönlicher Bearbeitungs-Code</p>
        <p class="code-value">{{ codeCreated }}</p>
        <p class="text-xs opacity-70">
          Damit kannst du deine Fotos später auch auf einem anderen Gerät bearbeiten.
          Bitte notieren!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGalleryAuth } from '@/composables/useGalleryAuth'

const props = withDefaults(defineProps<{
  title?: string
  codeRecovery?: boolean
  redirectTo?: string
}>(), {
  title: 'Galerie-Passwort',
  codeRecovery: true,
  redirectTo: undefined,
})

const emit = defineEmits<{
  verified: []
}>()

const auth = useGalleryAuth()

const password = ref('')
const verifying = ref(false)
const errorMessage = ref('')

const showCodeRecovery = ref(false)
const codeInput = ref('')
const codeVerifying = ref(false)
const codeError = ref('')

const codeCreated = ref('')

onMounted(() => {
  if (auth.codeCreated.value) {
    codeCreated.value = auth.codeCreated.value
  }
  auth.clearCodeBanner()
})

async function submitPassword() {
  if (!password.value) return
  verifying.value = true
  errorMessage.value = ''
  const ok = await auth.verifyPassword(password.value)
  if (ok) {
    emit('verified')
  } else {
    errorMessage.value = auth.passwordError.value || 'Falsches Passwort.'
    password.value = ''
  }
  verifying.value = false
}

async function submitCode() {
  if (codeInput.value.length !== 8) return
  codeVerifying.value = true
  codeError.value = ''
  try {
    await auth.recoverByCode(codeInput.value)
    codeCreated.value = auth.galleryCode.value
    showCodeRecovery.value = false
    window.location.reload()
  } catch (e: unknown) {
    codeError.value = (e as Error).message
  } finally {
    codeVerifying.value = false
  }
}
</script>

<style scoped>
.password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}
.password-form {
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  border: 4px solid var(--color-accent, #e8a87c);
  border-radius: 1.5rem;
  background: rgba(232, 168, 124, 0.05);
}
.password-form h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.input-group input {
  padding: 0.5rem 1rem;
  border: 2px solid var(--color-border, #d1d5db);
  border-radius: 0.5rem;
  font-size: 1rem;
}
.input-group input:focus {
  outline: none;
  border-color: var(--color-accent, #e8a87c);
}
.submit-button {
  width: 100%;
  padding: 0.75rem;
  background: var(--color-primary, #2d6a4f);
  color: var(--color-secondary, #f8f9fa);
  font-weight: 700;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background 0.2s;
}
.submit-button:hover:not(:disabled) {
  background: var(--color-accent, #e8a87c);
}
.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.error-message {
  margin-top: 1rem;
  font-weight: 700;
  color: var(--color-accent, #e8a87c);
  font-size: 0.875rem;
  text-align: center;
}
.code-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border, #d1d5db);
}
.code-toggle {
  font-size: 0.875rem;
  text-decoration: underline;
  opacity: 0.7;
  cursor: pointer;
  background: none;
  border: none;
  color: inherit;
}
.code-toggle:hover {
  opacity: 1;
}
.code-recovery {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-input {
  padding: 0.5rem 1rem;
  border: 2px solid var(--color-border, #d1d5db);
  border-radius: 0.5rem;
  font-size: 1rem;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-accent, #e8a87c);
}
.code-submit {
  padding: 0.5rem 1rem;
  background: var(--color-accent, #e8a87c);
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.code-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.code-back {
  font-size: 0.8rem;
  text-decoration: underline;
  opacity: 0.6;
  cursor: pointer;
  background: none;
  border: none;
  color: inherit;
  align-self: flex-start;
}
.code-banner {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(45, 106, 79, 0.1);
  border: 2px solid var(--color-primary, #2d6a4f);
  border-radius: 1rem;
  text-align: center;
}
.code-value {
  font-size: 1.5rem;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.25em;
  color: var(--color-accent, #e8a87c);
  margin: 0.5rem 0;
  user-select: all;
}
</style>
