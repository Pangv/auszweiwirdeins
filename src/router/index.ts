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
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 0,
      }
    }
    return { top: 0 }
  },
})

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

router.beforeEach(async (to, from, next) => {
  if (to.path === '/gaeste') {
    const isPasswordAuthenticated = !!localStorage.getItem('galerie_password')
    if (isPasswordAuthenticated) {
      next()
    } else {
      next('/galerie?redirect=/gaeste')
    }
    return
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const user = await getCurrentUser()
    if (user && !user.isAnonymous) {
      next()
    } else {
      next('/login')
    }
    return
  }

  next()
})

export default router
