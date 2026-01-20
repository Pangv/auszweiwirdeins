<script setup lang="ts">
import {onMounted} from 'vue'

import hotelData from './data/hotels.json'
import 'leaflet/dist/leaflet.css'
import initMaps from './maps'
import Teilnahme from "./Teilnahme.vue";
import HotelSuggestions from "./HotelSuggestions.vue";

const hotels = hotelData.hotels

onMounted(() => {
  initMaps()
})
</script>

<template>

  <header class="grid md:grid-cols-2">
    <div class="p-12 flex flex-col justify-center">
      <h1 class="lighter text-8xl font-extrabold">Sarah & Olli</h1>

      <div class="flex justify-between items-center">
        <p class="font-extrabold">Es wird bunt</p>
        <p>30.07.2026</p>
      </div>

      <div class="mt-5">
        <a role="button" class="bg-accent text-secondary py-2 px-4 rounded-full " href="#">Wir sagen
          ja. Sag ja
          mit uns!</a>
      </div>
    </div>
    <div
      class="bg-[url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center"></div>
  </header>

  <section class="grid md:grid-cols-2 bg-primary p-5 text-secondary">
    <div class="grid lg:grid-cols-2 gap-12 items-start">
      <div class="grid md:grid-cols-2 gap-8">

        <div class="relative border-l-2 border-coral/50 ml-4 pl-8 space-y-12">
          <div class="relative">
            <div
              class="absolute -left-10.25 top-1 w-4 h-4 rounded-full bg-coral shadow-[0_0_10px_#FF6B6B]"></div>
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
            <p class="text-sm opacity-70">Feiern, bis wir rausgeworfen werden! (also wirklich um
              02:00 Uhr =)
              )</p>
          </div>
        </div>


      </div>
    </div>
    <div>
      <h2 class="darker font-extrabold text-8xl mb-12 text-center md:text-left">Was dich
        erwartet</h2>
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
  </section>

  <Teilnahme/>
  <HotelSuggestions/>

  <section class="">
    <h1 class="bg-primary w-full text-7xl font-extrabold py-2 pt-3 px-4  text-secondary">FAQ</h1>
    <div class="grid md:grid-cols-2 gap-12">
      <div>
        <div>
          <h3 class="text-2xl">Dresscode</h3>
          <p>Hauptsache Bunt! Alles ist erlaubt - je farbenfroher, desto besser.</p>
          <p>Sie trägt weiß, er was grünes.</p>
        </div>
        <div>
          <h3 class="text-2xl">Kinder</h3>
          <p>Ja, sehr gerne.</p>
        </div>
        <div>
          <h3 class="text-2xl">Geschenke</h3>
          <p>Hauptsache Bunt! Alles ist erlaubt - je farbenfroher, desto besser.</p>
          <p>Sie trägt weiß, er was grünes.</p>
        </div>
        <div>
          <h3 class="text-2xl">Locations</h3>
          <p>Hauptsache Bunt! Alles ist erlaubt - je farbenfroher, desto besser.</p>
          <p>Sie trägt weiß, er was grünes.</p>
        </div>

        <div>
          <h3 class="text-2xl">Reden & Partyspiele:</h3>
          <p>Hauptsache Bunt! Alles ist erlaubt - je farbenfroher, desto besser.</p>
          <p>Sie trägt weiß, er was grünes.</p>
        </div>
      </div>
      <div>
        <img src="https://images.unsplash.com/photo-1542044801-30d3e45ae49a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="">
      </div>

    </div>
  </section>

  <footer class="bg-accent py-6 px-5 text-center">
    <img src="" alt="">
    <div class="flex justify-between items-center">
      <div>
        <p>Meldet euch gerne Jedezeit wenn noch Fragen offen sind</p>
      </div>
      <div>
        <p>0 152 22 80 47 29</p>
        <a href="mailto:hello@auszweiwirdeins.de">hello@auszweiwirdeins.de</a>
      </div>
    </div>
    <h2 class="text-8xl text-secondary font-extrabold">Wir sehen uns!</h2>
  </footer>

</template>

