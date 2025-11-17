<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="router.push('/Dashboard')"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Go back"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Statuses</h1>
        </div>

        <button
          @click="router.push('/statuses/new')"
          class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Status
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-6 py-10">
      <!-- Status List Container -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div v-if="!displayedStatuses.length" class="text-center py-20 px-8">
          <div class="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No statuses yet</h3>
          <p class="text-gray-500">Create your first status to get started.</p>
        </div>

        <ul v-else class="divide-y divide-gray-200">
          <li
            v-for="s in displayedStatuses"
            :key="s.id"
            class="group hover:bg-gray-50 transition-colors"
          >
            <div
              class="px-8 py-6 flex items-center justify-between cursor-pointer"
              @click="router.push(`/statuses/${s.id}`)"
            >
              <h3 class="text-lg font-medium text-gray-900">
                {{ s.title?.trim() || "(Untitled status)" }}
              </h3>

              <div class="flex items-center gap-4">
                <!-- Optional: show color dot if you have status colors later -->
                <!-- <div :style="{ backgroundColor: s.color || '#94a3b8' }" class="w-4 h-4 rounded-full"></div> -->

                <button
                  @click.stop="remove(s.id)"
                  class="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete status"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2.5 2.5 0 0116.138 21H7.862a2.5 2.5 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </main>
    <DashboardButton />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStatusStore } from '@/stores/statusStore'
import DashboardButton from '@/components/DashboardButton.vue'

const router = useRouter()
const { list, remove } = useStatusStore()

// Safely filter + clean display
const displayedStatuses = computed(() => {
  const arr = Array.isArray(list.value) ? list.value : []
  return arr.filter((s: any) => s && s.id)  // hides totally broken entries
})
</script>