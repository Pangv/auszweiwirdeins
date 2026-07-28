import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/galerie',
      name: 'gallery',
      component: () => import('../views/GalleryView.vue'),
    },
    {
      path: '/gaeste',
      name: 'Gäste',
      component: () => import('../views/GuestGallery.vue'),
      meta: { requiresAuth: true, authType: 'password' },
    },
    {
      path: '/password-check',
      name: 'PasswordCheck',
      component: () => import('../components/PasswordForm.vue'),
      meta: { isAuthRoute: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/impressum',
      name: 'imprint',
      component: () => import('../views/Imprint.vue'),
    },
    {
      path: '/datenschutz',
      name: 'privacy',
      component: () => import('../views/Privacy.vue'),
    },
  ],
  scrollBehavior(to) {
    // if (savedPosition) return savedPosition;

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 0, // optionaler Offset (s.u.)
      }
    }

    return { top: 0 }
  },
})

// Navigation Guard
const getCurrentUser = async (): Promise<import('firebase/auth').User | null> => {
  const { auth } = await import('../firebase')
  const { onAuthStateChanged } = await import('firebase/auth')
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener()
        resolve(user)
      },
      reject,
    )
  })
}

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  // 1. Prüfen, ob Route eine reine Auth-Route ist (PasswordCheck)
  if (to.matched.some((record) => record.meta.isAuthRoute)) {
    next() // Diese Route soll immer zugänglich sein
    return
  }

  // 2. Prüfen, ob Route benutzerdefinierte Auth benötigt
  if (
    to.matched.some((record) => record.meta.requiresAuth && record.meta.authType === 'password')
  ) {
    const isPasswordAuthenticated = await checkCustomAuth()
    if (isPasswordAuthenticated) {
      next()
    } else {
      next('/password-check')
    }
    return
  }

  // 3. Standard Firebase Auth Check
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const user = await getCurrentUser()
    if (user && !user.isAnonymous) {
      next()
    } else {
      next('/login')
    }
    return
  }

  // 4. Alle anderen Routen
  next()
})

// Benutzerdefinierte Passwortprüfung
const checkCustomAuth = async () => {
  return !!localStorage.getItem('galerie_password')
}

export default router
