<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Switch from '@/components/ui/Switch.vue'

const settings = ref({
  adminEmail: 'admin@example.com',
  telegramBotToken: '',
  telegramChatId: '',
  immediateNotification: true,
  dailyReport: false
})

const saveSettings = () => {
  // Save settings logic
  alert('设置已保存')
}
</script>

<template>
  <div class="p-6 max-w-screen-2xl mx-auto space-y-6">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold text-gray-900">系统设置</h1>
      <p class="text-sm text-gray-500">配置通知策略与告警行为</p>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-gray-200">
        <h2 class="text-sm font-medium text-gray-900">通知设置</h2>
        <p class="text-xs text-gray-500 mt-1">用于接收系统通知与告警推送的基础配置</p>
      </div>

      <div class="p-5 space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div class="space-y-1">
            <div class="text-sm font-medium text-gray-900">接收邮箱</div>
            <div class="text-xs text-gray-500">所有系统通知将发送到此邮箱</div>
          </div>
          <div class="lg:col-span-2 space-y-2">
            <label class="text-sm font-medium text-gray-700">接收邮箱 (管理者)</label>
            <Input v-model="settings.adminEmail" placeholder="请输入邮箱地址" class="h-11" />
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center rounded-lg border border-gray-200 p-4">
          <div class="space-y-1">
            <div class="text-sm font-medium text-gray-900">下架立即通知</div>
            <div class="text-xs text-gray-500">当监控的应用下架时立即发送通知</div>
          </div>
          <div class="lg:col-span-2 flex justify-end">
            <Switch v-model="settings.immediateNotification" />
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center rounded-lg border border-gray-200 p-4">
          <div class="space-y-1">
            <div class="text-sm font-medium text-gray-900">发送日报</div>
            <div class="text-xs text-gray-500">每天发送一次监控日报汇总</div>
          </div>
          <div class="lg:col-span-2 flex justify-end">
            <Switch v-model="settings.dailyReport" />
          </div>
        </div>
      </div>

      <div class="p-5 border-t border-gray-200 flex justify-end">
        <Button @click="saveSettings">保存设置</Button>
      </div>
    </div>
  </div>
</template>
