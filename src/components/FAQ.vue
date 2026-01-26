<script setup lang="ts">
import faqData from "../data/faq.json";
</script>

<template>
  <section class="section-padding text-left bg-primary text-secondary">
    <div class="max-w-7xl mx-auto">
      <h2 class="heading-huge mb-12 text-left text-secondary">FAQ</h2>

      <div class="grid md:grid-cols-2 gap-16 items-center">
        <div class="space-y-8">
          <div v-for="(item, index) in faqData.faq" :key="index">
            <h3 class="text-2xl font-display uppercase text-accent mb-2">{{ item.question }}</h3>
            <p>{{ item.answer }}</p>
            <p v-if="item.subtext" class="opacity-80 italic">{{ item.subtext }}</p>
          </div>
        </div>

        <div class="hidden md:block card-decoration-container">
          <div class="card-decoration-bg -rotate-2"></div>
          <img src="https://images.unsplash.com/photo-1542044801-30d3e45ae49a?q=80&w=1200&auto=format&fit=crop"
               class="card-image rotate-5 shadow-2xl relative z-10 h-125 hover:scale-101"
               alt="FAQ Dekoration"
               loading="lazy">
        </div>
      </div>
    </div>
  </section>
</template>
