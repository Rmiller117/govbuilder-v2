<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-10">
      <h1 class="text-4xl font-bold">Statuses</h1>
      <button
        @click="router.push('/statuses/new')"
        class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-lg"
      >
        + Add Status
      </button>
      [/div>

      <div
        v-if="!displayedStatuses.length"
        class="text-center py-20 text-gray-500"
      >
        <p class="text-2xl">No statuses yet — create your first one!</p>
      </div>

      <div class="space-y-6">
        <div
          v-for="s in displayedStatuses"
          :key="s.id"
          class="group bg-white rounded-2xl shadow-md p-8 flex justify-between items-center hover:shadow-xl transition-shadow cursor-pointer"
          @click="router.push(`/statuses/${s.id}`)"
        >
          <h3 class="text-2xl font-semibold">
            {{
              s.title?.trim() ? s.title : "(no title – click to edit or delete)"
            }}
          </h3>
          <button
            @click.stop="remove(s.id)"
            class="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStatusStore } from '@/stores/statusStore'

const router = useRouter()
const { list, remove } = useStatusStore()

// Safely filter + clean display
const displayedStatuses = computed(() => {
  const arr = Array.isArray(list.value) ? list.value : []
  return arr.filter((s: any) => s && s.id)  // hides totally broken entries
})
</script>