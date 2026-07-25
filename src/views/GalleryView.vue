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
      <div v-if="showCodePrompt" class="mb-8 p-6 border-4 border-accent rounded-3xl bg-accent/10 max-w-md">
        <p class="font-bold mb-3">🔑 Zugangscode eingeben</p>
        <p class="text-sm opacity-70 mb-3">
          Hast du bereits einen Zugangscode zur Galerie? Dann gib ihn ein. Sonst fordere einen
          neuen an.
        </p>
        <div class="flex gap-2 mb-3">
          <input v-model="codeInput" type="text" class="form-input uppercase flex-1"
            placeholder="8-stelliger Zugangscode" maxlength="8" @keyup.enter="recoverByCode" />
          <button
            class="bg-accent text-white font-display px-4 py-2 rounded-full hover:bg-accent/80 transition-colors text-sm"
            :disabled="codeRecovering" @click="recoverByCode">
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
      <div v-if="showPasswordPrompt && galleryCode && !isPasswordVerified"
        class="mb-8 p-6 border-4 border-accent rounded-3xl bg-accent/10 max-w-md">
        <p class="font-bold mb-3">🔒 Persönlicher Bearbeitungs-Code</p>
        <p class="text-sm opacity-70 mb-4">
          Dieser Code schützt deine hochgeladenen Fotos – nur damit kannst du später eigene Fotos
          bearbeiten oder löschen.
        </p>

        <!-- Auswahl: Neuer Besucher vs. bereits vorhandener Code -->
        <div v-if="!editingCodeMode" class="flex flex-col gap-2 mb-2">
          <button
            class="bg-primary text-secondary font-display px-6 py-2 rounded-full hover:bg-accent transition-colors text-left"
            @click="editingCodeMode = 'new'">
            ✨ Ich bin zum ersten Mal hier
          </button>
          <button
            class="border-2 border-primary text-primary font-display px-6 py-2 rounded-full hover:bg-primary/10 transition-colors text-left"
            @click="editingCodeMode = 'existing'">
            🔑 Ich habe bereits einen Bearbeitungs-Code
          </button>
        </div>

        <!-- Pfad A: Neuer Besucher -->
        <div v-else-if="editingCodeMode === 'new'" class="mb-2">
          <p class="text-sm mb-3">
            Diesen Bearbeitungs-Code hast du (z.B. auf eurer Einladungskarte) von den Brautleuten
            erhalten. Gib ihn hier einmalig ein – danach merkt sich dein Browser ihn automatisch.
          </p>
          <input v-model="password" type="password" class="form-input mb-3" :class="{ 'border-red-500': passwordError }"
            placeholder="Bearbeitungs-Code…" :disabled="passwordVerifying" @keyup.enter="verifyPassword"
            @input="passwordError = ''" />
          <div class="flex gap-2">
            <button
              class="bg-primary text-secondary font-display px-6 py-2 rounded-full hover:bg-accent transition-colors"
              :disabled="passwordVerifying || !password" @click="verifyPassword">
              {{ passwordVerifying ? 'Prüfe…' : 'Bestätigen' }}
            </button>
            <button class="text-sm underline opacity-60 hover:opacity-100" @click="editingCodeMode = null">
              Zurück
            </button>
          </div>
        </div>

        <!-- Pfad B: Bereits vorhandener Code -->
        <div v-else-if="editingCodeMode === 'existing'" class="mb-2">
          <input v-model="password" type="password" class="form-input mb-3" :class="{ 'border-red-500': passwordError }"
            placeholder="Deinen Bearbeitungs-Code eingeben…" :disabled="passwordVerifying" @keyup.enter="verifyPassword"
            @input="passwordError = ''" />
          <div class="flex gap-2">
            <button
              class="bg-primary text-secondary font-display px-6 py-2 rounded-full hover:bg-accent transition-colors"
              :disabled="passwordVerifying || !password" @click="verifyPassword">
              {{ passwordVerifying ? 'Prüfe…' : 'Bestätigen' }}
            </button>
            <button class="text-sm underline opacity-60 hover:opacity-100" @click="editingCodeMode = null">
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
          <p class="text-2xl sm:text-3xl font-mono font-bold tracking-widest text-accent select-all break-all">
            {{ galleryCode }}
          </p>
        </div>

        <!-- ═════════════════════════════════════════ -->
        <!--  UPLOAD-BEREICH                            -->
        <!-- ═════════════════════════════════════════ -->
        <div class="relative mb-10" @dragover.prevent="onDragOver" @drop.prevent="onDrop" @dragleave="onDragLeave">
          <!-- Drag-Overlay -->
          <div v-if="dragOver"
            class="absolute inset-0 z-10 border-4 border-dashed border-accent rounded-3xl bg-accent/10 flex items-center justify-center text-lg font-display">
            Fotos hier ablegen
          </div>

          <!-- Upload-Button -->
          <StorageBar />
          <label
            class="inline-block cursor-pointer bg-accent text-white font-display text-xl px-8 py-3 rounded-full shadow-xl hover:scale-100 transition-transform"
            :class="{ 'opacity-50 pointer-events-none': uploading }">
            {{ uploading ? 'Lädt hoch…' : '+ Fotos hochladen' }}
            <input type="file" accept="image/*" multiple class="hidden" :disabled="uploading" @change="handleUpload" />
          </label>

          <!-- Upload Progress Bar -->
          <div v-if="uploadDone > 0 || uploadTotal > 0" class="mt-3 max-w-xs">
            <div class="bg-gray-200 rounded-full h-2 w-full">
              <div class="bg-accent h-2 rounded-full transition-all duration-300"
                :style="{ width: uploadTotal > 0 ? (uploadDone / uploadTotal) * 100 + '%' : '0%' }"></div>
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

          <!-- Sortierung -->
          <div class="flex items-center gap-2">
            <span class="text-sm opacity-70">Sortieren:</span>
            <div class="flex rounded-full border border-accent/40 overflow-hidden">
              <button class="px-3 py-1 text-xs font-bold transition-colors"
                :class="sortField === 'taken_at' ? 'bg-accent text-white' : 'bg-white text-primary hover:bg-accent/10'"
                @click="sortField = 'taken_at'">
                Aufnahmedatum
              </button>
              <button class="px-3 py-1 text-xs font-bold transition-colors"
                :class="sortField === 'created_at' ? 'bg-accent text-white' : 'bg-white text-primary hover:bg-accent/10'"
                @click="sortField = 'created_at'">
                Upload-Datum
              </button>
            </div>
            <button class="text-sm opacity-70 hover:opacity-100 transition-opacity"
              @click="sortDir = sortDir === 'desc' ? 'asc' : 'desc'"
              :title="sortDir === 'desc' ? 'Neueste zuerst' : 'Älteste zuerst'">
              {{ sortDir === 'desc' ? '↓ Neueste' : '↑ Älteste' }}
            </button>
          </div>
        </div>

        <!-- ═════════════════════════════════════════ -->
        <!--  LIGHTBOX TUTORIAL                         -->
        <!-- ═════════════════════════════════════════ -->
        <div
          class="mb-6 p-3 sm:p-4 border border-accent/20 rounded-2xl bg-accent/5 text-xs sm:text-sm text-primary/70 leading-relaxed">
          <p>🖼️ <strong>Tipp:</strong> Tippe auf ein Foto, um es in der <strong>Lightbox</strong> zu öffnen. Dort
            kannst du <strong>wischen</strong> ← → oder die <strong>Pfeiltasten</strong> zum Blättern nutzen, mit
            <strong>Esc / Tap</strong> schließen oder das <strong>Original</strong> herunterladen.
          </p>
        </div>

        <!-- Ladezustand -->
        <div v-if="loading" class="text-center py-10 text-lg opacity-70">Lade Fotos…</div>

        <!-- Leerer Zustand -->
        <div v-else-if="filteredPhotos.length === 0" class="text-center py-10 text-lg opacity-70">
          Noch keine Fotos – sei die/der Erste!
        </div>

        <!-- Speicherstand -->
        <div v-if="!loading && storageTotal > 0" class="mb-4 px-4 py-2 rounded-lg text-sm font-mono"
          :class="isDev ? 'bg-yellow-900/40 text-yellow-200 border border-yellow-700' : 'bg-gray-100 dark:bg-gray-800'">
          <span v-if="isDev">🔧 Dev: </span>
          Speicher: {{ (storageUsed / 1024 / 1024).toFixed(1) }} /
          {{ (storageTotal / 1024 / 1024).toFixed(1) }} MB
          ({{ ((storageUsed / storageTotal) * 100).toFixed(0) }}% belegt)
        </div>

        <!-- ═════════════════════════════════════════ -->
        <!--  FOTO-GRID – mit FLIP-Animation beim Löschen -->
        <!-- ═════════════════════════════════════════ -->
        <MasonryWall :items="filteredPhotos" :column-width="masonryColWidth" :gap="16" :ssr-columns="2" class="w-full">
          <template #default="{ item: photo }">
            <div :key="photo.id" class="mb-2 rounded shadow-lg bg-white overflow-hidden transition-all duration-300"
              :class="{ 'opacity-40 scale-95': deletingIds.has(photo.id) }">
              <div class="relative">
                <img :src="`${API}/uploads/thumbs/${photo.thumb}`" :alt="`Foto ${photo.id}`" loading="lazy"
                  decoding="async" class="w-full h-auto block cursor-pointer hover:opacity-95 transition-opacity"
                  @click="handlePhotoClick(photo)" />
                <input type="checkbox" :checked="selectedIds.has(photo.id)"
                  class="absolute top-2 left-2 w-5 h-5 accent-accent cursor-pointer" @click.stop
                  @change="toggleSelect(photo.id)" />

                <!-- Metadaten-Badge -->
                <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1">
                  {{ photo.taken_at ? '📷 ' + formatDate(photo.taken_at) : '⬆️ ' + formatDate(photo.created_at) }}
                </div>
              </div>
              <!-- Aktionen bleiben wie gehabt -->
            </div>
          </template>
        </MasonryWall>

        <!-- ═════════════════════════════════════════ -->
        <!--  BULK-ACTION-BAR                           -->
        <!-- ═════════════════════════════════════════ -->
        <div v-if="selectedIds.size > 0"
          class="fixed bottom-8 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-white border-2 border-accent/30 rounded-2xl sm:rounded-full shadow-2xl px-4 sm:px-6 py-3 w-[calc(100%-2rem)] sm:w-auto max-w-sm sm:max-w-none">
          <span class="text-sm font-bold text-center sm:text-left whitespace-nowrap">{{ selectedIds.size }}
            ausgewählt</span>
          <button
            class="bg-accent text-white font-display px-5 py-2 rounded-full text-sm hover:bg-accent/80 transition-colors"
            @click="downloadSelected">
            ⬇️ Herunterladen
          </button>
          <button v-if="canDeleteAny"
            class="bg-red-500 text-white font-display px-5 py-2 rounded-full text-sm hover:bg-red-700 transition-colors"
            @click="deleteSelected">
            ✕ Löschen
          </button>
          <button class="text-sm underline opacity-60 hover:opacity-100" @click="selectedIds.clear()">
            Abwählen
          </button>
        </div>

        <!-- ═════════════════════════════════════════ -->
        <!--  LIGHTBOX – mit Metadaten                  -->
        <!-- ═════════════════════════════════════════ -->
        <div v-if="lightboxSrc"
          class="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-2 sm:p-4"
          @click="onLightboxClick" @touchstart="onTouchStart" @touchend="onTouchEnd">
          <button
            class="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 text-white text-3xl sm:text-4xl font-bold hover:text-accent transition-colors w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center"
            @click="lightboxSrc = null">
            ✕
          </button>
          <div class="flex flex-col items-center w-full max-w-2xl px-1 sm:px-4">
            <img :src="lightboxSrc" class="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain rounded-lg" />

            <!-- Lightbox-Caption mit Metadaten -->
            <div v-if="lightboxPhoto" class="mt-3 sm:mt-4 text-center w-full">
              <p v-if="getPhotoDateLabel(lightboxPhoto)" class="text-white text-xs sm:text-sm mb-1 break-words px-2">
                📷 {{ getPhotoDateLabel(lightboxPhoto) }}
              </p>
              <p v-if="getPhotoSizeLabel(lightboxPhoto)" class="text-white/50 text-xs">
                {{ getPhotoSizeLabel(lightboxPhoto) }}
              </p>
            </div>

            <button
              class="mt-4 sm:mt-6 bg-primary text-secondary font-display px-6 sm:px-8 py-3 sm:py-2 rounded-full hover:bg-accent transition-colors w-full sm:w-auto text-sm sm:text-base"
              @click.stop="downloadPhoto(getFilenameFromUrl(lightboxSrc))">
              ⬇️ Original herunterladen
            </button>
          </div>
        </div>

      </template>
    </div>

    <Footer>Bitte lächeln</Footer>
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
import { MasonryWall } from '@yeger/vue-masonry-wall'
import StorageBar from './StorageBar.vue'

