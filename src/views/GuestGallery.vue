<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <h2 class="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
      Unsere Gäste ({{guests.reduce((prev, curr) => { return prev + curr.count }, 0)}})
    </h2>

    <div class="flex flex-col md:flex-row gap-3 mb-6">
      <input v-model="searchQuery" type="text" placeholder="Gastname suchen..."
        class="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" />
      <button @click="resetSearch"
        class="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
        Zurücksetzen
      </button>
    </div>

    <div v-if="filteredGuests.length === 0" class="text-center py-12 text-gray-500">
      Keine Gäste gefunden.
    </div>

    <!-- Mobile: 3-column square grid -->
    <div v-if="isMobile" class="grid grid-cols-3 gap-1">
      <div v-for="guest in filteredGuests" :key="guest.id"
        class="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer group" @click="openLightbox(guest)">
        <img :src="guest.imageUrl" :alt="guest.name" loading="lazy" decoding="async"
          class="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          @error="handleImageError" />
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p class="bg-white px-1 py-1.5 w-fit text-black text-xs font-medium leading-tight">{{ guest.name }} 👥 {{
            guest.count }}</p>
        </div>
      </div>
    </div>

    <!-- Desktop: MasonryWall -->
    <MasonryWall v-else :items="filteredGuests" :column-width="280" :gap="16" :ssr-columns="3" class="w-full">
      <template #default="{ item: guest }">
        <div
          class="break-inside-avoid mb-4 rounded-xl shadow-md bg-white overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
          @click="openLightbox(guest)">
          <div class="relative">
            <img :src="guest.imageUrl" :alt="guest.name" loading="lazy" decoding="async" class="w-full h-auto block"
              @error="handleImageError" />
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p class="w-fit py-1.5 bg-white text-black px-1 text-sm font-medium">{{ guest.name }} 👥 {{ guest.count }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </MasonryWall>

    <!-- Pagination / count -->
    <div class="text-center mt-6 text-sm text-gray-500">
      {{ filteredGuests.length }} von {{ guests.length }} Gästen angezeigt
    </div>

    <!-- Lightbox -->
    <Lightbox :src="lightboxSrc" :photo="lightboxPhoto" :show-download="false" @close="closeLightbox"
      @touchstart="onTouchStart" @touchend="onTouchEnd" @click="onLightboxClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { MasonryWall } from '@yeger/vue-masonry-wall';
import Lightbox from '@/components/Lightbox.vue';
import { convertHeicToBlobUrl, isHeicFile } from '@/utils/heicConverter';
import type { Photo } from '@/types/gallery';
import img_maurice from '@/assets/images/maurice_kluge.jpeg';
import img_lisa_wagner from '@/assets/images/lisa_wagner.jpeg';
import img_mitte_oma_birgit from '@/assets/images/oma_birgit.jpg';
import img_lisa_kluge from '@/assets/images/lisa_klurge.heic';
import img_tiva_bea from '@/assets/images/bea_tiva.JPG';
import img_mark_doerte from '@/assets/images/mark_doerte_lasse_jannes.JPG';
import img_michaela_melvin from '@/assets/images/michaela_melvin.JPG';
import img_andre from '@/assets/images/andre.PNG';
import img_sophie_fabi from '@/assets/images/sophie_fabi.heic';
import img_oma_doris from '@/assets/images/oma_doris.heic';
import img_max_carmen from '@/assets/images/max_carmen.heic';
import img_silke_pete from '@/assets/images/silke_pete.HEIC';
import img_katharina from '@/assets/images/katharina.png';

interface Guest {
  id: number;
  name: string;
  imageUrl: string;
  count: number;
}

const guests = ref<Guest[]>([
  { id: 17, count: 2, name: 'Max (Trauzeuge) + Carmen', imageUrl: img_max_carmen },
  { id: 3, count: 2, name: 'Bea (Trauzeugin) + Tiva', imageUrl: img_tiva_bea },
  { id: 2, count: 2, name: 'Torsten + Sylvia Gemmer', imageUrl: 'https://placeholdit.com/600x400/dddddd/999999?text=Max+Eltern' },
  { id: 4, count: 1, name: 'Maurice Kluge', imageUrl: img_maurice },
  { id: 5, count: 1, name: 'Lisa Klurge', imageUrl: img_lisa_kluge },
  { id: 6, count: 3, name: 'Lisa, Martin, Julia Wagner', imageUrl: img_lisa_wagner },
  { id: 7, count: 1, name: 'Oma Birgit', imageUrl: img_mitte_oma_birgit },
  { id: 16, count: 1, name: 'Oma Doris (rechts)', imageUrl: img_oma_doris },
  { id: 10, count: 2, name: 'Michaela + Melvin', imageUrl: img_michaela_melvin },
  { id: 11, count: 4, name: 'Mark + Dörte + Jannes + Lasse', imageUrl: img_mark_doerte },
  { id: 12, count: 4, name: 'Andre', imageUrl: img_andre },
  { id: 21, count: 1, name: 'Christel', imageUrl: 'https://placeholdit.com/600x400/dddddd/999999?text=Christel' },
  { id: 14, count: 4, name: 'Sophie + Fabi, Johanna + Alex', imageUrl: img_sophie_fabi },
  { id: 18, count: 2, name: 'Silke + Pete', imageUrl: img_silke_pete },
  { id: 22, count: 2, name: 'Katharina + Alex', imageUrl: img_katharina },
  { id: 19, count: 2, name: 'Sarah + Olli', imageUrl: 'https://placeholdit.com/600x400/dddddd/999999?text=Sarah+Olli' },
  { id: 20, count: 3, name: 'Gisela, Lukas, Felix', imageUrl: 'https://placeholdit.com/600x400/dddddd/999999?text=Gisela+Felix+Lukas' },
]);

const searchQuery = ref<string>('');
const isMobile = ref(false);

const filteredGuests = computed(() => {
  return guests.value.filter(guest =>
    guest.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const resetSearch = () => {
  searchQuery.value = '';
};

// --- Breakpoint detection (matches PhotoGrid) ---
let mql: MediaQueryList | null = null;
const onBreakpointChange = (e: MediaQueryListEvent) => {
  isMobile.value = !e.matches;
};
onMounted(() => {
  mql = window.matchMedia('(min-width: 768px)');
  isMobile.value = !mql.matches;
  mql.addEventListener('change', onBreakpointChange);
  window.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  mql?.removeEventListener('change', onBreakpointChange);
  window.removeEventListener('keydown', onKeydown);
});

// --- Lightbox (adapted from useLightbox) ---
const lightboxSrc = ref<string | null>(null);
const lightboxPhoto = ref<Photo | null>(null);
let touchStartX = 0;
let touchStartY = 0;
let touchSwiped = false;

function openLightbox(guest: Guest) {
  lightboxSrc.value = guest.imageUrl;
  lightboxPhoto.value = null;
  currentLightboxIndex.value = filteredGuests.value.findIndex(g => g.id === guest.id);
}

function closeLightbox() {
  lightboxSrc.value = null;
  lightboxPhoto.value = null;
}

const currentLightboxIndex = ref(-1);

function navigateGuest(dir: 'prev' | 'next') {
  const list = filteredGuests.value;
  if (list.length === 0) return;
  const idx = dir === 'next'
    ? (currentLightboxIndex.value + 1) % list.length
    : (currentLightboxIndex.value - 1 + list.length) % list.length;
  const guest = list[idx];
  if (guest) {
    currentLightboxIndex.value = idx;
    lightboxSrc.value = guest.imageUrl;
    lightboxPhoto.value = null;
  }
}

function onTouchStart(e: TouchEvent) {
  const t = e.touches[0];
  if (!t) return;
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  touchSwiped = false;
}

function onTouchEnd(e: TouchEvent) {
  const t = e.changedTouches[0];
  if (!t) return;
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    touchSwiped = true;
    navigateGuest(dx > 0 ? 'prev' : 'next');
  }
}

function onLightboxClick() {
  if (touchSwiped) return;
  closeLightbox();
}

function onKeydown(e: KeyboardEvent) {
  if (!lightboxSrc.value) return;
  switch (e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowRight':
      navigateGuest('next');
      break;
    case 'ArrowLeft':
      navigateGuest('prev');
      break;
  }
}

// Handle HEIC image errors in the grid
async function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  const src = target.src;
  if (isHeicFile(src)) {
    try {
      const blobUrl = await convertHeicToBlobUrl(src);
      target.src = blobUrl;
    } catch (e) {
      console.warn('HEIC conversion failed:', e);
    }
  }
}
</script>
