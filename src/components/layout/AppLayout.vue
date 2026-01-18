<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { LayoutDashboard, Bell, Settings, Rocket } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const route = useRoute()

const menuItems = [
  { name: '监控看板', path: '/dashboard', icon: LayoutDashboard },
  { name: '告警记录', path: '/alerts', icon: Bell },
  { name: '系统设置', path: '/settings', icon: Settings },
]
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 flex flex-col shadow-lg">
      <div class="h-16 flex items-center px-6 border-b border-slate-800">
        <Rocket class="w-6 h-6 text-blue-500 mr-3" />
        <h1 class="text-xl font-bold text-white">上架宝</h1>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="cn(
            'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
            route.path === item.path
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          )"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </RouterLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>
