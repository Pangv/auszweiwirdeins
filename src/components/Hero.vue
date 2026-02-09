<script setup lang="ts">
</script>

<template>
  <header
    class="
      grid md:grid-cols-2
      min-h-[50vh] md:min-h-[80vh]
      /* Hintergrund‑Bild auf Mobilgeräten */
      bg-[url('/hero.jpg')] bg-center bg-cover
      /* kein Bild auf ≥md, dort benutzen wir den eigenen Hintergrund */
      md:bg-none
    "
  >
    <!-- Linke Spalte – Text -->
    <div class="p-8 md:p-12 flex flex-col justify-center overflow-hidden">
      <!-- Überschrift -->
      <div class=" p-2 rounded bg-white/70 md:bg-white/0">

        <h1
          class="
          font-extrabold mb-4 leading-none
          text-[clamp(3rem,12vw,6.5rem)]          /* Schriftgröße */

          /* Mobile‑Styles */
          text-primary                              /* schwarzer Text */

          /* Large‑Screen‑Styles (≥md) */
          md:text-transparent md:bg-[url('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop')]
          md:bg-center md:bg-cover md:leading-none md:bg-clip-text
        "
        >
          Sarah & Olli
        </h1>

        <div class="mt-5 w-full text-center md:text-left ">
          <p class="text-3xl mb-5 fancy xs:inline">Wir sagen ja!</p>
          <RouterLink
            class="bg-accent text-2xl text-secondary py-2 px-6 rounded font-bold uppercase hover:bg-red-500 transition-colors inline-block animate-wobble-periodic "
            :to="{ path: '/', hash: '#teilnahme' }">
            Sag ja mit uns!
          </RouterLink>
        </div>
      </div>

    </div>

    <!-- Rechte Spalte – Optionaler Bild‑Hintergrund (nur ≥md) -->
    <div
      class="bg-[url('/hero.jpg')] bg-cover bg-center hidden md:block"
      aria-hidden="true"
    ></div>
  </header>


</template>
