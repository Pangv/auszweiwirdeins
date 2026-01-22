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
        <div v-for="hotel in hotels" :key="hotel.name" class="flex flex-col space-y-4">
          <h3 class="text-xl font-display uppercase text-coral">{{ hotel.name }}</h3>
          <div class="overflow-hidden rounded-3xl h-64 shadow-lg">
            <img :src="hotel.image" :alt="hotel.name"
                 class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/>
          </div>

          <div class="space-y-2">

            <div class="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p class="text-[10px] uppercase font-bold text-coral/60 tracking-widest">Adresse</p>
                <p class="text-sm">{{ hotel.address }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase font-bold text-coral/60 tracking-widest">
                  Zimmerpreis</p>
                <p class="text-sm">{{ hotel.price }}</p>
              </div>
            </div>

            <div class="pt-2">
              <p class="text-[10px] uppercase font-bold text-coral/60 tracking-widest">
                Entfernung</p>
              <p class="text-sm whitespace-pre-line">{{ hotel.distance }}</p>
            </div>

            <div class="pt-4 border-t border-coral/10">
              <p class="text-sm opacity-80 italic leading-relaxed">{{ hotel.description }}</p>
            </div>
            <div>
              <a
                  class="bg-accent rounded-full px-4 py-2 text-center align-bottom text-white uppercase"
                  href="{{hotel.link}}">{{ hotel.linkText }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
