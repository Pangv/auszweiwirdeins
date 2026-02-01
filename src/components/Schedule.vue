<script setup lang="ts">
import scheduleData from '../data/schedule.json';
import {onMounted} from "vue";

onMounted(async () => {
  const initMaps = (await import('../maps')).default
  initMaps()
})
</script>

<template>
  <section class="grid md:grid-cols-2 bg-primary p-5 md:p-10 text-secondary">
    <div class="md:order-2">
      <h2 class="text-secondary heading-huge mb-12 text-left max-w-[12ch] ">Was dich
        erwartet</h2>
      <div class="space-y-4 mb-12 md:mb-0">
        <div>
          <p class="text-xs uppercase font-bold text-accent mb-2">📍 Hörsterstraße 28</p>
          <div id="mapStandesamt" class="map h-50!"></div>
        </div>
        <div>
          <p class="text-xs uppercase font-bold text-accent mb-2">📍 Bennostraße 5</p>
          <div id="mapYolk" class="map h-50!"></div>
        </div>
      </div>
    </div>
    <div class="items-start md:order-1 flex">
        <div class="relative border-l-2 border-accent/50 ml-4 pl-8 space-y-12 flex flex-col justify-around h-full">
            <div v-for="item in scheduleData.schedule" :key="item.time">
              <div class="relative">
                <div
                  class="absolute -left-10.25 top-1 w-4 h-4 rounded-full bg-accent shadow-[0_0_10px_#FF6B6B]"></div>
                <p class="text-accent font-bold tracking-widest uppercase text-sm">
                  {{ item.time }} Uhr</p>
                <h3 class="text-2xl font-display uppercase">{{item.title}}</h3>
                <p class="text-sm opacity-70">{{item.description}}</p>
              </div>
          </div>
        </div>
    </div>
  </section>
</template>
