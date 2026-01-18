<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from 'lucide-vue-next'
import Input from '@/components/ui/Input.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { supabase } from '@/lib/supabase'

interface Alert {
  id: string
  app_name: string
  package_id: string
  platform: string
  region: string
  alert_group: string
  alert_time: string
}

const alerts = ref<Alert[]>([])
const loading = ref(false)
const totalAlerts = ref(0)
const currentPage = ref(1)
const pageSize = 10

const skeletonRows = Array.from({ length: 6 }, (_, index) => index)

const fetchAlerts = async () => {
  loading.value = true
  const from = (currentPage.value - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await supabase
    .from('alerts')
    .select('*', { count: 'exact' })
    .order('alert_time', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching alerts:', error)
  } else {
    alerts.value = (data ?? []) as Alert[]
    totalAlerts.value = count || 0
  }
  loading.value = false
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchAlerts()
}

onMounted(() => {
  fetchAlerts()
})
</script>

<template>
  <div class="p-6 max-w-screen-2xl mx-auto space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-gray-900">告警记录</h1>
        <p class="text-sm text-gray-500">查看最近告警与触发时间，支持分页浏览</p>
      </div>
      <div class="relative w-full sm:w-80">
        <Search class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input placeholder="搜索应用或包名" class="pl-9" />
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
      <div class="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="text-sm font-medium text-gray-900">告警列表</div>
          <div class="text-xs text-gray-500">共 {{ totalAlerts }} 条</div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">应用信息</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">商店平台</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">地区</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">告警群组</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">告警时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template v-if="loading">
              <tr v-for="row in skeletonRows" :key="row" class="animate-pulse">
                <td class="px-6 py-4">
                  <div class="h-4 w-44 rounded bg-gray-100"></div>
                  <div class="mt-2 h-3 w-56 rounded bg-gray-100"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 w-24 rounded bg-gray-100"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 w-16 rounded bg-gray-100"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 w-32 rounded bg-gray-100"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 w-36 rounded bg-gray-100"></div>
                </td>
              </tr>
            </template>
            <tr v-else-if="alerts.length === 0">
              <td colspan="5" class="py-14">
                <div class="flex flex-col items-center justify-center gap-3 text-center">
                  <div class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Search class="h-5 w-5" />
                  </div>
                  <div class="space-y-1">
                    <div class="text-sm font-medium text-gray-900">暂无告警记录</div>
                    <div class="text-xs text-gray-500">当监控到下架或异常时，这里会记录告警信息。</div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-for="alert in alerts" :key="alert.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ alert.app_name }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ alert.package_id }}</div>
              </td>
              <td class="px-6 py-4 text-gray-900">{{ alert.platform }}</td>
              <td class="px-6 py-4 text-gray-500">{{ alert.region }}</td>
              <td class="px-6 py-4 text-gray-900">{{ alert.alert_group }}</td>
              <td class="px-6 py-4 text-gray-500">{{ alert.alert_time ? new Date(alert.alert_time).toLocaleString() : '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="py-4 border-t border-gray-200">
        <Pagination
          :total="totalAlerts"
          :pageSize="pageSize"
          v-model:currentPage="currentPage"
          @update:currentPage="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>