// ─────────────────────────────────────────────────
//  KONSTANTEN & TYPEN
// ─────────────────────────────────────────────────
const API = 'https://galerie.auszweiwirdeins.de'
const OWNER_ID_KEY = 'galerie_owner_id'
const GALLERY_CODE_KEY = 'galerie_gallery_code'
const PASSWORD_KEY = 'galerie_password'

interface Photo {
  id: string
  filename: string
  thumb: string
  owner_id: string
  created_at: number
  size?: number
  taken_at?: string | null
}

// ─────────────────────────────────────────────────
//  STATE – Owner-ID (persistiert, einmalige UUID)
// ─────────────────────────────────────────────────
let storedOwnerId = localStorage.getItem(OWNER_ID_KEY)
if (!storedOwnerId) {
  storedOwnerId = crypto.randomUUID()
  localStorage.setItem(OWNER_ID_KEY, storedOwnerId)
}


const ownerId = ref<string>(storedOwnerId)

// ─────────────────────────────────────────────────
//  STATE – Zugangscode (Stufe 1)
// ─────────────────────────────────────────────────
const galleryCode = ref<string>(localStorage.getItem(GALLERY_CODE_KEY) || '')
const showCodePrompt = ref(false)
const codeInput = ref('')
const codeRecovering = ref(false)

