<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.push('/dashboard')" class="p-2.5 rounded-lg hover:bg-gray-100 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Inspection Workflows</h1>
        </div>
        <router-link
          to="/inspection-workflows/new"
          class="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Workflow
        </router-link>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-12">
      <div v-if="!list.length" class="text-center py-20">
        <div class="bg-gray-100 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No inspection workflows yet</h3>
        <p class="text-gray-500">Create workflows to control inspection notifications</p>
      </div>

      <TransitionGroup name="list" tag="ul" class="space-y-4">
        <li
          v-for="wf in list"
          :key="wf.id"
          class="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition"
        >
          <div class="px-8 py-6 flex items-center justify-between group">
            <div @click="router.push(`/inspection-workflows/${wf.id}`)" class="cursor-pointer flex-1">
              <h3 class="text-lg font-semibold text-gray-900">{{ wf.name }}</h3>
              <p class="text-sm text-gray-600 mt-1">
                {{ activeStatuses(wf) }} status{{ activeStatuses(wf) !== 1 ? 'es' : '' }} with notifications
              </p>
            </div>
            <button @click.stop="remove(wf.id)" class="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2.5 2.5 0 0116.138 21H7.862a2.5 2.5 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </li>
      </TransitionGroup>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useInspectionWorkflowStore } from '@/stores/inspectionWorkflowStore'

const router = useRouter()
const { list, remove } = useInspectionWorkflowStore()

function activeStatuses(wf: any) {
  return Object.values(wf).filter((c: any) => c?.enabled).length
}
</script>