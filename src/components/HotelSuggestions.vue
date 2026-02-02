<script setup lang="ts">
import hotelData from '../data/hotels.json'
const hotels = hotelData.hotels

</script>

<template>
  <section class="py-10 px-2 md:px-12 md:py-20 text-left">
    <div class="mx-auto">
      <h2
          class="fancy text-[clamp(2rem,10vw,6rem)] font-extrabold rounded-3xl p-2 mb-12 w-fit font-display text-left">
        Hotel Empfehlungen
      </h2>

      <div class="grid md:grid-cols-3 gap-12">
        <div v-for="hotel in hotels" :key="hotel.name" class="flex flex-col space-y-4 group">
          <h3 class="text-xl font-display uppercase text-accent">{{ hotel.name }}</h3>

          <div class="overflow-hidden rounded-3xl h-64 shadow-lg bg-linear-to-br from-accent/30 to-accent/50 border border-accent/5 flex items-center justify-center relative transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl">

            <div class="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none overflow-hidden">
        <span class="text-5xl text-center font-bold uppercase -rotate-12 tracking-tighter">
          {{ hotel.name }}
        </span>
            </div>
            <div class="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>

          <div class="space-y-2">
            <div class="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p class="uppercase font-bold text-accent/60 tracking-widest">Adresse</p>
                <p>{{ hotel.address }}</p>
              </div>
              <div>
                <p class="uppercase font-bold text-accent/60 tracking-widest">Zimmerpreis</p>
                <p>{{ hotel.price }}</p>
              </div>
            </div>

            <div class="pt-2">
              <p class="uppercase font-bold text-accent/60 tracking-widest">Entfernung</p>
              <p class="whitespace-pre-line">{{ hotel.distance }}</p>
            </div>

            <div class="pt-4 border-t border-accent/10">
              <p class="opacity-80 italic leading-relaxed">{{ hotel.description }}</p>
            </div>

            <div class="pt-2">
              <a :href="hotel.link"
                 class="inline-block w-full bg-accent rounded-full px-4 py-2 text-center text-white uppercase tracking-widest hover:bg-accent/90 transition-colors">
                {{ hotel.linkText }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
