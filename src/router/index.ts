import { createRouter, createWebHashHistory } from 'vue-router'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/impressum',
      name: 'imprint',
      component: () => import('../views/Imprint.vue')
    },
    {
      path: '/datenschutz',
      name: 'privacy',
      component: () => import('../views/Privacy.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // if (savedPosition) return savedPosition;

    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
        top: 0, // optionaler Offset (s.u.)
      };
    }

    return {top: 0};
  }
})

// Navigation Guard
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener()
        resolve(user)
      },
      reject
    )
  })
}

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const user: any = await getCurrentUser()
    if (user && !user.isAnonymous) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router
