<script setup lang="ts">
import {ref, watch, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {auth, db} from './../firebase'
import {signInAnonymously, onAuthStateChanged} from 'firebase/auth'
import {doc, getDoc, setDoc, collection, query, where, getDocs} from 'firebase/firestore'

const route = useRoute()
const guestCount = ref(1)
const names = ref<string[]>([''])
const attending = ref<'yes' | 'no'>('yes')
const message = ref('')
const musicNoGo = ref('')
const loading = ref(true)
const saving = ref(false)
const statusMessage = ref('')
const userId = ref<string | null>(null)
const editCode = ref('')
const manualCode = ref('')
const isUsingManualCode = ref(false)

// Reagiert auf Änderungen der Gästeanzahl und passt das Namens-Array an
watch(guestCount, (newCount) => {
  if (newCount > names.value.length) {
    // Füge leere Felder hinzu
    for (let i = names.value.length; i < newCount; i++) {
      names.value.push('')
    }
  } else if (newCount < names.value.length) {
    // Kürze das Array, falls die Zahl verringert wird
    names.value.splice(newCount)
  }
})

const loadUserData = async (uid: string) => {
  try {
    const docRef = doc(db, 'responses', uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data) {
        guestCount.value = data.guestCount || 1
        names.value = Array.isArray(data.names) ? data.names : ['']
        attending.value = data.attending || 'yes'
        message.value = data.message || ''
        musicNoGo.value = data.musicNoGo || ''
        editCode.value = data.editCode || ''
        statusMessage.value = 'Deine bisherige Anmeldung wurde geladen.'
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden der Daten:', error)
  } finally {
    loading.value = false
  }
}

const loadByCode = async (code: string) => {
  if (!code || code.length !== 8) return false

  loading.value = true
  statusMessage.value = 'Suche Anmeldung...'

  try {
    const q = query(collection(db, 'responses'), where('editCode', '==', code.toUpperCase()))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty && querySnapshot.docs.length > 0) {
      const docSnap = querySnapshot.docs[0]
      if (docSnap) {
        const data = docSnap.data()
        if (data) {
          userId.value = docSnap.id
          guestCount.value = data.guestCount || 1
          names.value = Array.isArray(data.names) ? data.names : ['']
          attending.value = data.attending || 'yes'
          message.value = data.message || ''
          musicNoGo.value = data.musicNoGo || ''
          editCode.value = data.editCode || ''
          isUsingManualCode.value = true
          statusMessage.value = 'Anmeldung erfolgreich über Code geladen!'
          return true
        }
      }
      return false
    } else {
      statusMessage.value = 'Keine Anmeldung mit diesem Code gefunden.'
      return false
    }
  } catch (error) {
    console.error('Fehler beim Laden per Code:', error)
    statusMessage.value = 'Fehler beim Laden per Code.'
    return false
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const urlCode = route.query.code as string
  if (urlCode) {
    loadByCode(urlCode)
    return
  }

  onAuthStateChanged(auth, async (user) => {
    if (isUsingManualCode.value) return // Überspringe auth falls wir gerade einen Code laden

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
    const docRef = doc(db, 'responses', userId.value)
    const docSnap = await getDoc(docRef)

    let createdAtValue = new Date().toISOString()
    let editCodeValue = Math.random().toString(36).substring(2, 10).toUpperCase()

    if (docSnap.exists()) {
      const existingData = docSnap.data()
      if (existingData) {
        createdAtValue = existingData.createdAt || createdAtValue
        editCodeValue = existingData.editCode || editCodeValue
      }
    }

    await setDoc(docRef, {
      guestCount: guestCount.value,
      names: names.value,
      attending: attending.value,
      message: message.value,
      musicNoGo: musicNoGo.value,
      updatedAt: new Date().toISOString(),
      createdAt: createdAtValue,
      editCode: editCodeValue
    })

    editCode.value = editCodeValue
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
  <section id="teilnahme" class="grid md:grid-cols-2 gap-12 text-left bg-secondary section-padding">
    <div class="flex flex-col justify-center">
      <h2 class="heading-huge mb-6 text-left text-primary">
        Bist du dabei?</h2>
      <p class="mb-8 text-lg">Bitte melde dich über das Kontaktformular an.</p>
      <div class="card-decoration-container">
        <div class="card-decoration-bg rotate-2"></div>
        <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=500"
             class="card-image h-64 md:h-96 -rotate-4 hover:scale-105"
             alt="Drinks">
      </div>
    </div>

    <div class="bg-primary/5 md:p-8 rounded-xl shadow-sm p-2 relative">
      <div v-if="loading"
           class="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-3xl">
        <p class="font-bold">Lade Daten...</p>
      </div>

      <form id="rsvpForm" class="space-y-4" @submit.prevent="handleSubmit">
        <div class="flex gap-4 mb-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="attending" value="yes" class="accent-accent w-5 h-5">
            <span class="font-bold">ICH KOMME</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="attending" value="no" class="accent-accent w-5 h-5">
            <span class="font-bold">ICH KANN LEIDER NICHT</span>
          </label>
        </div>

        <div v-if="attending === 'yes'">
          <label for="guests" class="form-label">PERSONENANZAHL</label>
          <input type="number" id="guests" v-model.number="guestCount" min="1"
                 class="form-input">
        </div>

        <div v-if="attending === 'yes'" v-for="i in guestCount" :key="i">
          <label :for="'name-' + i" class="form-label">
            NAME {{ guestCount > 1 ? i : '' }}
          </label>
          <input type="text" :id="'name-' + i" v-model="names[i - 1]" :placeholder="'NAME'"
                 class="form-input"
                 required>
        </div>

        <div v-if="attending === 'no'">
          <label for="name-absage" class="form-label">NAME</label>
          <input type="text" id="name-absage" v-model="names[0]" placeholder="DEIN NAME"
                 class="form-input"
                 required>
        </div>


        <div v-if="attending === 'yes'">
          <label for="message2" class="form-label">MUSIK NO GOES</label>
          <textarea id="message2" v-model="musicNoGo"
                    placeholder="Was sollen wir gar nicht spielen?"
                    class="form-input"></textarea>
          <div>
            <label for="message" class="form-label">NACHRICHT AN UNS (Z.B.
              ALLERGIEN, Vegetarisch, Vegan)</label>
            <textarea id="message" v-model="message" placeholder="Deine Nachricht..."
                      class="form-input"></textarea>
          </div>
        </div>

        <button type="submit"
                :disabled="saving || loading"
                class="w-full bg-accent text-white py-4 rounded font-bold uppercase hover:bg-red-500 transition-colors disabled:opacity-50">
          {{ saving ? 'Wird gespeichert...' : 'Abschicken' }}
        </button>
      </form>
      <p id="status" class="mt-4 font-bold text-center"
         :class="{'text-green-600': statusMessage.includes('erfolgreich'), 'text-red-600': statusMessage.includes('Fehler') || statusMessage.includes('Keine')}">
        {{ statusMessage }}
      </p>

      <div v-if="editCode" class="bg-accent/10 p-4 rounded-xl border border-accent/20 mb-6">
        <p class="text-xs font-bold uppercase text-accent mb-1">Dein persönlicher Änderungs-Code:</p>
        <p class="text-2xl font-mono font-bold tracking-widest">{{ editCode }}</p>
        <p class="text-[10px] opacity-70 mt-2">Speichere dir diesen Code, um deine Anmeldung später zu bearbeiten.</p>
      </div>

      <div v-if="!isUsingManualCode" class="mt-8 pt-8 border-t border-primary/10">
        <p class="text-xs font-bold uppercase mb-2 opacity-50 text-center">Bereits angemeldet?</p>
        <div class="flex flex-col md:flex-row gap-2">
          <input type="text" v-model="manualCode" placeholder="8-stelliger Code"
                 class="flex-1 m-1  p-2 border border-accent/50 rounded bg-transparent text-sm focus:ring-2 focus:ring-accent outline-none uppercase">
          <button @click.prevent="loadByCode(manualCode)"
                  class="bg-accent/20 text-accent px-4 py-2 rounded text-xs font-bold uppercase hover:bg-accent hover:text-white transition-colors">
            Laden
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
