<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  class?: string
}>()
</script>

<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50',
      {
        'bg-blue-600 text-white hover:bg-blue-700 shadow-sm': variant === 'primary' || !variant,
        'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
        'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700': variant === 'outline',
        'hover:bg-gray-100 text-gray-700': variant === 'ghost',
        'bg-red-600 text-white hover:bg-red-700 shadow-sm': variant === 'danger',
        'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm': variant === 'success',
        'h-8 px-3 text-xs': size === 'sm',
        'h-10 px-4 py-2': size === 'md' || !size,
        'h-12 px-8': size === 'lg',
      },
      $props.class
    )"
  >
    <slot />
  </button>
</template>
