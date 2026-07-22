<template>
  <div class="min-h-screen flex flex-col">
    <div class="section-padding max-w-6xl mx-auto flex-1">

      <!-- ═══════════════════════════════════════════ -->
      <!--  HEADER                                     -->
      <!-- ═══════════════════════════════════════════ -->
      <h1 class="heading-huge text-primary fancy mb-10">Galerie</h1>
      <p class="mb-8 text-lg max-w-2xl">
        Teilt eure schönsten Momente mit uns! Ladet eure Fotos hoch – so entsteht gemeinsam unser
        Hochzeitsalbum.
      </p>

      <!-- ═══════════════════════════════════════════ -->
      <!--  ZUGANGSCODE-PROMPT (Stufe 1)                -->
      <!--  Identifiziert die Galerie selbst.           -->
      <!-- ═══════════════════════════════════════════ -->
      <div
        v-if="showCodePrompt"
        class="mb-8 p-6 border-4 border-accent rounded-3xl bg-accent/10 max-w-md"
      >
        <p class="font-bold mb-3">🔑 Zugangscode eingeben</p>
        <p class="text-sm opacity-70 mb-3">
          Hast du bereits einen Zugangscode zur Galerie? Dann gib ihn ein. Sonst fordere einen
          neuen an.
        </p>
        <div class="flex gap-2 mb-3">
          <input
            v-model="codeInput"
            type="text"
            class="form-input uppercase flex-1"
            placeholder="8-stelliger Zugangscode"
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
          Ich bin neu hier – Zugangscode anfordern
        </button>
      </div>

      <!-- ═══════════════════════════════════════════ -->
      <!--  BEARBEITUNGS-CODE-PROMPT (Stufe 2)          -->
      <!--  Schützt individuelle Uploads/Bearbeitung.   -->
      <!--  Nur anzeigen, wenn Zugangscode vorhanden    -->
      <!--  UND Bearbeitungs-Code noch nicht verifiziert -->
      <!-- ═══════════════════════════════════════════ -->
      <div
        v-if="showPasswordPrompt && galleryCode && !isPasswordVerified"
        class="mb-8 p-6 border-4 border-accent rounded-3xl bg-accent/10 max-w-md"
      >
        <p class="font-bold mb-3">🔒 Persönlicher Bearbeitungs-Code</p>
        <p class="text-sm opacity-70 mb-4">
          Dieser Code schützt deine hochgeladenen Fotos – nur damit kannst du später eigene Fotos
          bearbeiten oder löschen.
        </p>

        <!-- Auswahl: Neuer Besucher vs. bereits vorhandener Code -->
        <div v-if="!editingCodeMode" class="flex flex-col gap-2 mb-2">
          <button
            class="bg-primary text-secondary font-display px-6 py-2 rounded-full hover:bg-accent transition-colors text-left"
            @click="editingCodeMode = 'new'"
          >
            ✨ Ich bin zum ersten Mal hier
          </button>
          <button
            class="border-2 border-primary text-primary font-display px-6 py-2 rounded-full hover:bg-primary/10 transition-colors text-left"
            @click="editingCodeMode = 'existing'"
          >
            🔑 Ich habe bereits einen Bearbeitungs-Code
          </button>
        </div>

        <!-- Pfad A: Neuer Besucher -->
        <div v-else-if="editingCodeMode === 'new'" class="mb-2">
          <p class="text-sm mb-3">
            Diesen Bearbeitungs-Code hast du (z.B. auf eurer Einladungskarte) von den Brautleuten
            erhalten. Gib ihn hier einmalig ein – danach merkt sich dein Browser ihn automatisch.
          </p>
          <input
            v-model="password"
            type="password"
            class="form-input mb-3"
            :class="{ 'border-red-500': passwordError }"
            placeholder="Bearbeitungs-Code…"
            :disabled="passwordVerifying"
            @keyup.enter="verifyPassword"
            @input="passwordError = ''"
          />
          <div class="flex gap-2">
            <button
              class="bg-primary text-secondary font-display px-6 py-2 rounded-full hover:bg-accent transition-colors"
              :disabled="passwordVerifying || !password"
              @click="verifyPassword"
            >
              {{ passwordVerifying ? 'Prüfe…' : 'Bestätigen' }}
            </button>
            <button
              class="text-sm underline opacity-60 hover:opacity-100"
              @click="editingCodeMode = null"
            >
              Zurück
            </button>
          </div>
        </div>

        <!-- Pfad B: Bereits vorhandener Code -->
        <div v-else-if="editingCodeMode === 'existing'" class="mb-2">
          <input
            v-model="password"
            type="password"
            class="form-input mb-3"
            :class="{ 'border-red-500': passwordError }"
            placeholder="Deinen Bearbeitungs-Code eingeben…"
            :disabled="passwordVerifying"
            @keyup.enter="verifyPassword"
            @input="passwordError = ''"
          />
          <div class="flex gap-2">
            <button
              class="bg-primary text-secondary font-display px-6 py-2 rounded-full hover:bg-accent transition-colors"
              :disabled="passwordVerifying || !password"
              @click="verifyPassword"
            >
              {{ passwordVerifying ? 'Prüfe…' : 'Bestätigen' }}
            </button>
            <button
              class="text-sm underline opacity-60 hover:opacity-100"
              @click="editingCodeMode = null"
            >
              Zurück
            </button>
          </div>
        </div>

        <p v-if="passwordError" class="mt-3 font-bold text-accent text-sm">
          {{ passwordError }}
        </p>
      </div>

      <!-- ═══════════════════════════════════════════ -->
      <!--  HAUPTBEREICH: Nur wenn Zugangscode UND Bearbeitungs-Code verifiziert -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="galleryCode && isPasswordVerified">

        <!-- Zugangscode Anzeige -->
        <div class="mb-8 p-4 border-2 border-accent/30 rounded-2xl bg-accent/5">
          <p class="font-bold uppercase opacity-50 text-xs sm:text-sm mb-1">
            Euer Zugangscode zur Galerie
          </p>
          <p
            class="text-2xl sm:text-3xl font-mono font-bold tracking-widest text-accent select-all break-all"
          >
            {{ galleryCode }}
          </p>
        </div>

        <!-- ═════════════════════════════════════════ -->
        <!--  UPLOAD-BEREICH                            -->
        <!-- ═════════════════════════════════════════ -->
        <div
          class="relative mb-10"
          @dragover.prevent="onDragOver"
          @drop.prevent="onDrop"
          @dragleave="onDragLeave"
        >
          <!-- Drag-Overlay -->
          <div
            v-if="dragOver"
            class="absolute inset-0 z-10 border-4 border-dashed border-accent rounded-3xl bg-accent/10 flex items-center justify-center text-lg font-display"
          >
            Fotos hier ablegen
          </div>

          <!-- Upload-Button -->
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

          <!-- Upload Progress Bar -->
          <div v-if="uploadDone > 0 || uploadTotal > 0" class="mt-3 max-w-xs">
            <div class="bg-gray-200 rounded-full h-2 w-full">
              <div
                class="bg-accent h-2 rounded-full transition-all duration-300"
                :style="{ width: uploadTotal > 0 ? (uploadDone / uploadTotal) * 100 + '%' : '0%' }"
              ></div>
            </div>
            <p v-if="uploadProgress" class="text-xs mt-1 font-bold text-primary">
              {{ uploadProgress }}
            </p>
          </div>

          <p v-if="errorMsg" class="mt-3 font-bold text-accent">{{ errorMsg }}</p>
        </div>

        <!-- ═════════════════════════════════════════ -->
        <!--  FILTER & SORTIERUNG                       -->
        <!-- ═════════════════════════════════════════ -->
        <div class="flex flex-wrap gap-4 items-center mb-6">
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input v-model="showOnlyMine" type="checkbox" class="accent-accent w-4 h-4" />
            Nur meine Fotos
          </label>
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input v-model="sortNewestFirst" type="checkbox" class="accent-accent w-4 h-4" />
            Neueste zuerst
          </label>
        </div>

        <!-- Ladezustand -->
        <div v-if="loading" class="text-center py-10 text-lg opacity-70">Lade Fotos…</div>

        <!-- Leerer Zustand -->
        <div v-else-if="photos.length === 0" class="text-center py-10 text-lg opacity-70">
          Noch keine Fotos – sei die/der Erste!
        </div>

        <!-- ═════════════════════════════════════════ -->
        <!--  FOTO-GRID                                 -->
        <!-- ═════════════════════════════════════════ -->
        <div v-else class="columns-2 md:columns-3 lg:columns-4 gap-4">
          <div
            v-for="photo in filteredPhotos"
            :key="photo.id"
            class="break-inside-avoid mb-4 rounded-2xl shadow-lg bg-white"
          >
            <div class="relative">
              <img
                :src="`${API}/uploads/thumbs/${photo.thumb}`"
                loading="lazy"
                class="w-full h-auto object-cover rounded-t-2xl cursor-pointer"
                @click="handlePhotoClick(photo)"
              />
              <!-- Checkbox für Mehrfachauswahl -->
              <input
                type="checkbox"
                :checked="selectedIds.has(photo.id)"
                class="absolute top-2 left-2 w-5 h-5 accent-accent cursor-pointer"
                @click.stop
                @change="toggleSelect(photo.id)"
              />
            </div>

            <!-- Foto-Aktionen: Download / Löschen -->
            <div class="flex justify-between items-center px-3 py-2">
              <button
                class="text-xs underline opacity-60 hover:opacity-100"
                @click="downloadPhoto(photo.filename)"
              >
                ⬇️ Download
              </button>
              <button
                v-if="isDev || photoBelongsToUser(photo)"
                class="text-xs text-red-500 underline hover:text-red-700"
                @click="deletePhoto(photo.id)"
              >
                ✕ Löschen
              </button>
            </div>
          </div>
        </div>

        <!-- ═════════════════════════════════════════ -->
        <!--  BULK-ACTION-BAR                           -->
        <!-- ═════════════════════════════════════════ -->
        <div
          v-if="selectedIds.size > 0"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-white border-2 border-accent/30 rounded-full shadow-2xl px-6 py-3"
        >
          <span class="text-sm font-bold whitespace-nowrap">{{ selectedIds.size }} ausgewählt</span>
          <button
            class="bg-accent text-white font-display px-5 py-1.5 rounded-full text-sm hover:bg-accent/80 transition-colors"
            @click="downloadSelected"
          >
            ⬇️ Ausgewählte herunterladen
          </button>
          <button
            class="text-sm underline opacity-60 hover:opacity-100"
            @click="selectedIds.clear()"
          >
            Abwählen
          </button>
          <button
            v-if="canDeleteAny"
            class="bg-red-500 text-white font-display px-5 py-1.5 rounded-full text-sm hover:bg-red-700 transition-colors"
            @click="deleteSelected"
          >
            ✕ Ausgewählte löschen
          </button>
        </div>

        <!-- ═════════════════════════════════════════ -->
        <!--  LIGHTBOX                                  -->
        <!-- ═════════════════════════════════════════ -->
        <div
          v-if="lightboxSrc"
          class="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          @click="closeLightbox"
        >
          <button
            class="absolute top-6 right-6 text-white text-4xl font-bold hover:text-accent transition-colors"
            @click="closeLightbox"
          >
            ✕
          </button>
          <img :src="lightboxSrc" class="max-w-full max-h-[80vh] object-contain rounded-lg" />
          <button
            class="mt-6 bg-primary text-secondary font-display px-8 py-2 rounded-full hover:bg-accent transition-colors"
            @click.stop="downloadPhoto(getFilenameFromUrl(lightboxSrc))"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// ─────────────────────────────────────────────────
