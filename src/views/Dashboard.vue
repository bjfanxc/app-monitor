<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Plus, Search, MoreHorizontal } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { supabase } from '@/lib/supabase'

interface App {
  id: string
  name: string
  package_id: string
  platform: string
  region: string
  status: 'Online' | 'Removed' | 'Error'
  last_check: string
}

const apps = ref<App[]>([])
const loading = ref(false)
const totalApps = ref(0)
const currentPage = ref(1)
const pageSize = 10
const searchQuery = ref('')

// Stats
const stats = ref({
  total: 0,
  online: 0,
  removed: 0
})

const fetchStats = async () => {
  const { data, error } = await supabase.from('apps').select('status')
  if (error) {
    console.error('Error fetching stats:', error)
    return
  }
  
  stats.value = {
    total: data.length,
    online: data.filter(a => a.status === 'Online').length,
    removed: data.filter(a => a.status === 'Removed').length
  }
}

const fetchApps = async () => {
  loading.value = true
  const from = (currentPage.value - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('apps')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (searchQuery.value.trim()) {
    const term = searchQuery.value.trim()
    query = query.or(`name.ilike.%${term}%,package_id.ilike.%${term}%`)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching apps:', error)
  } else {
    apps.value = data as App[]
    totalApps.value = count || 0
  }
  loading.value = false
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchApps()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchApps()
}

// Optional: Debounce search or watch for clear
watch(searchQuery, (newValue) => {
  if (newValue === '') {
    handleSearch()
  }
})

onMounted(() => {
  fetchApps()
  fetchStats()
})

const isAddModalOpen = ref(false)
const newApp = ref({
  name: '',
  package_id: '',
  platform: 'Google Play',
  region: 'US'
})

const handleAddApp = async () => {
  if (!newApp.value.name || !newApp.value.package_id) return

  const { error } = await supabase.from('apps').insert([{
    name: newApp.value.name,
    package_id: newApp.value.package_id,
    platform: newApp.value.platform,
    region: newApp.value.region,
    status: 'Online' // Default status
  }])

  if (error) {
    console.error('Error adding app:', error)
    alert('添加失败: ' + error.message)
  } else {
    isAddModalOpen.value = false
    newApp.value = { name: '', package_id: '', platform: 'Google Play', region: 'US' }
    fetchApps()
    fetchStats()
  }
}

const statusColors = {
  Online: 'bg-green-100 text-green-800',
  Removed: 'bg-red-100 text-red-800',
  Error: 'bg-yellow-100 text-yellow-800',
}
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-sm text-gray-500 font-medium">监控中的应用数量</div>
        <div class="text-3xl font-bold mt-2">{{ stats.total }}</div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-sm text-gray-500 font-medium">在线应用数量</div>
        <div class="text-3xl font-bold mt-2 text-green-600">{{ stats.online }}</div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-sm text-gray-500 font-medium">异常下架数量</div>
        <div class="text-3xl font-bold mt-2 text-red-600">{{ stats.removed }}</div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center">
      <div class="relative w-72">
        <Search class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input 
          v-model="searchQuery" 
          @keyup.enter="handleSearch"
          placeholder="搜索应用名称或包名" 
          class="pl-9" 
        />
      </div>
      <Button @click="isAddModalOpen = true">
        <Plus class="w-4 h-4 mr-2" />
        添加应用
      </Button>
    </div>

    <!-- App List -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 font-medium text-gray-500">应用信息</th>
              <th class="px-6 py-4 font-medium text-gray-500">平台/地区</th>
              <th class="px-6 py-4 font-medium text-gray-500">状态</th>
              <th class="px-6 py-4 font-medium text-gray-500">最近检测时间</th>
              <th class="px-6 py-4 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading" class="text-center text-gray-500">
              <td colspan="5" class="py-8">加载中...</td>
            </tr>
            <tr v-else-if="apps.length === 0" class="text-center text-gray-500">
              <td colspan="5" class="py-8">暂无数据</td>
            </tr>
            <tr v-for="app in apps" :key="app.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ app.name }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ app.package_id }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-gray-900">{{ app.platform }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ app.region }}</div>
              </td>
              <td class="px-6 py-4">
                <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium', statusColors[app.status]]">
                  {{ app.status === 'Online' ? '在线' : app.status === 'Removed' ? '已下架' : '异常' }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-500">{{ new Date(app.last_check).toLocaleString() }}</td>
              <td class="px-6 py-4">
                <Button variant="ghost" size="sm" class="text-gray-500">
                  <MoreHorizontal class="w-4 h-4" />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="py-4 border-t border-gray-200">
        <Pagination
          :total="totalApps"
          :pageSize="pageSize"
          v-model:currentPage="currentPage"
          @update:currentPage="handlePageChange"
        />
      </div>
    </div>

    <!-- Add App Modal -->
    <Modal :isOpen="isAddModalOpen" title="添加应用" @close="isAddModalOpen = false">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 relative flex flex-col h-full">
        <div class="space-y-6 flex-1 flex flex-col">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">应用名称</label>
            <Input v-model="newApp.name" placeholder="请输入应用名称" class="h-12" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">包名 / Bundle ID</label>
            <Input v-model="newApp.package_id" placeholder="例如: com.example.app" class="h-12" />
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">商店平台</label>
              <select v-model="newApp.platform" class="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                <option value="Google Play">Google Play</option>
                <option value="App Store">App Store</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">地区</label>
              <select v-model="newApp.region" class="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                <option value="US">美国 (US)</option>
                <option value="JP">日本 (JP)</option>
                <option value="KR">韩国 (KR)</option>
                <option value="TW">台湾 (TW)</option>
                <option value="Global">全球 (Global)</option>
              </select>
            </div>
          </div>
          <div class="pt-8 flex justify-end space-x-3 mt-auto">
            <Button variant="secondary" @click="isAddModalOpen = false" size="lg">取消</Button>
            <Button @click="handleAddApp" size="lg">确认添加</Button>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
