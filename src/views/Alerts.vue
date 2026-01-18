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
    alerts.value = data as Alert[]
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
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">告警记录</h1>
      <div class="relative w-72">
        <Search class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input placeholder="搜索应用或包名" class="pl-9" />
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 font-medium text-gray-500">应用信息</th>
              <th class="px-6 py-4 font-medium text-gray-500">商店平台</th>
              <th class="px-6 py-4 font-medium text-gray-500">地区</th>
              <th class="px-6 py-4 font-medium text-gray-500">告警群组</th>
              <th class="px-6 py-4 font-medium text-gray-500">告警时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading" class="text-center text-gray-500">
              <td colspan="5" class="py-8">加载中...</td>
            </tr>
            <tr v-else-if="alerts.length === 0" class="text-center text-gray-500">
              <td colspan="5" class="py-8">暂无数据</td>
            </tr>
            <tr v-for="alert in alerts" :key="alert.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ alert.app_name }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ alert.package_id }}</div>
              </td>
              <td class="px-6 py-4 text-gray-900">{{ alert.platform }}</td>
              <td class="px-6 py-4 text-gray-500">{{ alert.region }}</td>
              <td class="px-6 py-4 text-gray-900">{{ alert.alert_group }}</td>
              <td class="px-6 py-4 text-gray-500">{{ new Date(alert.alert_time).toLocaleString() }}</td>
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