//  KONSTANTEN & TYPEN
// ─────────────────────────────────────────────────
const API = 'https://galerie.auszweiwirdeins.de'
const OWNER_ID_KEY = 'galerie_owner_id'
const GALLERY_CODE_KEY = 'galerie_gallery_code' // "Zugangscode" (öffentlich, identifiziert die Galerie)
const PASSWORD_KEY = 'galerie_password' // "Persönlicher Bearbeitungs-Code" (schützt Uploads)

interface Photo {
  id: string
  filename: string
  thumb: string
  owner_id: string
  created_at: number
}

// ─────────────────────────────────────────────────
//  STATE – Owner-ID (persistiert, einmalige UUID)
//  Stabile ID in localStorage, wird nur einmal erzeugt
//  und nie auf undefined/null zurückgesetzt.
// ─────────────────────────────────────────────────
let storedOwnerId = localStorage.getItem(OWNER_ID_KEY)
if (!storedOwnerId) {
  storedOwnerId = crypto.randomUUID()
  localStorage.setItem(OWNER_ID_KEY, storedOwnerId)
}

const ownerId = ref<string>(storedOwnerId)

// ─────────────────────────────────────────────────
//  STATE – Zugangscode (Stufe 1, identifiziert die Galerie)
// ─────────────────────────────────────────────────
const galleryCode = ref<string>(localStorage.getItem(GALLERY_CODE_KEY) || '')
const showCodePrompt = ref(false)
const codeInput = ref('')
const codeRecovering = ref(false)

