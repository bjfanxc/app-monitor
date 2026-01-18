<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Plus, Search, MoreHorizontal, Activity, CheckCircle2, AlertTriangle, X } from 'lucide-vue-next'
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

  if (!data) {
    stats.value = { total: 0, online: 0, removed: 0 }
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
    apps.value = (data ?? []) as App[]
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
  Online: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  Removed: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  Error: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
}

const skeletonRows = Array.from({ length: 6 }, (_, index) => index)
</script>

<template>
  <div class="p-6 max-w-screen-2xl mx-auto space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-gray-900">监控看板</h1>
        <p class="text-sm text-gray-500">实时查看监控应用状态与最近检测结果</p>
      </div>
      <div class="flex items-center gap-3">
        <Button @click="isAddModalOpen = true">
          <Plus class="w-4 h-4 mr-2" />
          添加应用
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 font-medium">监控中的应用</div>
          <div class="h-9 w-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Activity class="h-5 w-5" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <div class="text-3xl font-bold text-gray-900">{{ stats.total }}</div>
          <div class="text-sm text-gray-500">个</div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 font-medium">在线应用</div>
          <div class="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 class="h-5 w-5" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <div class="text-3xl font-bold text-emerald-700">{{ stats.online }}</div>
          <div class="text-sm text-gray-500">个</div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 font-medium">异常下架</div>
          <div class="h-9 w-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertTriangle class="h-5 w-5" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <div class="text-3xl font-bold text-rose-700">{{ stats.removed }}</div>
          <div class="text-sm text-gray-500">个</div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div class="p-4 sm:p-5 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2">
          <div class="text-sm font-medium text-gray-900">应用列表</div>
          <div class="text-xs text-gray-500">
            共 {{ totalApps }} 条
            <span v-if="searchQuery.trim()">，筛选：{{ searchQuery.trim() }}</span>
          </div>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div class="relative w-full sm:w-80">
            <Search class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              placeholder="搜索应用名称或包名"
              class="pl-9 pr-9"
            />
            <button
              v-if="searchQuery.trim()"
              type="button"
              class="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              @click="searchQuery = ''"
              aria-label="清空搜索"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <Button variant="outline" @click="handleSearch" class="w-full sm:w-auto">
            搜索
          </Button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">应用信息</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">平台 / 地区</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">状态</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">最近检测</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide text-right">操作</th>
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
                  <div class="h-4 w-28 rounded bg-gray-100"></div>
                  <div class="mt-2 h-3 w-16 rounded bg-gray-100"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-5 w-16 rounded-full bg-gray-100"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 w-36 rounded bg-gray-100"></div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="inline-block h-8 w-8 rounded-md bg-gray-100"></div>
                </td>
              </tr>
            </template>
            <tr v-else-if="apps.length === 0">
              <td colspan="5" class="py-14">
                <div class="flex flex-col items-center justify-center gap-3 text-center">
                  <div class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Search class="h-5 w-5" />
                  </div>
                  <div class="space-y-1">
                    <div class="text-sm font-medium text-gray-900">
                      {{ searchQuery.trim() ? '未找到匹配的应用' : '暂无数据' }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ searchQuery.trim() ? '尝试换个关键词，或清空搜索条件。' : '添加一个应用开始监控。' }}
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <Button v-if="searchQuery.trim()" variant="outline" @click="searchQuery = ''">
                      清空搜索
                    </Button>
                    <Button @click="isAddModalOpen = true">
                      <Plus class="w-4 h-4 mr-2" />
                      添加应用
                    </Button>
                  </div>
                </div>
              </td>
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
              <td class="px-6 py-4 text-gray-500">{{ app.last_check ? new Date(app.last_check).toLocaleString() : '-' }}</td>
              <td class="px-6 py-4 text-right">
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
      <div class="space-y-6 flex flex-col h-full">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">应用名称</label>
          <Input v-model="newApp.name" placeholder="请输入应用名称" class="h-12" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">包名 / Bundle ID</label>
          <Input v-model="newApp.package_id" placeholder="例如: com.example.app" class="h-12" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
        <div class="pt-2 flex justify-end gap-3 mt-auto">
          <Button variant="secondary" @click="isAddModalOpen = false" size="lg">取消</Button>
          <Button @click="handleAddApp" size="lg">确认添加</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
