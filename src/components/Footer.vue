<template>
  <footer class="bg-primary py-12 px-5 flex flex-col gap-8 md:flex-row md:justify-between md:items-center text-left">
    <h2 class="text-[clamp(2.5rem,10vw,6rem)] text-secondary font-extrabold leading-none">
      <slot>Danke, schön wars gewesen!</slot>
    </h2>

    <div class="flex flex-col gap-2 md:gap-6 md:flex-row md:items-center">
      <div class="text-secondary text-left md:text-right">
        <RouterLink to="/galerie" class="hover:text-accent transition-colors block"> Galerie
        </RouterLink>
        <RouterLink to="/" class="hover:text-accent transition-colors block"> Startseite
        </RouterLink>
        <RouterLink class="block" to="/impressum">Impressum</RouterLink>
        <RouterLink to="/datenschutz">Datenschutz</RouterLink>
      </div>
    </div>
  </footer>
</template>