// ─────────────────────────────────────────────────
//  STATE – Persönlicher Bearbeitungs-Code (Stufe 2, schützt Uploads)
//  isPasswordVerified ist die einzige Quelle der Wahrheit dafür,
//  ob der Hauptbereich sichtbar ist (NICHT password truthy prüfen!)
// ─────────────────────────────────────────────────
const password = ref<string>(localStorage.getItem(PASSWORD_KEY) || '')
const isPasswordVerified = ref<boolean>(!!localStorage.getItem(PASSWORD_KEY))
const showPasswordPrompt = ref(!isPasswordVerified.value)
const passwordVerifying = ref(false)
const passwordError = ref('')

/**
 * Steuert, welcher Unter-Dialog in Stufe 2 angezeigt wird:
 * null      → Auswahlbuttons ("neu" vs. "bereits vorhanden")
 * 'new'     → Erklärtext für Erstbesucher + Eingabefeld
 * 'existing'→ Direktes Eingabefeld für bereits bekannten Code
 */
const editingCodeMode = ref<'new' | 'existing' | null>(null)

// ─────────────────────────────────────────────────
//  STATE – Fotos
// ─────────────────────────────────────────────────
const photos = ref<Photo[]>([])
const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref('')
const errorMsg = ref('')

// ─────────────────────────────────────────────────
//  STATE – Lightbox
// ─────────────────────────────────────────────────
const lightboxSrc = ref<string | null>(null)

