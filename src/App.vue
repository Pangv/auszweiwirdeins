<script setup lang="ts">
import hotelData from './data/hotels.json'
const hotels = hotelData.hotels
</script>

<template>

  <header class="grid md:grid-cols-2">
    <div class="p-12 flex flex-col justify-center">
      <h1>Sarah & Olli</h1>
      <p>Es wird bunt - 30.07.2026</p>
      <div class="space-y-4">
        <a href="#">Wir sagen ja. Sag ja mit uns!</a>
      </div>
    </div>
    <div class="bg-[url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center"></div>
  </header>

  <section>
    <h2 class="text-6xl mb-12 text-center md:text-left">Was dich erwartet</h2>

    <div class="grid lg:grid-cols-2 gap-12 items-start">
      <div class="grid md:grid-cols-2 gap-8">

        <div class="relative border-l-2 border-coral/50 ml-4 pl-8 space-y-12">
          <div class="relative">
            <div class="absolute -left-10.25 top-1 w-4 h-4 rounded-full bg-coral shadow-[0_0_10px_#FF6B6B]"></div>
            <p class="text-coral font-bold tracking-widest uppercase text-sm">14:00 Uhr</p>
            <h3 class="text-2xl font-display uppercase">Standesamt</h3>
            <p class="text-sm opacity-70">Trauung im kleinen Kreis (Details folgen)</p>
          </div>

          <div class="relative">
            <div class="absolute -left-10.25 top-1 w-4 h-4 rounded-full bg-coral"></div>
            <p class="text-coral font-bold tracking-widest uppercase text-sm">14:30 Uhr</p>
            <h3 class="text-2xl font-display uppercase">Draußen sammeln</h3>
            <p class="text-sm opacity-70">Glückwünsche & Gruppenfotos vor der Tür</p>
          </div>

          <div class="relative">
            <div class="absolute -left-10.25 top-1 w-4 h-4 rounded-full bg-coral"></div>
            <p class="text-coral font-bold tracking-widest uppercase text-sm">15:00 Uhr</p>
            <h3 class="text-2xl font-display uppercase">Anfahrt zum Yolk</h3>
            <p class="text-sm opacity-70">Individueller Wechsel zur Location am Kanal</p>
          </div>

          <div class="relative">
            <div class="absolute -left-10.25 top-1 w-4 h-4 rounded-full bg-coral"></div>
            <p class="text-coral font-bold tracking-widest uppercase text-sm">02:00 Uhr</p>
            <h3 class="text-2xl font-display uppercase">Open End</h3>
            <p class="text-sm opacity-70">Feiern, bis wir rausgeworfen werden! (also wirklich um 02:00 Uhr =)
              )</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-xs uppercase font-bold text-coral mb-2">📍 Hörsterstraße 28</p>
            <div id="mapStandesamt" class="map h-45!"></div>
          </div>
          <div>
            <p class="text-xs uppercase font-bold text-coral mb-2">📍 Bennostraße 5</p>
            <div id="mapYolk" class="map h-45!"></div>
          </div>
        </div>

      </div>
    </div>
  </section>


  <section>
    <div>
      <h2 class="text-7xl mb-6">Bist du dabei?</h2>
      <p class="mb-6">Bitte melde dich über das Kontaktformular rechts an.</p>
      <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=500" class="rounded-3xl"
           alt="Drinks">
    </div>
    <div class="bg-[#F2EBDC] p-8 rounded-3xl shadow-sm border-2">
      <form id="rsvpForm" class="space-y-4">
        <input type="number" id="guests" placeholder="PERSONENANZAHL"
               class="w-full p-3 border border-coral rounded bg-transparent focus:ring-2 focus:ring-coral outline-none">
        <input type="text" id="name" placeholder="NAME"
               class="w-full p-3 border border-coral rounded bg-transparent focus:ring-2 focus:ring-coral outline-none"
               required>
        <textarea id="message" placeholder="NACHRICHT AN UNS (Z.B. ALLERGIEN, Vegetarisch, Vegan)"
                  class="w-full p-3 border border-coral rounded bg-transparent h-32 focus:ring-2 focus:ring-coral outline-none"></textarea>
        <textarea id="message2" placeholder="Musik No Goes"
                  class="w-full p-3 border border-coral rounded bg-transparent h-32 focus:ring-2 focus:ring-coral outline-none"></textarea>
        <button type="submit"
                class="w-full bg-coral text-white py-4 rounded font-bold uppercase hover:bg-red-500 transition-colors">
          Abschicken
        </button>
      </form>
      <p id="status" class="mt-4 font-bold text-center"></p>
    </div>
  </section>

  <section class="py-20 px-6 md:px-12 bg-white">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-6xl md:text-7xl mb-12 text-center md:text-left font-display">Hotel Empfehlungen</h2>

      <div class="grid md:grid-cols-2 gap-12">
        <div v-for="hotel in hotels" :key="hotel.name" class="flex flex-col space-y-4">
          <div class="overflow-hidden rounded-3xl h-64 shadow-lg">
            <img :src="hotel.image" :alt="hotel.name" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>

          <div class="space-y-2">
            <h3 class="text-3xl font-display uppercase text-coral">{{ hotel.name }}</h3>

            <div class="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p class="text-[10px] uppercase font-bold text-coral/60 tracking-widest">Adresse</p>
                <p class="text-sm">{{ hotel.address }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase font-bold text-coral/60 tracking-widest">Zimmerpreis</p>
                <p class="text-sm">{{ hotel.price }}</p>
              </div>
            </div>

            <div class="pt-2">
              <p class="text-[10px] uppercase font-bold text-coral/60 tracking-widest">Entfernung</p>
              <p class="text-sm whitespace-pre-line">{{ hotel.distance }}</p>
            </div>

            <div class="pt-4 border-t border-coral/10">
              <p class="text-sm opacity-80 italic leading-relaxed">{{ hotel.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="">
    <div>
      <h1>Hotel Empfehlungen</h1>
    </div>
    <div class="flex">

      <div>
        <h3>ATLANTIC Hotel Münster</h3>
        <img src=""/>

        <p>Adresse</p>
        <p>Engelstraße 39, 48143 Münster </p>

        <p>Zimmerpreis</p>
        <p>79 - 330€</p>

        <p>Entfernung</p>
        <p>Standesamt - 1,2 km
          Cafe Yolk - 2 km</p>

        <p>Beschreibung</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. A alias culpa cum delectus, distinctio ea earum eligendi esse eum, fuga illo labore libero minus non, sed sit suscipit tempore vero!</p>

      </div>


    </div>


  </section>

  <section>
    <div>
      <h1>FAQ</h1>
    </div>
    <div>

    </div>
  </section>

  <footer class="bg-coral p-12 text-center">
    <img src="" alt="">
    <div>
      <p>Meldet euch gerne Jedezeit wenn noch Fragen offen sind</p>
      <p>0 152 22 80 47 29</p>
      <a href="mailto:hello@auszweiwirdeins.de">hello@auszweiwirdeins.de</a>
    </div>
    <h2 class="text-white text-6xl md:text-8xl font-display">Wir sehen uns!</h2>
  </footer>

</template>

<style scoped></style>
