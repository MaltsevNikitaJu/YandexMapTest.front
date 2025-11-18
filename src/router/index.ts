import { createRouter, createWebHistory } from 'vue-router'
import { UserApi } from '@/api/user.api'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Reviews from '../views/Reviews.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      component: Home,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/reviews',
        },
        {
          path: 'reviews',
          name: 'Reviews',
          component: Reviews,
          meta: { requiresAuth: true },
        },
        {
          path: 'settings',
          name: 'Settings',
          component: Settings,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/home',
      redirect: '/reviews',
    },
  ],
})

// Проверка авторизации перед каждым переходом
router.beforeEach(async (to, from, next) => {
  const userApi = UserApi.getInstance()
  let isAuthenticated = false

  try {
    isAuthenticated = Boolean(await userApi.auth())
  } catch (error) {
    console.error('Не удалось проверить авторизацию', error)
    isAuthenticated = false
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Если требуется авторизация, но пользователь не авторизован
    next('/login');
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // Если пользователь уже авторизован, но пытается зайти на страницу логина
    next('/home');
  } else {
    next();
  }
})

export default router