// ─────────────────────────────────────────────────
//  STATE – Drag & Drop
// ─────────────────────────────────────────────────
const dragOver = ref(false)

// ─────────────────────────────────────────────────
//  STATE – Mehrfachauswahl
// ─────────────────────────────────────────────────
const selectedIds = ref<Set<string>>(new Set())

// ─────────────────────────────────────────────────
//  STATE – Filter & Sort
// ─────────────────────────────────────────────────
const showOnlyMine = ref(false)
const sortNewestFirst = ref(true)

// ─────────────────────────────────────────────────
//  STATE – Upload-Zähler
// ─────────────────────────────────────────────────
const uploadDone = ref(0)
const uploadTotal = ref(0)

// ─────────────────────────────────────────────────
//  COMPUTED – Gefilterte & sortierte Fotos
// ─────────────────────────────────────────────────
const filteredPhotos = computed<Photo[]>(() => {
  let result = [...photos.value]

  if (showOnlyMine.value) {
    const userId = ownerId.value
    if (userId) {
      result = result.filter((p) => p.owner_id === userId)
    }
  }

  if (sortNewestFirst.value) {
    result.sort((a, b) => b.created_at - a.created_at)
  } else {
    result.sort((a, b) => a.created_at - b.created_at)
  }

  return result
})

// ─────────────────────────────────────────────────
//  COMPUTED – Darf irgendein ausgewähltes Foto gelöscht werden?
// ─────────────────────────────────────────────────
const isDev = import.meta.env.DEV

const canDeleteAny = computed<boolean>(() => {
  if (isDev) return selectedIds.value.size > 0
  const userId = ownerId.value
  return photos.value.some(
    (p) => selectedIds.value.has(p.id) && p.owner_id === userId,
  )
})

// ─────────────────────────────────────────────────
//  HILFSFUNKTIONEN
// ─────────────────────────────────────────────────

/** Prüft ob ein Foto dem aktuellen Nutzer gehört */
function photoBelongsToUser(photo: Photo): boolean {
  return photo.owner_id === ownerId.value
}

/** Extrahiert den Dateinamen aus einer Lightbox-URL */
function getFilenameFromUrl(url: string): string {
  return url.split('/').pop() ?? ''
}

