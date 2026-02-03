<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {db, auth} from '../firebase'
import {collection, query, orderBy, onSnapshot} from 'firebase/firestore'
import {getAuth, signOut} from 'firebase/auth'
import {useRouter} from 'vue-router'

interface Response {
  id: string
  guestCount: number
  names: string[]
  attending: 'yes' | 'no'
  message: string
  musicNoGo: string
  updatedAt: string
  createdAt?: string
  editCode?: string
}

const responses = ref<Response[]>([])
const loading = ref(true)
const statusMessage = ref('')
const router = useRouter()

onMounted(() => {
  const q = query(collection(db, 'responses'), orderBy('updatedAt', 'desc'))
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: Response[] = []
      querySnapshot.forEach((doc) => {
        data.push({id: doc.id, ...doc.data()} as Response)
      })
      responses.value = data
      loading.value = false
    },
    (error) => {
      console.error("Firestore Error:", error);
      statusMessage.value = "Zugriff verweigert: Du hast keine Admin-Rechte.";
      loading.value = false;
    }
)

  return () => unsubscribe()
})

const groupedResponses = computed(() => {
  return {
    zusagen: responses.value.filter(r => r.attending === 'yes'),
    absagen: responses.value.filter(r => r.attending === 'no')
  }
})

const checkStatus = async () => {
  const user = getAuth().currentUser;
  if (user) {
    const idTokenResult = await user.getIdTokenResult();
    console.log("Admin Claim vorhanden:", idTokenResult.claims.admin === true);
  }
};
checkStatus()

const totalGuests = computed(() => {
  return groupedResponses.value.zusagen.reduce((sum, r) => sum + (r.guestCount || 0), 0)
})

const handleLogout = async () => {
  await signOut(auth)
  router.push('/login')
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="min-h-screen bg-primary p-6 md:p-12">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-wrap justify-between items-end mb-12">
        <div>
          <h1 class="text-5xl md:text-7xl font-extrabold text-secondary leading-none">Unsere
            Gäste</h1>
          <p class="text-xl mt-4 opacity-80 uppercase font-bold text-accent">Anmeldungen &
            Rückmeldungen</p>
        </div>

        <a href="/"
           class="bg-accent text-white px-6 py-2 rounded font-bold uppercase hover:bg-red-500 transition-colors">
          Zurück
        </a>
        <button @click="handleLogout"
                class="bg-accent text-white px-6 py-2 rounded font-bold uppercase hover:bg-red-500 transition-colors">
          Abmelden
        </button>
      </div>

      <div v-if="loading" class="text-center py-20">
        <p class="text-2xl font-bold animate-pulse">Lade Daten...</p>
      </div>

      <div v-else class="space-y-16">
        <!-- Statistik -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-secondary p-8 rounded-3xl shadow-lg border-2 border-accent/20">
            <h3 class="text-sm font-bold uppercase text-accent mb-2">Gesamtzusagen (Personen)</h3>
            <p class="text-5xl font-extrabold">{{ totalGuests }}</p>
          </div>
          <div class="bg-secondary p-8 rounded-3xl shadow-lg border-2 border-accent/20">
            <h3 class="text-sm font-bold uppercase text-accent mb-2">Anzahl Zusagen (Formulare)</h3>
            <p class="text-5xl font-extrabold">{{ groupedResponses.zusagen.length }}</p>
          </div>
          <div class="bg-secondary p-8 rounded-3xl shadow-lg border-2 border-accent/20">
            <h3 class="text-sm font-bold uppercase text-accent mb-2">Anzahl Absagen</h3>
            <p class="text-5xl font-extrabold">{{ groupedResponses.absagen.length }}</p>
          </div>
        </div>

        <!-- Zusagen -->
        <section>
          <h2
            class="text-4xl font-extrabold mb-8 text-secondary border-b-4 border-accent inline-block">
            Zusagen</h2>
          <div class="grid gap-6">
            <div v-for="res in groupedResponses.zusagen" :key="res.id"
                 class="bg-secondary p-6 rounded-2xl shadow-md border-l-8 border-green-500">
              <div class="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <h3 class="text-2xl font-bold ">{{ res.names.join(', ') }}</h3>
                  <p class="text-accent font-bold uppercase text-sm">{{ res.guestCount }}
                    Person(en)</p>
                </div>
                <div class="text-right">
                  <p class="text-xs opacity-60 font-mono" title="Zuletzt aktualisiert">UA:
                    {{ formatDate(res.updatedAt) }}</p>
                  <p v-if="res.createdAt" class="text-xs opacity-60 font-mono" title="Erstellt am">
                    ER: {{ formatDate(res.createdAt) }}</p>
                  <p v-if="res.editCode" class="text-xs font-bold text-accent font-mono mt-1">Code:
                    {{ res.editCode }}</p>
                  <span
                    class="inline-block mt-2 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold uppercase">Zusage</span>
                </div>
              </div>
              <div class="space-y-4">
                <div v-if="res.message">
                  <p class="text-xs font-bold uppercase opacity-50">Nachricht / Allergien:</p>
                  <p class="italic">"{{ res.message }}"</p>
                </div>
                <div v-if="res.musicNoGo">
                  <p class="text-xs font-bold uppercase opacity-50">Musik No-Goes:</p>
                  <p class="text-red-500">"{{ res.musicNoGo }}"</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Absagen -->
        <section>
          <h2
            class="text-4xl font-extrabold mb-8 text-secondary border-b-4 border-gray-400 inline-block">
            Absagen</h2>
          <div class="grid gap-6">
            <div v-for="res in groupedResponses.absagen" :key="res.id"
                 class="bg-secondary p-6 rounded-2xl shadow-md border-l-8 border-gray-400 opacity-80">
              <div class="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <h3 class="text-2xl font-bold">{{ res.names.join(', ') }}</h3>
                </div>
                <div class="text-right">
                  <p class="text-xs opacity-60 font-mono" title="Zuletzt aktualisiert">UA:
                    {{ formatDate(res.updatedAt) }}</p>
                  <p v-if="res.createdAt" class="text-xs opacity-60 font-mono" title="Erstellt am">
                    ER: {{ formatDate(res.createdAt) }}</p>
                  <p v-if="res.editCode" class="text-xs font-bold text-accent font-mono mt-1">Code:
                    {{ res.editCode }}</p>
                  <span
                    class="inline-block mt-2 bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-bold uppercase">Absage</span>
                </div>
              </div>
              <div v-if="res.message">
                <p class="text-xs font-bold uppercase opacity-50">Nachricht:</p>
                <p class="italic">"{{ res.message }}"</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
