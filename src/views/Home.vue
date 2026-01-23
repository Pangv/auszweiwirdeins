<script setup lang="ts">
import {onMounted} from 'vue'

import 'leaflet/dist/leaflet.css'
import initMaps from '../maps'
import Hero from "../components/Hero.vue";
import Schedule from "../components/Schedule.vue";
import Teilnahme from "../components/Teilnahme.vue";
import HotelSuggestions from "../components/HotelSuggestions.vue";
import FAQ from "../components/FAQ.vue";
import Footer from "../components/Footer.vue";

onMounted(() => {
  initMaps()
})
</script>

<template>
  <Hero />
  <Schedule />
  <Teilnahme />
  <HotelSuggestions />
  <FAQ />
  <Footer />
</template>
