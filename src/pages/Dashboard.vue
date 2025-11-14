<script setup lang="ts">
import { useProjectStore } from '@/stores/projectStore'
import { onMounted } from 'vue'

const {
  currentProjectName, 
  currentConfig         
} = useProjectStore()

onMounted(() => {
  useProjectStore().scanProjects()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Project title -->
      <h1 class="text-5xl font-bold text-gray-800 mb-2">
        {{ currentProjectName || 'No project selected' }}
      </h1>
      <p class="text-xl text-gray-600 mb-12">Click a section to edit</p>

      <!-- Section cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <router-link to="/statuses"
          class="group flex flex-col items-center justify-center bg-white rounded-3xl shadow-lg p-16 hover:shadow-2xl hover:-translate-y-3 transition-all">
          <div class="text-9xl mb-6 group-hover:scale-110 transition">📊</div>
          <h2 class="text-4xl font-bold text-gray-800">Statuses</h2>
          <p class="mt-4 text-lg text-gray-600 text-center">Edit status list, colors, icons, order…</p>
        </router-link>

        <!-- Future sections (replace when you add the real pages) -->
        <div class="flex flex-col items-center justify-center bg-gray-100 rounded-3xl p-16 opacity-60">
          <div class="text-9xl mb-6">🔜</div>
          <h2 class="text-4xl font-bold text-gray-600">Priorities</h2>
        </div>

        <div class="flex flex-col items-center justify-center bg-gray-100 rounded-3xl p-16 opacity-60">
          <div class="text-9xl mb-6">🔜</div>
          <h2 class="text-4xl font-bold text-gray-600">Categories</h2>
        </div>
      </div>

      <!-- Live config.json preview (always visible) -->
      <div class="mt-20">
        <h2 class="text-3xl font-bold mb-6">Live config.json preview</h2>
        <pre class="bg-gray-900 text-green-400 p-8 rounded-2xl overflow-x-auto text-sm">
{{ JSON.stringify(currentConfig, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>