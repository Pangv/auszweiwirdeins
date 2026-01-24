<script setup lang="ts">
import {ref, watch, onMounted} from 'vue'
import {auth, db} from './../firebase'
import {signInAnonymously, onAuthStateChanged} from 'firebase/auth'
import {doc, getDoc, setDoc} from 'firebase/firestore'

const guestCount = ref(1)
const names = ref<string[]>([''])
const attending = ref<'yes' | 'no'>('yes')
const message = ref('')
const musicNoGo = ref('')
const loading = ref(true)
const saving = ref(false)
const statusMessage = ref('')
const userId = ref<string | null>(null)

// Reagiert auf Änderungen der Gästeanzahl und passt das Namens-Array an
watch(guestCount, (newCount) => {
  const currentNames = [...names.value]
  if (newCount > currentNames.length) {
    // Füge leere Felder hinzu
    for (let i = currentNames.length; i < newCount; i++) {
      currentNames.push('')
    }
  } else {
    // Kürze das Array, falls die Zahl verringert wird
    currentNames.splice(newCount)
  }
  names.value = currentNames
})

const loadUserData = async (uid: string) => {
  try {
    const docRef = doc(db, 'responses', uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      guestCount.value = data.guestCount || 1
      names.value = data.names || ['']
      attending.value = data.attending || 'yes'
      message.value = data.message || ''
      musicNoGo.value = data.musicNoGo || ''
      statusMessage.value = 'Deine bisherige Anmeldung wurde geladen.'
    }
  } catch (error) {
    console.error('Fehler beim Laden der Daten:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userId.value = user.uid
      await loadUserData(user.uid)
    } else {
      try {
        const userCredential = await signInAnonymously(auth)
        userId.value = userCredential.user.uid
        loading.value = false
      } catch (error) {
        console.error('Anonyme Anmeldung fehlgeschlagen:', error)
        statusMessage.value = 'Anmeldung fehlgeschlagen. Bitte versuche es später erneut.'
        loading.value = false
      }
    }
  })
})

const handleSubmit = async () => {
  if (!userId.value) return

  saving.value = true
  statusMessage.value = 'Wird gespeichert...'

  try {
    await setDoc(doc(db, 'responses', userId.value), {
      guestCount: guestCount.value,
      names: names.value,
      attending: attending.value,
      message: message.value,
      musicNoGo: musicNoGo.value,
      updatedAt: new Date().toISOString()
    })
    statusMessage.value = 'Anmeldung erfolgreich gespeichert!'
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
    statusMessage.value = 'Fehler beim Speichern. Bitte versuche es erneut.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section id="teilnahme" class="grid md:grid-cols-2 gap-12 py-10 md:py-20 px-6 md:px-12 text-left bg-secondary">
    <div class="flex flex-col justify-center">
      <h2 class="text-[clamp(2.5rem,10vw,6rem)] font-extrabold mb-6 leading-none text-left lighter">
        Bist du dabei?</h2>
      <p class="mb-8 text-lg">Bitte melde dich über das Kontaktformular an.</p>
      <div class="relative">
        <div
          class="absolute -inset-4 border-4 bg-accent border-accent/60 rounded-3xl rotate-2"></div>
        <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=500"
             class="rounded-3xl shadow-xl w-full object-cover h-64 md:h-96 -rotate-4 object-cover hover:scale-105 transition-transform duration-500"
             alt="Drinks">
      </div>
    </div>
    <div class="bg-primary/5 p-8 rounded-3xl shadow-sm border-2 border-primary/10 relative">
      <div v-if="loading"
           class="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-3xl">
        <p class="font-bold">Lade Daten...</p>
      </div>

      <form id="rsvpForm" class="space-y-4" @submit.prevent="handleSubmit">
        <div class="flex gap-4 mb-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="attending" value="yes" class="accent-coral w-5 h-5">
            <span class="font-bold">ICH KOMME</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="attending" value="no" class="accent-coral w-5 h-5">
            <span class="font-bold">ICH KANN LEIDER NICHT</span>
          </label>
        </div>

        <div v-if="attending === 'yes'">
          <label for="guests" class="block text-sm font-bold mb-1">PERSONENANZAHL</label>
          <input type="number" id="guests" v-model.number="guestCount" min="1"
                 class="w-full p-3 border border-coral rounded bg-transparent focus:ring-2 focus:ring-coral outline-none">
        </div>

        <div v-if="attending === 'yes'" v-for="(_, index) in guestCount" :key="index">
          <label :for="'name-' + index" class="block text-sm font-bold mb-1">
            NAME {{ guestCount > 1 ? (index + 1) : '' }}
          </label>
          <input type="text" :id="'name-' + index" v-model="names[index]" :placeholder="'NAME'"
                 class="w-full p-3 border border-coral rounded bg-transparent focus:ring-2 focus:ring-coral outline-none"
                 required>
        </div>

        <div v-if="attending === 'no'">
          <label for="name-absage" class="block text-sm font-bold mb-1">NAME</label>
          <input type="text" id="name-absage" v-model="names[0]" placeholder="DEIN NAME"
                 class="w-full p-3 border border-coral rounded bg-transparent focus:ring-2 focus:ring-coral outline-none"
                 required>

        </div>


        <div v-if="attending === 'yes'">
          <label for="message2" class="block text-sm font-bold mb-1">MUSIK NO GOES</label>
          <textarea id="message2" v-model="musicNoGo"
                    placeholder="Was sollen wir gar nicht spielen?"
                    class="w-full p-3 border border-coral rounded bg-transparent h-32 focus:ring-2 focus:ring-coral outline-none"></textarea>
          <div>
            <label for="message" class="block text-sm font-bold mb-1">NACHRICHT AN UNS (Z.B.
              ALLERGIEN, Vegetarisch, Vegan)</label>
            <textarea id="message" v-model="message" placeholder="Deine Nachricht..."
                      class="w-full p-3 border border-coral rounded bg-transparent h-32 focus:ring-2 focus:ring-coral outline-none"></textarea>
          </div>
        </div>

        <button type="submit"
                :disabled="saving || loading"
                class="w-full bg-accent text-white py-4 rounded font-bold uppercase hover:bg-red-500 transition-colors disabled:opacity-50">
          {{ saving ? 'Wird gespeichert...' : 'Abschicken' }}
        </button>
      </form>
      <p id="status" class="mt-4 font-bold text-center"
         :class="{'text-green-600': statusMessage.includes('erfolgreich'), 'text-red-600': statusMessage.includes('Fehler')}">
        {{ statusMessage }}
      </p>
    </div>
  </section>
</template>
