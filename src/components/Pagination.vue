<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[rgb(var(--surface))] border-t border-base">
    <!-- Page info and size selector -->
    <div class="flex items-center gap-4 text-sm text-[rgb(var(--text-muted))]">
      <span v-if="totalItems > 0">
        Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} items
      </span>
      <span v-else>
        No items to display
      </span>
      
      <!-- Page size selector -->
      <div v-if="showPageSize && totalItems > 0" class="flex items-center gap-2">
        <label for="page-size" class="text-xs">Show:</label>
        <select
          id="page-size"
          :value="pageSize"
          @change="handlePageSizeChange"
          class="px-2 py-1 text-sm bg-[rgb(var(--bg))] border border-base rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
    </div>

    <!-- Pagination controls -->
    <div v-if="totalPages > 1" class="flex items-center gap-1">
      <!-- First page button -->
      <button
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        class="p-2 rounded-md border border-base bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--surface))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="First page"
      >
        <ChevronDoubleLeftIcon class="w-4 h-4" />
      </button>

      <!-- Previous page button -->
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="p-2 rounded-md border border-base bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--surface))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Previous page"
      >
        <ChevronLeftIcon class="w-4 h-4" />
      </button>

      <!-- Page numbers -->
      <div class="flex items-center gap-1">
        <!-- Show first page if not in range -->
        <button
          v-if="showFirstPage"
          @click="goToPage(1)"
          class="px-3 py-2 rounded-md border border-base bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--surface))] transition-colors"
        >
          1
        </button>

        <!-- Show ellipsis if needed -->
        <span v-if="showStartEllipsis" class="px-2 text-[rgb(var(--text-muted))]">...</span>

        <!-- Show page range around current page -->
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          class="px-3 py-2 rounded-md border transition-colors"
          :class="page === currentPage 
            ? 'bg-blue-600 text-white border-blue-600' 
            : 'border-base bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--surface))]'"
        >
          {{ page }}
        </button>

        <!-- Show ellipsis if needed -->
        <span v-if="showEndEllipsis" class="px-2 text-[rgb(var(--text-muted))]">...</span>

        <!-- Show last page if not in range -->
        <button
          v-if="showLastPage"
          @click="goToPage(totalPages)"
          class="px-3 py-2 rounded-md border border-base bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--surface))] transition-colors"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- Next page button -->
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="p-2 rounded-md border border-base bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--surface))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Next page"
      >
        <ChevronRightIcon class="w-4 h-4" />
      </button>

      <!-- Last page button -->
      <button
        @click="goToPage(totalPages)"
        :disabled="currentPage === totalPages"
        class="p-2 rounded-md border border-base bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--surface))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Last page"
      >
        <ChevronDoubleRightIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/vue/24/outline'

interface Props {
  currentPage: number
  totalItems: number
  pageSize: number
  pageSizeOptions?: number[]
  showPageSize?: boolean
  maxVisiblePages?: number
}

interface Emits {
  (e: 'page-change', page: number): void
  (e: 'page-size-change', pageSize: number): void
}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [10, 25, 50, 100],
  showPageSize: true,
  maxVisiblePages: 5
})

const emit = defineEmits<Emits>()

// Computed properties
const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize) || 1)

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  if (props.totalItems === 0) return 0
  return Math.min(props.currentPage * props.pageSize, props.totalItems)
})

// Calculate which page numbers to show
const visiblePages = computed(() => {
  const half = Math.floor(props.maxVisiblePages / 2)
  let start = Math.max(1, props.currentPage - half)
  let end = Math.min(totalPages.value, start + props.maxVisiblePages - 1)
  
  // Adjust start if we're near the end
  if (end - start + 1 < props.maxVisiblePages) {
    start = Math.max(1, end - props.maxVisiblePages + 1)
  }
  
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Determine if we need ellipsis and edge pages
const showFirstPage = computed(() => !visiblePages.value.includes(1))
const showLastPage = computed(() => !visiblePages.value.includes(totalPages.value))
const showStartEllipsis = computed(() => showFirstPage.value && visiblePages.value[0] > 2)
const showEndEllipsis = computed(() => showLastPage.value && visiblePages.value[visiblePages.value.length - 1] < totalPages.value - 1)

// Methods
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page)
  }
}

function handlePageSizeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newSize = parseInt(target.value)
  if (newSize !== props.pageSize) {
    emit('page-size-change', newSize)
  }
}
</script>