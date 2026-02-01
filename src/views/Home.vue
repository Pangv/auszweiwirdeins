<script setup lang="ts">
import { defineAsyncComponent} from 'vue'
import Hero from "../components/Hero.vue";

import 'leaflet/dist/leaflet.css'
const Schedule = defineAsyncComponent(() => import("../components/Schedule.vue"));
const Teilnahme = defineAsyncComponent(() => import("../components/Teilnahme.vue"));
const HotelSuggestions = defineAsyncComponent(() => import("../components/HotelSuggestions.vue"));
const FAQ = defineAsyncComponent(() => import("../components/FAQ.vue"));
const Footer = defineAsyncComponent(() => import("../components/Footer.vue"));
</script>

<template>
  <Hero />
  <Schedule />
  <Teilnahme />
  <HotelSuggestions />
  <FAQ />
  <Footer />
</template>
