<script setup lang="ts">
</script>

<template>
  <section class="grid md:grid-cols-2 bg-primary p-5 md:p-10 text-secondary">
    <div class="md:order-2">
      <h2 class="darker font-extrabold text-[clamp(2.5rem,10vw,6rem)] mb-12 text-left leading-none">Was dich
        erwartet</h2>
      <div class="space-y-4 mb-12 md:mb-0">
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
    <div class="items-start md:order-1 flex">
        <div class="relative border-l-2 border-coral/50 ml-4 pl-8 space-y-12 flex flex-col justify-around h-full">
          <div class="relative">
            <div
              class="absolute -left-10.25 top-1 w-4 h-4 rounded-full bg-accent shadow-[0_0_10px_#FF6B6B]"></div>
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
  </section>
</template>
