<script setup lang="ts">
import { X } from 'lucide-vue-next'
import Button from './Button.vue'

defineProps<{
  isOpen: boolean
  title: string
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="w-full max-w-2xl min-h-[500px] bg-white rounded-lg shadow-xl p-8 relative flex flex-col">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        <Button variant="ghost" size="sm" @click="emit('close')" class="h-8 w-8 p-0 rounded-full">
          <X class="w-4 h-4" />
        </Button>
      </div>
      <slot />
    </div>
  </div>
</template>
