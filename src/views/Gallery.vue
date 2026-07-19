<template>
  <div class="min-h-screen flex flex-col">
    <div class="section-padding max-w-6xl mx-auto flex-1">
      <!-- Header -->
      <h1 class="heading-huge text-primary fancy mb-10">Galerie</h1>
      <p class="mb-8 text-lg max-w-2xl">
        Teilt eure schönsten Momente mit uns! Ladet eure Fotos hoch – so entsteht gemeinsam unser
        Hochzeitsalbum.
      </p>

      <!-- Code-Prompt (Owner noch nicht bekannt) -->
      <div
        v-if="showCodePrompt"
        class="mb-8 p-6 border-4 border-accent rounded-3xl bg-accent/10 max-w-md"
      >
        <p class="font-bold mb-3">Galerie-Code eingeben</p>
        <p class="text-sm opacity-70 mb-3">
          Hast du bereits einen Code? Dann gib ihn ein. Sonst fordere einen neuen an.
        </p>
        <div class="flex gap-2 mb-3">
          <input
            v-model="codeInput"
            type="text"
            class="form-input uppercase flex-1"
            placeholder="8-stelliger Code"
            maxlength="8"
            @keyup.enter="recoverByCode"
          />
          <button
            class="bg-accent text-white font-display px-4 py-2 rounded-full hover:bg-accent/80 transition-colors text-sm"
            :disabled="codeRecovering"
            @click="recoverByCode"
          >
            {{ codeRecovering ? '…' : 'Laden' }}
          </button>
        </div>
        <button class="text-sm underline opacity-70 hover:opacity-100" @click="requestNewCode">
          Ich bin neu hier – Code anfordern
        </button>
      </div>

      <!-- Passwort-Prompt (wenn kein Passwort gespeichert) -->
      <div
        v-if="showPasswordPrompt"
        class="mb-8 p-6 border-4 border-accent rounded-3xl bg-accent/10 max-w-md"
      >
        <label class="form-label">Upload-Passwort eingeben:</label>
        <input
          v-model="password"
          type="password"
          class="form-input mb-3"
          placeholder="Passwort…"
          @keyup.enter="savePassword"
        />
        <button
          class="bg-primary text-secondary font-display px-6 py-2 rounded-full hover:bg-accent transition-colors"
          @click="savePassword"
        >
          Speichern
        </button>
      </div>

      <template v-if="password">
        <!-- Upload-Button -->
        <div class="mb-10">
          <label
            class="inline-block cursor-pointer bg-accent text-white font-display text-xl px-8 py-3 rounded-full shadow-xl hover:scale-100 transition-transform"
            :class="{ 'opacity-50 pointer-events-none': uploading }"
          >
            {{ uploading ? 'Lädt hoch…' : '+ Fotos hochladen' }}
            <input
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              :disabled="uploading"
              @change="handleUpload"
            />
          </label>
          <p v-if="uploadProgress" class="mt-3 font-bold text-primary">{{ uploadProgress }}</p>
          <p v-if="errorMsg" class="mt-3 font-bold text-accent">{{ errorMsg }}</p>

          <!-- Galerie-Code (immer sichtbar wenn vorhanden) -->
          <div
            v-if="galleryCode"
            class="mt-4 p-4 border-2 border-accent/30 rounded-2xl bg-accent/5 md:inline-block"
          >
            <p class="text-xs font-bold uppercase opacity-50 mb-1">Dein Galerie-Code</p>
            <p class="text-2xl font-mono font-bold tracking-widest text-accent select-all">
              {{ galleryCode }}
            </p>
          </div>
        </div>

        <!-- Galerie-Grid -->
        <div v-if="loading" class="text-center py-10 font-display text-2xl">Lädt…</div>

        <div v-else-if="photos.length === 0" class="text-center py-10 text-lg opacity-70">
          Noch keine Fotos – sei die/der Erste!
        </div>

        <div v-else class="columns-2 md:columns-3 lg:columns-4 gap-4">
          <div
            v-for="photo in photos"
            :key="photo.id"
            class="relative group break-inside-avoid mb-4 overflow-hidden rounded-2xl shadow-lg cursor-pointer"
          >
            <img
              :src="`${API}/uploads/thumbs/${photo.thumb}`"
              loading="lazy"
              class="w-full h-auto object-cover transition-transform duration-200"
              @click="lightboxSrc = `${API}/uploads/${photo.filename}`"
            />

            <!-- Overlay mit Buttons -->
            <div
              class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3"
            >
              <button
                class="bg-white text-accent w-10 h-10 rounded-full flex items-center justify-center font-bold hover:bg-accent hover:text-white transition"
                @click.stop="downloadPhoto(photo.filename)"
                title="Download"
              >
                ⬇️
              </button>
              <button
                v-if="ownerId && photo.owner_id === ownerId"
                class="bg-accent text-white w-10 h-10 rounded-full flex items-center justify-center font-bold hover:bg-red-600 transition"
                title="Löschen"
                @click.stop="deletePhoto(photo.id)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Lightbox -->
        <div
          v-if="lightboxSrc"
          class="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          @click="lightboxSrc = null"
        >
          <button
            class="absolute top-6 right-6 text-white text-4xl font-bold hover:text-accent transition-colors"
            @click="lightboxSrc = null"
          >
            ✕
          </button>
          <img :src="lightboxSrc" class="max-w-full max-h-[80vh] object-contain rounded-lg" />
          <button
            class="mt-6 bg-primary text-secondary font-display px-8 py-2 rounded-full hover:bg-accent transition-colors"
            @click.stop="downloadPhoto(lightboxSrc.split('/').pop()!)"
          >
            ⬇️ Original herunterladen
          </button>
        </div>
      </template>
    </div>

    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { signInAnonymously } from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  limit,
} from 'firebase/firestore'
import Footer from '@/components/Footer.vue'