// ─────────────────────────────────────────────────
//  ZUGANGSCODE – GENERIERUNG & RECOVERY
// ─────────────────────────────────────────────────

/** Generiert einen 8-stelligen Zugangscode */
function generateCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

/**
 * Neuen Zugangscode anfordern.
 * Erstellt einen Firestore-Eintrag und speichert Code + Owner-ID lokal.
 */
async function requestNewCode(): Promise<void> {
  errorMsg.value = ''
  try {
    const newCode = generateCode()
    await addDoc(collection(db, 'gallery_owners'), {
      code: newCode,
      owner_id: ownerId.value,
      created_at: serverTimestamp(),
    })
    localStorage.setItem(GALLERY_CODE_KEY, newCode)
    galleryCode.value = newCode
    showCodePrompt.value = false
    await loadPhotos()
  } catch (e) {
    console.error('requestNewCode:', e)
    errorMsg.value = 'Zugangscode konnte nicht erstellt werden.'
  }
}

/**
 * Existierenden Zugangscode wiederherstellen.
 * Sucht den Code in Firestore und aktualisiert die gespeicherte Owner-ID.
 */
async function recoverByCode(): Promise<void> {
  if (!codeInput.value || codeInput.value.length !== 8) return

  codeRecovering.value = true
  errorMsg.value = ''
  try {
    const snap = await getDocs(
      query(
        collection(db, 'gallery_owners'),
        where('code', '==', codeInput.value.toUpperCase()),
        limit(1),
      ),
    )
    if (!snap.empty) {
      const data = snap.docs[0]!.data()
      const recoveredOwnerId = data.owner_id as string
      ownerId.value = recoveredOwnerId
      localStorage.setItem(OWNER_ID_KEY, recoveredOwnerId)
      localStorage.setItem(GALLERY_CODE_KEY, codeInput.value.toUpperCase())
      galleryCode.value = codeInput.value.toUpperCase()
      showCodePrompt.value = false
      await loadPhotos()
    } else {
      errorMsg.value = 'Zugangscode nicht gefunden.'
    }
  } catch (e) {
    console.error('recoverByCode:', e)
    errorMsg.value = 'Fehler bei der Code-Prüfung.'
  } finally {
    codeRecovering.value = false
  }
}

/**
 * Versucht beim Laden automatisch, die Owner-ID zum gespeicherten
 * Zugangscode zu finden (falls z.B. localStorage-Owner-ID verloren ging).
 */
async function tryAutoRecover(): Promise<void> {
  if (!galleryCode.value) return
  try {
    const snap = await getDocs(
      query(
        collection(db, 'gallery_owners'),
        where('code', '==', galleryCode.value),
        limit(1),
      ),
    )
    if (!snap.empty) {
      const data = snap.docs[0]!.data()
      const recoveredOwnerId = data.owner_id as string
      ownerId.value = recoveredOwnerId
      localStorage.setItem(OWNER_ID_KEY, recoveredOwnerId)
    }
  } catch (e) {
    console.error('tryAutoRecover:', e)
  }
}

// ─────────────────────────────────────────────────
//  PERSÖNLICHER BEARBEITUNGS-CODE – VERIFIKATION
//  Bei Erfolg: isPasswordVerified = true, Prompt schließt.
//  Bei 401: Fehlermeldung, password + isPasswordVerified zurücksetzen.
// ─────────────────────────────────────────────────

/**
 * Sendet den eingegebenen Bearbeitungs-Code an den Server zur Verifikation.
 * Bei Erfolg: als verifiziert markieren, Prompt schließen.
 * Bei Fehler: Fehlermeldung anzeigen, Eingabe zurücksetzen.
 */
async function verifyPassword(): Promise<void> {
  if (!password.value) return

  passwordVerifying.value = true
  passwordError.value = ''
  try {
    const res = await fetch(`${API}/api/upload`, {
      method: 'POST',
      headers: {
        'X-Upload-Password': password.value,
        'X-Owner-Id': ownerId.value,
      },
      body: new FormData(), // Leere FormData = kein Datei-Upload, nur Verifikation
    })

    if (res.status === 401) {
      passwordError.value = 'Falscher Bearbeitungs-Code!'
      password.value = ''
      isPasswordVerified.value = false
      localStorage.removeItem(PASSWORD_KEY)
      return
    }

    localStorage.setItem(PASSWORD_KEY, password.value)
    isPasswordVerified.value = true
    showPasswordPrompt.value = false
    editingCodeMode.value = null
  } catch {
    passwordError.value = 'Verbindungsfehler.'
    password.value = ''
    isPasswordVerified.value = false
    localStorage.removeItem(PASSWORD_KEY)
  } finally {
    passwordVerifying.value = false
  }
}

