<template>
  <footer class="bg-accent py-12 px-5 flex flex-col gap-8 md:flex-row md:justify-between md:items-center text-left">
    <h2 class="text-[clamp(2.5rem,10vw,6rem)] text-secondary font-extrabold leading-none">
      <slot>Wir sehen uns</slot>
      <a href="#/admin" aria-label="Admin Dashboard"
        class="inline-block align-baseline text-secondary no-underline hover:opacity-0 focus:opacity-0 active:opacity-0 select-none pointer-events-auto">!</a>
    </h2>

    <div class="flex flex-col gap-2 md:gap-6 md:flex-row md:items-center">
      <div class="text-left md:text-right">
        <div>
          <a href="mailto:hello@auszweiwirdeins.de" class="break-all">hello@auszweiwirdeins.de</a>
        </div>
        <RouterLink to="/galerie" class="hover:text-accent transition-colors block">
          Galerie
        </RouterLink>
        <RouterLink to="/" class="hover:text-accent transition-colors block">
          Startseite
        </RouterLink>
        <div>
          <RouterLink to="/impressum">Impressum</RouterLink>
        </div>
        <div>
          <RouterLink to="/datenschutz">Datenschutz</RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>
