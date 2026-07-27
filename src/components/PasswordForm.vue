<template>
  <div class="password-container">
    <div class="password-form">
      <h2>Gästegalerie - Passwort erforderlich</h2>
      <form @submit.prevent="submitPassword">
        <div class="input-group">
          <label for="password">Passwort:</label>
          <input id="password" v-model="password" type="password" placeholder="Ihr Passwort eingeben" required />
        </div>
        <button type="submit" class="submit-button" :disabled="verifying">{{ verifying ? 'Prüfe…' : 'Einloggen' }}</button>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { verifyPassword } from '../services/galleryApi'

const password = ref('')
const errorMessage = ref('')
const verifying = ref(false)
const router = useRouter()

function getOwnerId(): string {
  const key = 'galerie_owner_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

async function submitPassword() {
  verifying.value = true
  errorMessage.value = ''
  try {
    const ok = await verifyPassword(password.value, getOwnerId())
    if (ok) {
      localStorage.setItem('galerie_password', password.value)
      router.push({ name: 'Gäste' })
    } else {
      errorMessage.value = 'Falsches Passwort. Bitte versuchen Sie es erneut.'
      password.value = ''
    }
  } catch {
    errorMessage.value = 'Verbindungsfehler.'
  } finally {
    verifying.value = false
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
  margin-bottom: 1rem;
  text-align: center;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.input-group label {
  font-size: 0.875rem;
  opacity: 0.7;
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
</style>
