<!-- src/components/DashboardButton.vue -->
<template>
  <div class="fixed bottom-8 right-8 z-50">
    <button
      @click="router.push('/dashboard')"
      class="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:shadow-blue-500/50 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
      title="Back to Dashboard"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <span class="font-semibold text-lg">Dashboard</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>