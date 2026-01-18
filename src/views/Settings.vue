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
  <div class="p-6 max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">系统设置</h1>
    
    <div class="space-y-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div class="space-y-4">
        <h2 class="text-lg font-medium text-gray-900">通知设置</h2>
        
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">接收邮箱 (管理者)</label>
          <Input v-model="settings.adminEmail" placeholder="请输入邮箱地址" />
          <p class="text-xs text-gray-500">所有系统通知将发送到此邮箱。</p>
        </div>

        <div class="flex items-center justify-between py-2">
          <div>
            <div class="text-sm font-medium text-gray-700">下架立即通知</div>
            <div class="text-xs text-gray-500">当监控的应用下架时立即发送邮件通知。</div>
          </div>
          <Switch v-model="settings.immediateNotification" />
        </div>

        <div class="flex items-center justify-between py-2">
          <div>
            <div class="text-sm font-medium text-gray-700">发送日报</div>
            <div class="text-xs text-gray-500">每天发送一次监控日报汇总。</div>
          </div>
          <Switch v-model="settings.dailyReport" />
        </div>
      </div>

      <div class="pt-4 flex justify-end">
        <Button @click="saveSettings">保存设置</Button>
      </div>
    </div>
  </div>
</template>
