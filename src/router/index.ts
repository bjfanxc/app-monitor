import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Alerts from '@/views/Alerts.vue'
import AlertConfig from '@/views/AlertConfig.vue'
import Settings from '@/views/Settings.vue'
import Login from '@/views/Login.vue'
import { supabase } from '@/lib/supabase'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/alerts',
      name: 'alerts',
      component: Alerts,
      meta: { requiresAuth: true }
    },
    {
      path: '/alert-config',
      name: 'alert-config',
      component: AlertConfig,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to) => {
  const { data, error } = await supabase.auth.getSession()
  const session = error ? null : data.session

  if (to.meta.requiresAuth === false) {
    if (to.name === 'login' && session) {
      return { name: 'dashboard' }
    }
    return
  }

  if (!session) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