/**
 * Behandelt den Fall, dass der Server den Upload mit 401 ablehnt
 * (z.B. weil der Bearbeitungs-Code auf dem Server geändert wurde).
 */
function handleUnauthorizedUpload(): void {
  errorMsg.value = 'Dein gespeicherter Bearbeitungs-Code ist nicht mehr gültig.'
  password.value = ''
  isPasswordVerified.value = false
  showPasswordPrompt.value = true
  editingCodeMode.value = null
  localStorage.removeItem(PASSWORD_KEY)
}

// ─────────────────────────────────────────────────
//  FOTOS LADEN
// ─────────────────────────────────────────────────

/** Lädt die Foto-Liste vom Backend */
async function loadPhotos(): Promise<void> {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch(`${API}/api/photos?limit=100`)
    if (!res.ok) throw new Error('Laden fehlgeschlagen')
    const data: { photos: Photo[] } = await res.json()
    photos.value = data.photos ?? []
  } catch (e: unknown) {
    console.error('loadPhotos:', e)
    errorMsg.value = 'Fotos konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

// ─────────────────────────────────────────────────
//  UPLOAD
//  Hinweis: Diese Funktion war in deiner Vorlage per [...] gekürzt.
//  Ich übernehme die erkennbare Grundstruktur (Batches, Progress,
//  401-Handling); bitte gegen deine echte Implementierung abgleichen.
// ─────────────────────────────────────────────────

async function handleUpload(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  uploading.value = true
  errorMsg.value = ''
  uploadProgress.value = ''
  uploadDone.value = 0
  uploadTotal.value = files.length

  const BATCH_SIZE = 5
  let uploadedCount = 0

  try {
    const fileArray = Array.from(files)

    for (let i = 0; i < fileArray.length; i += BATCH_SIZE) {
      const batch = fileArray.slice(i, i + BATCH_SIZE)
      const formData = new FormData()
      batch.forEach((file) => formData.append('photos', file))

      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: {
          'X-Upload-Password': password.value,
          'X-Owner-Id': ownerId.value,
        },
        body: formData,
      })

      if (res.status === 401) {
        handleUnauthorizedUpload()
        return
      }

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(err.error ?? 'Upload fehlgeschlagen.')
      }

      uploadedCount += batch.length
      uploadDone.value = uploadedCount
    }

    uploadProgress.value = `${uploadedCount} Foto(s) hochgeladen!`
    await loadPhotos()
  } catch (e: unknown) {
    const err = e as Error
    errorMsg.value = err.message
  } finally {
    uploading.value = false
    input.value = ''
    setTimeout(() => (uploadProgress.value = ''), 4000)
  }
}

// ─────────────────────────────────────────────────
//  AUSWAHL (Mehrfachauswahl für Bulk-Aktionen)
// ─────────────────────────────────────────────────

