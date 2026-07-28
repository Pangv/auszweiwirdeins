# AGENTS.md — auszweiwirdeins

## Project

Private wedding website for Sarah & Olli (German). Domain: auszweiwirdeins.de.  
Guest info, RSVP, password-protected photo gallery with upload, admin dashboard.

## Tech Stack

- **Language:** TypeScript 5.9
- **Frontend:** Vue 3 (Composition API, `<script setup lang="ts">`)
- **Build:** Vite 8.1, `pnpm` 10.33, Node >=22.12
- **CSS:** Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- **Auth/DB:** Firebase (Firestore + Auth, anonymous + admin claims)
- **Photo API:** Custom REST API at `galerie.auszweiwirdeins.de` (OpenAPI: `galerie.openapi.yaml`)
- **CMS:** Sveltia/Decap CMS (`public/admin/config.yml`, GitHub backend)
- **Maps:** Leaflet 1.9
- **Lint:** oxlint + ESLint (flat config) + Prettier
- **CI:** GitHub Actions (deploy to Pages on push to main)

## Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Vite dev server (`--host`) |
| `pnpm build` | `type-check` + `build-only` (concurrent) |
| `pnpm build-only` | `vite build` |
| `pnpm type-check` | `vue-tsc --build` |
| `pnpm preview` | `vite preview` |
| `pnpm emu` | Firebase emulators (auth:9099, firestore:8080) |
| `pnpm serve` | Emulators + dev server (concurrent) |
| `pnpm lint` | oxlint --fix, then eslint --fix --cache |
| `pnpm format` | prettier --write src/ |

## Conventions

- **Vue:** `<script setup lang="ts">` everywhere, Composition API, lazy-loaded routes (dynamic `import()`)
- **Path alias:** `@/` → `./src/`
- **Prettier:** no semis, single quotes, printWidth 100
- **Tailwind:** custom theme colors — `primary` (#003d20), `secondary` (#E9E6D1), `accent` (#ff5050)
- **Fonts:** "Big Shoulders Display" (headings), "Manjari" (body) via fonts.bunny.net
- **HEIC:** HEIC images included as assets, converted client-side via `heic2any` before upload
- **Chunking:** manual split — `vendor-firebase`, `vendor-vue`, `vendor`
- **Compression:** gzip + brotli on all build outputs

## Routes

| Path | Component | Auth |
|------|-----------|------|
| `/` | Home.vue | — |
| `/login` | Login.vue | — |
| `/galerie` | GalleryView.vue | — |
| `/gaeste` | GuestGallery.vue | password (localStorage) |
| `/admin` | AdminDashboard.vue | Firebase non-anonymous |
| `/impressum` | Imprint.vue | — |
| `/datenschutz` | Privacy.vue | — |

## Key Directories

```
src/
  components/   — 13 reusable Vue components
  composables/  — 5 composables (useDragDrop, useGalleryAuth, etc.)
  views/        — 7 page-level components
  services/     — galleryApi.ts, galleryFirestore.ts
  data/         — faq.json, hotels.json, schedule.json (CMS-managed)
  types/        — gallery.ts
  utils/        — format.ts, heicConverter.ts
  style/        — main.css (Tailwind + custom theme)
```

## Firebase

- **Project:** `kommrum-895d1`
- **Emulators:** auth:9099, firestore:8080 (auto-connect in dev)
- **Rules:** `firestore.rules` — guests read/write own doc, admins full access
- **Admin claim:** set via `admin-setup.mjs` script