<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { LayoutDashboard, Bell, Settings, Rocket, SlidersHorizontal } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const route = useRoute()
const router = useRouter()

const isLoginRoute = computed(() => route.name === 'login')

const user = ref<User | null>(null)
const signingOut = ref(false)

let authSubscription: { unsubscribe: () => void } | null = null

const refreshUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  user.value = error ? null : data.user
}

const handleSignOut = async () => {
  signingOut.value = true
  try {
    await supabase.auth.signOut()
    await router.replace({ name: 'login' })
  } finally {
    signingOut.value = false
  }
}

onMounted(async () => {
  await refreshUser()
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    void event
    user.value = session?.user ?? null
  })
  authSubscription = data.subscription
})

onUnmounted(() => {
  authSubscription?.unsubscribe()
  authSubscription = null
})

const menuItems = [
  { name: '监控看板', path: '/dashboard', icon: LayoutDashboard },
  { name: '告警记录', path: '/alerts', icon: Bell },
  { name: '告警配置', path: '/alert-config', icon: SlidersHorizontal },
  { name: '系统设置', path: '/settings', icon: Settings },
]
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div v-if="isLoginRoute" class="min-h-screen flex items-center justify-center p-6">
      <RouterView />
    </div>

    <div v-else class="flex h-screen">
      <!-- Sidebar -->
      <aside class="w-64 bg-slate-950 text-slate-200 flex flex-col shadow-lg">
        <div class="relative h-16 flex items-center px-5 border-b border-slate-800/80">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-slate-950 to-slate-950 pointer-events-none" />
          <div class="relative flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-blue-600/15 ring-1 ring-inset ring-blue-500/30 flex items-center justify-center">
              <Rocket class="w-5 h-5 text-blue-400" />
            </div>
            <div class="leading-tight">
              <div class="text-base font-semibold text-white">上架宝</div>
              <div class="text-[11px] text-slate-400">App Monitor</div>
            </div>
          </div>
        </div>
        <nav class="flex-1 px-3 py-4 space-y-1">
          <RouterLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="cn(
              'group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors',
              route.path === item.path
                ? 'bg-blue-600/15 text-white ring-1 ring-inset ring-blue-500/30'
                : 'text-slate-300 hover:bg-slate-900/70 hover:text-white'
            )"
          >
            <span
              :class="cn(
                'absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-blue-500 transition-opacity',
                route.path === item.path ? 'opacity-100' : 'opacity-0'
              )"
            />
            <span
              :class="cn(
                'h-9 w-9 rounded-lg flex items-center justify-center transition-colors',
                route.path === item.path
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-300 group-hover:bg-slate-800 group-hover:text-white'
              )"
            >
              <component :is="item.icon" class="w-5 h-5" />
            </span>
            <span class="flex-1 truncate">{{ item.name }}</span>
          </RouterLink>
        </nav>

        <div class="px-3 pb-4">
          <div class="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
            <div class="text-xs text-slate-400">当前账号</div>
            <div class="mt-1 text-sm text-slate-100 truncate">{{ user?.email ?? '-' }}</div>
            <button
              type="button"
              class="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 ring-1 ring-inset ring-slate-800 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
              :disabled="signingOut"
              @click="handleSignOut"
            >
              {{ signingOut ? '退出中...' : '退出登录' }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
