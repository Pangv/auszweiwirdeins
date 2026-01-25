<script setup lang="ts">
import { ref } from 'vue'
import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/admin')
  } catch (err: any) {
    console.error(err)
    error.value = 'Login fehlgeschlagen. Bitte überprüfe deine Daten.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-primary px-6">
    <div class="max-w-md w-full bg-secondary p-8 rounded-3xl shadow-xl">
      <h1 class="text-3xl font-extrabold mb-6 text-center text-secondary">Admin Login</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-bold mb-1">E-MAIL</label>
          <input type="email" v-model="email" required
                 class="w-full p-3 border border-accent rounded bg-transparent focus:ring-2 focus:ring-accent outline-none">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">PASSWORT</label>
          <input type="password" v-model="password" required
                 class="w-full p-3 border border-accent rounded bg-transparent focus:ring-2 focus:ring-accent outline-none">
        </div>

        <p v-if="error" class="text-red-600 text-sm font-bold">{{ error }}</p>

        <button type="submit" :disabled="loading"
                class="w-full bg-accent text-white py-4 rounded font-bold uppercase hover:bg-red-500 transition-colors disabled:opacity-50">
          {{ loading ? 'Wird angemeldet...' : 'Anmelden' }}
        </button>
      </form>
    </div>
  </div>
</template>
