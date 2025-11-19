<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header with both buttons at the top -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.push('/dashboard')" class="p-2.5 rounded-lg hover:bg-gray-100 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Inspection Types</h1>
        </div>

        <!-- Both buttons side-by-side at the top -->
        <div class="flex items-center gap-4">
          <router-link
            to="/inspection-types/new"
            class="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Inspection Type
          </router-link>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-12">
      <!-- Inspection Types Section -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Inspection Types</h2>
        </div>

        <!-- Empty State -->
        <div v-if="!inspectionTypes.length" class="text-center py-10 bg-white rounded-2xl shadow-md border border-gray-200 mb-6">
          <div class="bg-gray-100 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19l-2-2m0 0l-2-2m2 2l2-2m5 6l-2-2m0 0l-2-2m2 2l2-2" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-1">No inspection types yet</h3>
          <p class="text-gray-500">Click “Add Inspection Type” to create one.</p>
        </div>

        <!-- Vertical List of Inspection Types -->
        <TransitionGroup name="list" tag="ul" class="space-y-4">
          <li
            v-for="type in inspectionTypes"
            :key="type.id"
            class="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition"
          >
            <div class="px-8 py-6 flex items-center justify-between group">
              <div @click="router.push(`/inspection-types/${type.id}`)" class="cursor-pointer flex-1">
                <h3 class="text-lg font-semibold text-gray-900">{{ type.title }}</h3>
                <p class="text-sm text-gray-600 mt-1">
                  Duration: {{ formatDuration(type.durationHours) }}
                  <span v-if="type.workflowId" class="ml-4 text-purple-600">
                    • Workflow: {{ workflowName(type.workflowId) || 'Assigned' }}
                  </span>
                </p>
              </div>

              <button
                @click.stop="removeInspectionType(type.id)"
                class="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2.5 2.5 0 0116.138 21H7.862a2.5 2.5 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </li>
        </TransitionGroup>
      </div>

      <!-- Workflows Section -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Inspection Workflows</h2>
          <router-link
            to="/inspection-workflows/new"
            class="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Workflow
          </router-link>
        </div>

        <!-- Empty State -->
        <div v-if="!workflows.length" class="text-center py-10 bg-white rounded-2xl shadow-md border border-gray-200 mb-6">
          <div class="bg-gray-100 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-1">No inspection workflows yet</h3>
          <p class="text-gray-500">Create workflows to control inspection notifications</p>
        </div>

        <!-- Vertical List of Workflows -->
        <TransitionGroup name="list" tag="ul" class="space-y-4">
          <li
            v-for="wf in workflows"
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

              <button
                @click.stop="removeWorkflow(wf.id)"
                class="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2.5 2.5 0 0116.138 21H7.862a2.5 2.5 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </li>
        </TransitionGroup>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useInspectionTypeStore } from '@/stores/inspectionTypeStore'
import { useInspectionWorkflowStore } from '@/stores/inspectionWorkflowStore'

const router = useRouter()
const { list: inspectionTypes, remove: removeInspectionType } = useInspectionTypeStore()
const { list: workflows, remove: removeWorkflow } = useInspectionWorkflowStore()

const workflowMap = computed(() => Object.fromEntries(workflows.value.map(w => [w.id, w.name])))

function workflowName(id?: string) {
  return id ? workflowMap.value[id] : undefined
}

function formatDuration(hours: number): string {
  if (!hours) return 'Not set'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return h ? `${h}h ${m ? m + 'm' : ''}`.trim() : `${m}m`
}

function activeStatuses(wf: any) {
  return Object.values(wf).filter((c: any) => c?.enabled).length
}
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active { transition: all 0.4s ease; }
.list-enter-from,
.list-leave-to { opacity: 0; transform: translateY(30px); }
</style>