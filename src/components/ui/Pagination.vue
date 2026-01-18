<script setup lang="ts">
import { computed } from 'vue'
import Button from './Button.vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  total: number
  pageSize: number
  currentPage: number
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div class="flex items-center justify-between px-2" v-if="totalPages > 1">
    <div class="text-sm text-gray-500">
      共 {{ total }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
    </div>
    <div class="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="currentPage === 1"
        @click="handlePageChange(currentPage - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <div class="flex items-center space-x-1">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="handlePageChange(page)"
          class="px-3 py-1 text-sm rounded-md transition-colors"
          :class="[
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
          v-show="
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          "
        >
          {{ page }}
        </button>
        <span v-if="currentPage < totalPages - 2" class="text-gray-400">...</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        :disabled="currentPage === totalPages"
        @click="handlePageChange(currentPage + 1)"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
