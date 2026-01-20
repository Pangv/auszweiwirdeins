<script setup lang="ts">
import { ref, watch } from 'vue'

const guestCount = ref(1)
const names = ref<string[]>([''])

// Reagiert auf Änderungen der Gästeanzahl und passt das Namens-Array an
watch(guestCount, (newCount) => {
  const currentNames = [...names.value]
  if (newCount > currentNames.length) {
    // Füge leere Felder hinzu
    for (let i = currentNames.length; i < newCount; i++) {
      currentNames.push('')
    }
  } else {
    // Kürze das Array, falls die Zahl verringert wird
    currentNames.splice(newCount)
  }
  names.value = currentNames
})
</script>

<template>
  <section class="grid md:grid-cols-2 gap-12 py-20 px-6 md:px-12 ">
    <div>
      <h2 class="text-7xl mb-6">Bist du dabei?</h2>
      <p class="mb-6">Bitte melde dich über das Kontaktformular rechts an.</p>
      <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=500"
           class="rounded-3xl"
           alt="Drinks">
    </div>
    <div class="bg-[#F2EBDC] p-8 rounded-3xl shadow-sm border-2">
      <form id="rsvpForm" class="space-y-4">
        <div>
          <label for="guests" class="block text-sm font-bold mb-1">PERSONENANZAHL</label>
          <input type="number" id="guests" v-model.number="guestCount" min="1"
                 class="w-full p-3 border border-coral rounded bg-transparent focus:ring-2 focus:ring-coral outline-none">
        </div>

        <div v-for="(_, index) in guestCount" :key="index">
          <label :for="'name-' + index" class="block text-sm font-bold mb-1">
            NAME {{ guestCount > 1 ? (index + 1) : '' }}
          </label>
          <input type="text" :id="'name-' + index" v-model="names[index]" :placeholder="'NAME'"
                 class="w-full p-3 border border-coral rounded bg-transparent focus:ring-2 focus:ring-coral outline-none"
                 required>
        </div>

        <div>
          <label for="message" class="block text-sm font-bold mb-1">NACHRICHT AN UNS (Z.B. ALLERGIEN, Vegetarisch, Vegan)</label>
          <textarea id="message" placeholder="Deine Nachricht..."
                    class="w-full p-3 border border-coral rounded bg-transparent h-32 focus:ring-2 focus:ring-coral outline-none"></textarea>
        </div>

        <div>
          <label for="message2" class="block text-sm font-bold mb-1">MUSIK NO GOES</label>
          <textarea id="message2" placeholder="Was sollen wir gar nicht spielen?"
                    class="w-full p-3 border border-coral rounded bg-transparent h-32 focus:ring-2 focus:ring-coral outline-none"></textarea>
        </div>

        <button type="submit"
                class="w-full bg-coral text-white py-4 rounded font-bold uppercase hover:bg-red-500 transition-colors">
          Abschicken
        </button>
      </form>
      <p id="status" class="mt-4 font-bold text-center"></p>
    </div>
  </section>
</template>