const API = 'https://galerie.auszweiwirdeins.de'

interface Photo {
  id: string
  filename: string
  thumb: string
  owner_id: string
  created_at: number
}

// --- Owner-ID (UUID immer vorhanden, Code optional für Recovery) ---
let storedId = localStorage.getItem('galerie_owner_id')
if (!storedId) {
  storedId = crypto.randomUUID()
  localStorage.setItem('galerie_owner_id', storedId)
}
const ownerId = ref(storedId)
const galleryCode = ref(localStorage.getItem('galerie_gallery_code') || '')
const showCodePrompt = ref(false)
const codeInput = ref('')
const codeRecovering = ref(false)

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

async function requestNewCode() {
  const newOwnerId = ownerId.value
  const newCode = generateCode()

  try {
    await addDoc(collection(db, 'gallery_owners'), {
      code: newCode,
      owner_id: newOwnerId,
      created_at: serverTimestamp(),
    })
    localStorage.setItem('galerie_gallery_code', newCode)
    galleryCode.value = newCode
    showCodePrompt.value = false
    errorMsg.value = ''
  } catch (e) {
    console.error('requestNewCode:', e)
    errorMsg.value = 'Code konnte nicht erstellt werden.'
  }
}

async function recoverByCode() {
  if (!codeInput.value || codeInput.value.length !== 8) return

  codeRecovering.value = true
  errorMsg.value = ''
  try {
    const q = query(
      collection(db, 'gallery_owners'),
      where('code', '==', codeInput.value.toUpperCase()),
      limit(1),
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      const data = snap.docs[0]!.data()
      localStorage.setItem('galerie_owner_id', data.owner_id)
      localStorage.setItem('galerie_gallery_code', data.code)
      ownerId.value = data.owner_id
      galleryCode.value = data.code
      showCodePrompt.value = false
      errorMsg.value = ''
    } else {
      errorMsg.value = 'Code nicht gefunden.'
    }
  } catch (e) {
    console.error('recoverByCode:', e)
    errorMsg.value = 'Fehler bei der Codesuche.'
  }
}

async function tryAutoRecover() {
  if (ownerId.value || !galleryCode.value) return
  codeRecovering.value = true
  try {
    const q = query(
      collection(db, 'gallery_owners'),
      where('code', '==', galleryCode.value),
      limit(1),
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      const data = snap.docs[0]!.data()
      localStorage.setItem('galerie_owner_id', data.owner_id)
      ownerId.value = data.owner_id
    }
  } catch {
    // silent fail – Nutzer kann Code manuell eingeben
  } finally {
    codeRecovering.value = false
  }
}

// --- Passwort (persistent, einmal eingeben) ---
const password = ref(localStorage.getItem('galerie_password') || '')
const showPasswordPrompt = ref(!password.value)

function savePassword() {
  localStorage.setItem('galerie_password', password.value)
  showPasswordPrompt.value = false
}

// --- State ---
const photos = ref<Photo[]>([])
const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref('')
const errorMsg = ref('')
const lightboxSrc = ref<string | null>(null)

// --- Fotos laden ---
async function loadPhotos() {
  loading.value = true
  try {
    const res = await fetch(`${API}/api/photos?limit=100`)
    const data = await res.json()
    photos.value = data.photos
  } catch {
    errorMsg.value = 'Fotos konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

// --- Upload ---
async function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  if (!password.value) {
    showPasswordPrompt.value = true
    return
  }

  uploading.value = true
  errorMsg.value = ''
  const files = Array.from(input.files)
  const BATCH = 5
  let done = 0

  try {
    for (let i = 0; i < files.length; i += BATCH) {
      const batch = files.slice(i, i + BATCH)
      const formData = new FormData()
      batch.forEach((f) => formData.append('photos', f))

      uploadProgress.value = `Lade hoch… ${done}/${files.length}`

      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: {
          'X-Upload-Password': password.value,
          'X-Owner-Id': ownerId.value,
        },
        body: formData,
      })

      if (res.status === 401) {
        errorMsg.value = 'Falsches Passwort!'
        localStorage.removeItem('galerie_password')
        password.value = ''
        showPasswordPrompt.value = true
        uploading.value = false
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Upload fehlgeschlagen.')
      }
      done += batch.length
    }

    uploadProgress.value = `${done} Foto(s) hochgeladen!`
    await loadPhotos()
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    uploading.value = false
    input.value = ''
    setTimeout(() => (uploadProgress.value = ''), 4000)
  }
}

// --- Download ---
function downloadPhoto(filename: string) {
  const url = `${API}/uploads/${filename}`
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

// --- Löschen ---
async function deletePhoto(id: string) {
  if (!confirm('Dieses Foto wirklich löschen?')) return
  try {
    const res = await fetch(`${API}/api/photos/${id}`, {
      method: 'DELETE',
      headers: { 'X-Owner-Id': ownerId.value },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Löschen fehlgeschlagen.')
    }
    photos.value = photos.value.filter((p) => p.id !== id)
  } catch (e: any) {
    errorMsg.value = e.message
  }
}

onMounted(async () => {
  try {
    await signInAnonymously(auth)
  } catch {
    // silent – ohne Auth kein Code-Recovery, aber Galerie-Anzeige funktioniert
  }
  await loadPhotos()
  if (!galleryCode.value) {
    if (!ownerId.value) {
      // Nur falls ownerId wider Erwarten leer – direkt setzen
      const id = crypto.randomUUID()
      localStorage.setItem('galerie_owner_id', id)
      ownerId.value = id
    }
  } else if (!ownerId.value) {
    await tryAutoRecover()
  }
})
</script>

<style scoped></style>
