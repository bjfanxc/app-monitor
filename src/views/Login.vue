<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Lock, Mail } from 'lucide-vue-next'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const handleLogin = async () => {
  errorMessage.value = null

  const trimmedEmail = email.value.trim()
  if (!trimmedEmail || !password.value) {
    errorMessage.value = '请输入邮箱和密码'
    return
  }

  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: password.value,
    })
    if (error) {
      errorMessage.value = error.message
      return
    }

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await router.replace(redirect)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <!-- <div class="text-sm text-gray-500">欢迎使用</div> -->
        <div class="mt-1 text-2xl font-bold text-gray-900">登录</div>
        <div class="mt-1 text-sm text-gray-500">使用邮箱密码登录以访问看板</div>
      </div>

      <form class="p-6 space-y-5" @submit.prevent="handleLogin">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">邮箱</label>
          <div class="relative">
            <Mail class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input v-model="email" type="email" placeholder="name@example.com" class="pl-9 h-11" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">密码</label>
          <div class="relative">
            <Lock class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input v-model="password" type="password" placeholder="请输入密码" class="pl-9 h-11" />
          </div>
        </div>

        <div v-if="errorMessage" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ errorMessage }}
        </div>

        <Button type="submit" class="w-full" size="lg" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </Button>
      </form>
    </div>

    <!-- <div class="mt-4 text-center text-xs text-gray-500">
      登录后可访问监控看板、告警记录与系统设置
    </div> -->
  </div>
</template>