// ─────────────────────────────────────────────────
//  STATE – Persönlicher Bearbeitungs-Code (Stufe 2)
// ─────────────────────────────────────────────────
const password = ref<string>(localStorage.getItem(PASSWORD_KEY) || '')
const isPasswordVerified = ref<boolean>(!!localStorage.getItem(PASSWORD_KEY))
const showPasswordPrompt = ref(!isPasswordVerified.value)
const passwordVerifying = ref(false)
const passwordError = ref('')

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
const lightboxPhoto = ref<Photo | null>(null)

// ─────────────────────────────────────────────────
//  STATE – Drag & Drop
// ─────────────────────────────────────────────────
const dragOver = ref(false)

// ─────────────────────────────────────────────────
//  STATE – Mehrfachauswahl
// ─────────────────────────────────────────────────
const selectedIds = ref<Set<string>>(new Set())

// ─────────────────────────────────────────────────
//  STATE – Filter & Sortierung
// ─────────────────────────────────────────────────
const showOnlyMine = ref(false)
const sortField = ref<'taken_at' | 'created_at'>('taken_at')
const sortDir = ref<'asc' | 'desc'>('desc')

// ─────────────────────────────────────────────────
//  STATE – Optimistisches Löschen
//  Fotos werden sofort aus der UI entfernt, der
//  API-Call läuft im Hintergrund. Bei Fehler wird
//  die UI wiederhergestellt (Rollback).
// ─────────────────────────────────────────────────

