<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Plus, Settings2, Trash2, Pencil } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import Switch from '@/components/ui/Switch.vue'
import { supabase } from '@/lib/supabase'

interface TelegramAlertConfig {
  id: string
  user_id: string
  name: string
  bot_token: string
  chat_id: string
  enabled: boolean
  created_at: string
  updated_at: string
}

const configs = ref<TelegramAlertConfig[]>([])
const loading = ref(false)
const saving = ref(false)
const pageErrorMessage = ref<string | null>(null)
const modalErrorMessage = ref<string | null>(null)

const isModalOpen = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
  name: '',
  botToken: '',
  chatId: '',
  enabled: true,
})

const isFormValid = computed(() => {
  const name = form.value.name.trim()
  const botToken = form.value.botToken.trim()
  const chatId = form.value.chatId.trim()
  return name.length > 0 && botToken.length > 0 && chatId.length > 0
})

const skeletonRows = Array.from({ length: 6 }, (_, index) => index)

const maskToken = (token: string) => {
  const trimmed = token.trim()
  if (trimmed.length <= 8) return '******'
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`
}

const resetForm = () => {
  form.value = { name: '', botToken: '', chatId: '', enabled: true }
  editingId.value = null
  modalErrorMessage.value = null
}

const closeModal = () => {
  isModalOpen.value = false
  modalErrorMessage.value = null
}

const openCreate = () => {
  resetForm()
  isModalOpen.value = true
}

const openEdit = (cfg: TelegramAlertConfig) => {
  modalErrorMessage.value = null
  editingId.value = cfg.id
  form.value = {
    name: cfg.name,
    botToken: cfg.bot_token,
    chatId: cfg.chat_id,
    enabled: cfg.enabled,
  }
  isModalOpen.value = true
}

const fetchConfigs = async () => {
  loading.value = true
  pageErrorMessage.value = null
  try {
    const { data, error } = await supabase
      .from('telegram_alert_configs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      pageErrorMessage.value = error.message
      configs.value = []
      return
    }

    configs.value = (data ?? []) as TelegramAlertConfig[]
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  const name = form.value.name.trim()
  const botToken = form.value.botToken.trim()
  const chatId = form.value.chatId.trim()

  if (!name || !botToken || !chatId) {
    modalErrorMessage.value = '请完整填写名称、Bot Token 和 Chat ID'
    return
  }

  saving.value = true
  modalErrorMessage.value = null
  try {
    if (editingId.value) {
      const { error } = await supabase
        .from('telegram_alert_configs')
        .update({
          name,
          bot_token: botToken,
          chat_id: chatId,
          enabled: form.value.enabled,
        })
        .eq('id', editingId.value)

      if (error) {
        modalErrorMessage.value = error.message
        return
      }
    } else {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        modalErrorMessage.value = '未登录或登录已失效'
        return
      }

      const { error } = await supabase.from('telegram_alert_configs').insert([
        {
          user_id: userData.user.id,
          name,
          bot_token: botToken,
          chat_id: chatId,
          enabled: form.value.enabled,
        },
      ])

      if (error) {
        modalErrorMessage.value = error.message
        return
      }
    }

    closeModal()
    resetForm()
    await fetchConfigs()
  } finally {
    saving.value = false
  }
}

const toggleEnabled = async (cfg: TelegramAlertConfig, enabled: boolean) => {
  const original = cfg.enabled
  cfg.enabled = enabled
  const { error } = await supabase
    .from('telegram_alert_configs')
    .update({ enabled })
    .eq('id', cfg.id)

  if (error) {
    cfg.enabled = original
  }
}

const deleteConfig = async (cfg: TelegramAlertConfig) => {
  const ok = window.confirm(`确认删除告警配置「${cfg.name}」？`)
  if (!ok) return

  const { error } = await supabase.from('telegram_alert_configs').delete().eq('id', cfg.id)
  if (error) {
    pageErrorMessage.value = error.message
    return
  }
  await fetchConfigs()
}

onMounted(() => {
  fetchConfigs()
})
</script>

<template>
  <div class="p-6 max-w-screen-2xl mx-auto space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-gray-900">告警配置</h1>
        <p class="text-sm text-gray-500">管理 Telegram 告警机器人配置，支持增删改查</p>
      </div>
      <Button @click="openCreate">
        <Plus class="w-4 h-4 mr-2" />
        新增配置
      </Button>
    </div>

    <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-800">
      <details class="group">
        <summary class="cursor-pointer select-none font-medium text-blue-900">
          Telegram 配置指南：如何创建 Bot 并获取 Chat ID
        </summary>
        <div class="mt-3 space-y-3 text-blue-800">
          <div class="space-y-1">
            <div class="font-medium">1) 创建机器人（Bot Token）</div>
            <div class="text-blue-800/90">
              在 Telegram 搜索并打开
              <a class="underline underline-offset-2" href="https://t.me/BotFather" target="_blank" rel="noreferrer">BotFather</a>
              ，发送 <span class="font-mono">/newbot</span>，按提示设置名称与用户名，创建完成后会返回一段 <span class="font-mono">Bot Token</span>。
            </div>
          </div>

          <div class="space-y-1">
            <div class="font-medium">2) 获取 Chat ID（群组/频道/私聊）</div>
            <div class="text-blue-800/90">
              将机器人加入目标群组（或与机器人私聊），发送任意一条消息后，用浏览器打开下面接口查看最新更新，从返回结果里找到 <span class="font-mono">chat.id</span>：
            </div>
            <pre class="overflow-x-auto rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs text-slate-800"><code>https://api.telegram.org/bot&lt;BOT_TOKEN&gt;/getUpdates</code></pre>
            <div class="text-blue-800/90">
              群组的 Chat ID 往往为负数；超级群组通常以 <span class="font-mono">-100</span> 开头。
            </div>
          </div>

          <div class="space-y-1">
            <div class="font-medium">3) 发送一条测试消息（可选）</div>
            <pre class="overflow-x-auto rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs text-slate-800"><code>https://api.telegram.org/bot&lt;BOT_TOKEN&gt;/sendMessage?chat_id=&lt;CHAT_ID&gt;&amp;text=Hello</code></pre>
          </div>

          <div class="text-blue-800/90">
            注意：Bot Token 属于敏感信息，请妥善保管，避免泄露到公开渠道。
          </div>
        </div>
      </details>
    </div>

    <div v-if="pageErrorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ pageErrorMessage }}
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="text-sm font-medium text-gray-900">Telegram 配置列表</div>
          <div class="text-xs text-gray-500">共 {{ configs.length }} 条</div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">名称</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">Bot Token</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">Chat ID</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">启用</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">更新时间</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template v-if="loading">
              <tr v-for="row in skeletonRows" :key="row" class="animate-pulse">
                <td class="px-6 py-4">
                  <div class="h-4 w-40 rounded bg-gray-100"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 w-28 rounded bg-gray-100"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 w-24 rounded bg-gray-100"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-6 w-11 rounded-full bg-gray-100"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 w-36 rounded bg-gray-100"></div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="inline-block h-8 w-20 rounded-md bg-gray-100"></div>
                </td>
              </tr>
            </template>

            <tr v-else-if="configs.length === 0">
              <td colspan="6" class="py-14">
                <div class="flex flex-col items-center justify-center gap-3 text-center">
                  <div class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Settings2 class="h-5 w-5" />
                  </div>
                  <div class="space-y-1">
                    <div class="text-sm font-medium text-gray-900">暂无配置</div>
                    <div class="text-xs text-gray-500">新增一个 Telegram 机器人配置，用于后续告警推送。</div>
                  </div>
                  <Button @click="openCreate">
                    <Plus class="w-4 h-4 mr-2" />
                    新增配置
                  </Button>
                </div>
              </td>
            </tr>

            <tr v-for="cfg in configs" :key="cfg.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ cfg.name }}</div>
              </td>
              <td class="px-6 py-4 text-gray-700">{{ maskToken(cfg.bot_token) }}</td>
              <td class="px-6 py-4 text-gray-700">{{ cfg.chat_id }}</td>
              <td class="px-6 py-4">
                <Switch :modelValue="cfg.enabled" @update:modelValue="(v: boolean) => toggleEnabled(cfg, v)" />
              </td>
              <td class="px-6 py-4 text-gray-500">{{ cfg.updated_at ? new Date(cfg.updated_at).toLocaleString() : '-' }}</td>
              <td class="px-6 py-4">
                <div class="flex justify-end gap-2">
                  <Button variant="outline" size="sm" @click="openEdit(cfg)">
                    <Pencil class="h-4 w-4 mr-1" />
                    编辑
                  </Button>
                  <Button variant="danger" size="sm" @click="deleteConfig(cfg)">
                    <Trash2 class="h-4 w-4 mr-1" />
                    删除
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal
      :isOpen="isModalOpen"
      :title="editingId ? '编辑 Telegram 配置' : '新增 Telegram 配置'"
      @close="closeModal"
    >
      <div class="space-y-6 flex flex-col h-full">
        <div class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          配置 Telegram 机器人用于告警推送：名称用于选择群组显示；Bot Token 来自 BotFather；Chat ID 为群组/频道/用户的对话 ID；关闭“启用配置”后将不会用于发送告警。
        </div>
        <div v-if="modalErrorMessage" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ modalErrorMessage }}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="space-y-2 sm:col-span-2">
            <label class="text-sm font-medium text-gray-700">名称 <span class="text-rose-600">*</span></label>
            <Input v-model="form.name" placeholder="例如：生产环境告警" class="h-12" required aria-required="true" />
          </div>

          <div class="space-y-2 sm:col-span-2">
            <label class="text-sm font-medium text-gray-700">Bot Token</label>
            <Input v-model="form.botToken" placeholder="123456:ABC-DEF..." class="h-12" />
          </div>

          <div class="space-y-2 sm:col-span-2">
            <label class="text-sm font-medium text-gray-700">Chat ID</label>
            <Input v-model="form.chatId" placeholder="例如：-1001234567890" class="h-12" />
          </div>

          <div class="flex items-center justify-between rounded-lg border border-gray-200 p-4 sm:col-span-2">
            <div>
              <div class="text-sm font-medium text-gray-900">启用配置</div>
              <div class="text-xs text-gray-500">关闭后不会用于推送告警</div>
            </div>
            <Switch v-model="form.enabled" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <Button variant="secondary" size="lg" @click="closeModal">取消</Button>
          <Button size="lg" @click="saveConfig" :disabled="saving || !isFormValid">
            {{ saving ? '保存中...' : '保存' }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
