<script setup lang="ts">
</script>

<template>
  <header class="grid md:grid-cols-2 min-h-[50vh] md:min-h-[80vh]">
    <div class="p-8 md:p-12 flex flex-col justify-center overflow-hidden">
      <h1 class="lighter font-extrabold mb-4 leading-none text-[clamp(3rem,12vw,6.5rem)]">Sarah & Olli</h1>

      <div class="flex justify-around items-center">
        <p class="font-extrabold">Es wird bunt</p>
        <p>30.07.2026</p>
      </div>

      <div class="mt-5 w-full">
        <p class="text-3xl text-center mb-5 fancy xs:inline pr-3">Wir sagen ja!</p>
        <RouterLink class="bg-accent mt-5 text-2xl text-secondary py-2 px-4" :to="{ path: '/', hash: '#teilnahme' }">
          Sag ja mit uns!
        </RouterLink>
      </div>
    </div>
    <div
      class="bg-[url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center hidden md:block"></div>
  </header>
</template>