// ─────────────────────────────────────────────────
//  STATE – Upload-Zähler
// ─────────────────────────────────────────────────
const uploadDone = ref(0)
const uploadTotal = ref(0)

// ─────────────────────────────────────────────────
//  COMPUTED – Responsive Masonry column width
// ─────────────────────────────────────────────────
const masonryColWidth = computed(() => {
  if (typeof window === 'undefined') return 280
  return window.innerWidth < 640 ? 110 : 280
})
//  • Nullwerte in taken_at werden konsistent
//    ans Ende sortiert.
//  • Keine Seiteneffekte auf photos.value.
// ─────────────────────────────────────────────────
const filteredPhotos = computed<Photo[]>(() => {
  let result = [...photos.value]

  if (showOnlyMine.value) {
    result = result.filter(photoBelongsToUser)
  }

  // Sortierung nach chosen sort key
  result.sort((a, b) => {
    if (sortField.value === 'taken_at') {
      // taken_at: ISO-String oder null/undefined
      const dateA = a.taken_at ?? null
      const dateB = b.taken_at ?? null

      if (dateA === null && dateB === null) return 0
      if (dateA === null) return 1   // null/undefined → ans Ende
      if (dateB === null) return -1  // null/undefined → ans Ende

      return sortDir.value === 'desc'
        ? dateB.localeCompare(dateA)
        : dateA.localeCompare(dateB)
    } else {
      // created_at: Zahl (epoch ms)
      return sortDir.value === 'desc'
        ? b.created_at - a.created_at
        : a.created_at - b.created_at
    }
  })

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
//  HILFSFUNKTIONEN – Metadaten
// ─────────────────────────────────────────────────

/** Formatiert Date.now() oder ISO-String nach dt. Darstellung */
function formatDate(value: number | string | null | undefined, style: 'long' | 'short' = 'long'): string {
  let date: Date
  if (typeof value === 'number') {
    date = new Date(value)
  } else if (typeof value === 'string') {
    date = new Date(value)
  } else {
    return ''
  }
  if (isNaN(date.getTime())) return ''

  const d = date.getDate().toString().padStart(2, '0')
  const mo = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  const h = date.getHours().toString().padStart(2, '0')
  const mi = date.getMinutes().toString().padStart(2, '0')

  if (style === 'short') return `${d}.${mo}.${y}`
  return `${d}.${mo}.${y}, ${h}:${mi}`
}

/**
 * Lesbares Label für ein Foto-Datum.
 * Bevorzugt taken_at, fällt zurück auf created_at.
 * Zeigt Upload-Datum nur, wenn kein EXIF-Datum vorhanden.
 */
function getPhotoDateLabel(photo: Photo): string {
  if (photo.taken_at) {
    return formatDate(photo.taken_at)
  }
  if (photo.created_at) {
    return `Hochgeladen am ${formatDate(photo.created_at, 'short')}`
  }
  return ''
}

/**
 * Human-readable Dateigröße (KB/MB).
 */
function getPhotoSizeLabel(photo: Photo): string {
  if (!photo.size) return ''
  const mb = photo.size / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${(photo.size / 1024).toFixed(0)} KB`
}

// ─────────────────────────────────────────────────
//  HILFSFUNKTIONEN
// ─────────────────────────────────────────────────

/** Extrahiert den Dateinamen aus einer Lightbox-URL */
function getFilenameFromUrl(url: string): string {
  return url.split('/').pop() ?? ''
}

// ─────────────────────────────────────────────────
//  ZUGANGSCODE – GENERIERUNG & RECOVERY
// ─────────────────────────────────────────────────

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

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
// ─────────────────────────────────────────────────

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
      body: new FormData(),
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

function toggleSelect(id: string): void {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function handlePhotoClick(photo: Photo): void {
  if (selectedIds.value.size > 0) {
    toggleSelect(photo.id)
  } else {
    lightboxSrc.value = `${API}/uploads/${photo.filename}`
    lightboxPhoto.value = photo
  }
}

function closeLightbox(): void {
  lightboxSrc.value = null
  lightboxPhoto.value = null
}

// ─────────────────────────────────────────────────
//  DOWNLOAD
// ─────────────────────────────────────────────────

function downloadPhoto(filename: string): void {
  const link = document.createElement('a')
  link.href = `${API}/uploads/${filename}`
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function downloadSelected(): void {
  const selected = photos.value.filter((p) => selectedIds.value.has(p.id))
  selected.forEach((photo) => downloadPhoto(photo.filename))
}

// ─────────────────────────────────────────────────
//  LÖSCHEN – optimistisch, ohne Flicker
//
//  Vorgehen:
//  1. Sofort in pendingDeleteIds merken → Spinner anzeigen
//  2. Sofort aus photos.value entfernen  → Grid re-rendert ohne Flicker
//     (kein await, keine Race Conditions)
//  3. API-Call im Hintergrund
//  4. Bei Fehler: rollback, Fehlermeldung
// ─────────────────────────────────────────────────

// STATE – Speicherstand
const storageUsed = ref(0)
const storageTotal = ref(0)


/** Lädt die Speicherauslastung vom Backend */
async function loadStorage(): Promise<void> {
  try {
    const res = await fetch(`${API}/api/storage`, {
      headers: { 'X-Upload-Password': password.value }
    })
    const data = await res.json()
    storageUsed.value = data.used ?? 0
    storageTotal.value = data.total ?? 0
  } catch {
    // Silent fail – API-Endpoint optional
  }
}
/** Prüft ob ein Foto dem aktuellen Nutzer gehört */
function photoBelongsToUser(photo: Photo): boolean {
  return photo.owner_id === ownerId.value
}

const deletingIds = ref<Set<string>>(new Set())

async function deleteSelected(): Promise<void> {
  const ids = Array.from(selectedIds.value)
  if (!confirm(`${ids.length} Foto(s) wirklich löschen?`)) return

  // 1. Erst optisch ausblenden (300ms Transition greift)
  deletingIds.value = new Set(ids)
  selectedIds.value = new Set()

  try {
    const res = await fetch(`${API}/api/photos`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-Owner-Id': ownerId.value },
      body: JSON.stringify({ ids }),
    })
    if (!res.ok) throw new Error('Löschen fehlgeschlagen.')

    const data = (await res.json()) as {
      deleted: string[]
      failed: { id: string; reason: string }[]
    }

    // 2. Nach kurzer Verzögerung aus der Liste nehmen → Masonry rechnet EINMAL neu
    await new Promise((r) => setTimeout(r, 300))
    photos.value = photos.value.filter((p) => !data.deleted.includes(p.id))
    deletingIds.value = new Set()

    await loadStorage()

    if (data.failed.length > 0) {
      // …deine Fehlerbehandlung wie gehabt
    }
  } catch (e: unknown) {
    deletingIds.value = new Set() // Rollback: Bilder wieder voll sichtbar
    errorMsg.value = (e as Error).message
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
//  KEYBOARD-NAVIGATION & SWIPE (Lightbox)
// ─────────────────────────────────────────────────

let touchStartX = 0
let touchStartY = 0
let touchSwiped = false

function navigatePhoto(dir: 'prev' | 'next'): void {
  if (!lightboxSrc.value) return
  const current = filteredPhotos.value.findIndex(
    (p) => `${API}/uploads/${p.filename}` === lightboxSrc.value,
  )
  if (current === -1) return
  const next =
    dir === 'next'
      ? (current + 1) % filteredPhotos.value.length
      : (current - 1 + filteredPhotos.value.length) % filteredPhotos.value.length
  const nextPhoto = filteredPhotos.value[next]
  if (nextPhoto) {
    lightboxSrc.value = `${API}/uploads/${nextPhoto.filename}`
    lightboxPhoto.value = nextPhoto
  }
}

function onTouchStart(e: TouchEvent): void {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  touchSwiped = false
}

function onTouchEnd(e: TouchEvent): void {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    touchSwiped = true
    navigatePhoto(dx > 0 ? 'prev' : 'next')
  }
}

function onLightboxClick(): void {
  if (touchSwiped) return
  closeLightbox()
}

function onKeydown(e: KeyboardEvent): void {
  if (!lightboxSrc.value) return

  switch (e.key) {
    case 'Escape':
      closeLightbox()
      break
    case 'ArrowRight':
      navigatePhoto('next')
      break
    case 'ArrowLeft':
      navigatePhoto('prev')
      break
  }
}

// ─────────────────────────────────────────────────
//  LIFECYCLE
// ─────────────────────────────────────────────────

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)

  try {
    await signInAnonymously(auth)
  } catch {
    // Silent
  }

  if (!galleryCode.value) {
    showCodePrompt.value = true
  } else {
    if (!ownerId.value) {
      await tryAutoRecover()
    }
    await loadPhotos()
    await loadStorage()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
/* ── FLIP-Animation für optimistische Photo-Entfernung ── */
/* Die TransitionGroup erzeugt smooth FLIP-animierte Umordnungen */
.photo-grid-move {
  transition: transform 300ms ease-out;
}

/* Sanftes Fade-out für das entfernte Element */
.photo-grid-leave-active {
  transition: opacity 250ms ease-out, transform 250ms ease-out;
  position: absolute;
  width: 100%;
  pointer-events: none;
}

.photo-grid-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

/* Gedämpfte Ansicht während des API-Calls */
.photo-grid-enter-active {
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

.photo-grid-enter-from {
  opacity: 0;
  transform: scale(0.96);
}
</style>