/** Schaltet die Auswahl eines Fotos um */
function toggleSelect(id: string): void {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

/**
 * Klick auf ein Foto: entweder Auswahl umschalten oder Lightbox öffnen.
 */
function handlePhotoClick(photo: Photo): void {
  if (selectedIds.value.size > 0) {
    toggleSelect(photo.id)
  } else {
    lightboxSrc.value = `${API}/uploads/${photo.filename}`
  }
}

/** Schließt die Lightbox */
function closeLightbox(): void {
  lightboxSrc.value = null
}

// ─────────────────────────────────────────────────
//  DOWNLOAD
//  Hinweis: In deiner Vorlage per [...] gekürzt, hier sinnvoll ergänzt.
// ─────────────────────────────────────────────────

/** Lädt ein einzelnes Foto über einen unsichtbaren Link herunter */
function downloadPhoto(filename: string): void {
  const link = document.createElement('a')
  link.href = `${API}/uploads/${filename}`
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** Lädt alle aktuell ausgewählten Fotos nacheinander herunter */
function downloadSelected(): void {
  const selected = photos.value.filter((p) => selectedIds.value.has(p.id))
  selected.forEach((photo) => downloadPhoto(photo.filename))
}

// ─────────────────────────────────────────────────
//  LÖSCHEN
// ─────────────────────────────────────────────────

/**
 * Löscht ein Foto anhand seiner ID.
 * Verwendet die Owner-ID des Fotos (nicht zwingend die eigene).
 */
async function deletePhotoById(id: string, photoOwnerId?: string): Promise<void> {
  const deletingOwner = isDev && photoOwnerId ? photoOwnerId : ownerId.value
  try {
    const res = await fetch(`${API}/api/photos/${id}`, {
      method: 'DELETE',
      headers: { 'X-Owner-Id': deletingOwner },
    })
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(err.error ?? 'Löschen fehlgeschlagen.')
    }
    photos.value = photos.value.filter((p) => p.id !== id)
  } catch (e: unknown) {
    const err = e as Error
    errorMsg.value = err.message
  }
}

/** Löscht ein einzelnes Foto nach Bestätigung */
async function deletePhoto(id: string): Promise<void> {
  if (!confirm('Dieses Foto wirklich löschen?')) return
  const photo = photos.value.find((p) => p.id === id)
  await deletePhotoById(id, photo?.owner_id)
}

/** Löscht alle ausgewählten Fotos nach Bestätigung */
async function deleteSelected(): Promise<void> {
  const ids = Array.from(selectedIds.value)
  if (!confirm(`${ids.length} Foto(s) wirklich löschen?`)) return
  selectedIds.value = new Set()
  const toDelete = photos.value.filter((p) => ids.includes(p.id))
  for (const photo of toDelete) {
    await deletePhotoById(photo.id, photo.owner_id)
  }
}

// ─────────────────────────────────────────────────
//  DRAG & DROP
// ─────────────────────────────────────────────────

function onDragOver(): void {
  dragOver.value = true
}

function onDragLeave(): void {
  dragOver.value = false
}

function onDrop(e: DragEvent): void {
  dragOver.value = false
  if (!e.dataTransfer?.files.length) return
  const fakeInput = { files: e.dataTransfer.files } as unknown as HTMLInputElement
  handleUpload({ target: fakeInput } as unknown as Event)
}

// ─────────────────────────────────────────────────
//  KEYBOARD-NAVIGATION (Lightbox)
// ─────────────────────────────────────────────────

/**
 * Keyboard-Steuerung in der Lightbox:
 * - Escape: Lightbox schließen
 * - Pfeil links/rechts: zum vorherigen/nächsten Foto navigieren
 */
function onKeydown(e: KeyboardEvent): void {
  if (!lightboxSrc.value) return

  switch (e.key) {
    case 'Escape':
      closeLightbox()
      break
    case 'ArrowRight':
    case 'ArrowLeft': {
      const current = filteredPhotos.value.findIndex(
        (p) => `${API}/uploads/${p.filename}` === lightboxSrc.value,
      )
      if (current === -1) return
      const next =
        e.key === 'ArrowRight'
          ? (current + 1) % filteredPhotos.value.length
          : (current - 1 + filteredPhotos.value.length) % filteredPhotos.value.length
      const nextPhoto = filteredPhotos.value[next]
      if (nextPhoto) {
        lightboxSrc.value = `${API}/uploads/${nextPhoto.filename}`
      }
      break
    }
  }
}

// ─────────────────────────────────────────────────
//  LIFECYCLE
// ─────────────────────────────────────────────────

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)

  // Anonym anmelden (für Firestore-Code-Recovery)
  try {
    await signInAnonymously(auth)
  } catch {
    // Silent – ohne Auth funktioniert Code-Recovery nicht, aber Galerie-Anzeige schon
  }

  // Flow: Zugangscode vorhanden?
  if (!galleryCode.value) {
    showCodePrompt.value = true
    // Owner-ID wurde oben bereits initialisiert (nie undefined)
  } else {
    if (!ownerId.value) {
      await tryAutoRecover()
    }
    await loadPhotos()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped></style>
