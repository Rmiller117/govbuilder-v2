<template>
  <div class="min-h-screen bg-bg text-[rgb(var(--text))]">
    <!-- Header with both buttons at the top -->
    <header class="bg-surface border-b border-base shadow-sm">
      <div class="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.push('/dashboard')" class="p-2.5 rounded-lg hover:bg-[rgb(var(--bg))] transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-3xl font-bold">Inspection Types</h1>
        </div>
        <div class="flex items-center gap-4">
          <button @click="importFile"
            class="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition flex items-center gap-2">
            <DocumentArrowUpIcon class="w-5 h-5" />
            Import
          </button>
          <ThemeToggleButton />
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-12">
      <!-- Inspection Types Section -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold">Inspection Types</h2>
          <div class="flex items-center gap-4">
            <router-link to="/inspection-types/new"
              class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Inspection Type
            </router-link>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!inspectionTypes.length"
          class="text-center py-10 bg-surface rounded-2xl shadow-base border border-base mb-6">
          <div class="bg-surface border border-base w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-8 h-8 text-[rgb(var(--text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19l-2-2m0 0l-2-2m2 2l2-2m5 6l-2-2m0 0l-2-2m2 2l2-2" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-1">No inspection types yet</h3>
          <p class="text-[rgb(var(--text-muted))]">Click "Add Inspection Type" to create one.</p>
        </div>

        <!-- Vertical List of Inspection Types -->
        <TransitionGroup name="list" tag="ul" class="space-y-4">
          <li v-for="type in inspectionTypes" :key="type.id"
            class="bg-surface rounded-2xl shadow-base border border-base overflow-hidden hover:shadow-xl transition">
            <div class="px-8 py-6 flex items-center justify-between group">
              <div @click="router.push(`/inspection-types/${type.id}`)" class="cursor-pointer flex-1">
                <h3 class="text-lg font-semibold">{{ type.title }}</h3>
                <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
                  Duration: {{ formatDuration(type.durationHours) }}
                  <span v-if="type.workflowId" class="ml-4 text-purple-600">
                    • Workflow: {{ workflowName(type.workflowId) || 'Assigned' }}
                  </span>
                </p>
              </div>

              <button @click.stop="removeInspectionType(type.id)"
                class="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2.5 2.5 0 0116.138 21H7.862a2.5 2.5 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </li>
        </TransitionGroup>
      </div>

      <!-- Workflows Section -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold">Inspection Workflows</h2>
          <router-link to="/inspection-workflows/new"
            class="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Workflow
          </router-link>
        </div>

        <!-- Empty State -->
        <div v-if="!workflows.length"
          class="text-center py-10 bg-surface rounded-2xl shadow-base border border-base mb-6">
          <div class="bg-surface border border-base w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-8 h-8 text-[rgb(var(--text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-1">No inspection workflows yet</h3>
          <p class="text-[rgb(var(--text-muted))]">Create workflows to control inspection notifications</p>
        </div>

        <!-- Vertical List of Workflows -->
        <TransitionGroup name="list" tag="ul" class="space-y-4">
          <li v-for="wf in workflows" :key="wf.id"
            class="bg-surface rounded-2xl shadow-base border border-base overflow-hidden hover:shadow-xl transition">
            <div class="px-8 py-6 flex items-center justify-between group">
              <div @click="router.push(`/inspection-workflows/${wf.id}`)" class="cursor-pointer flex-1">
                <h3 class="text-lg font-semibold">{{ wf.name }}</h3>
                <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
                  {{ activeStatuses(wf) }} status{{ activeStatuses(wf) !== 1 ? 'es' : '' }} with notifications
                </p>
              </div>

              <button @click.stop="removeWorkflow(wf.id)"
                class="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2.5 2.5 0 0116.138 21H7.862a2.5 2.5 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </li>
        </TransitionGroup>
      </div>
    </main>
    <input ref="fileInputRef" type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="handleFileUpload" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useInspectionTypeStore } from '@/stores/inspectionTypeStore'
import { useInspectionWorkflowStore } from '@/stores/inspectionWorkflowStore'
import { importInspectionTypesFromFile } from '@/utils/inspectionTypeImportUtils'
import { DocumentArrowUpIcon } from '@heroicons/vue/24/outline'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('success')
const fileInputRef = ref<HTMLInputElement | null>(null)


function showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}
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
  const statusKeys = ['AcceptedInvite', 'Approved', 'CancelledByAdmin', 'CancelledByUser', 'Completed', 'DeclinedInvite', 'Failed', 'InProgress', 'NotRequired', 'Submitted']
  const notifyKeys = ['notifyAssignedTeamMembers', 'notifyOtherTeamMembers', 'notifyApplicant', 'notifyAllContacts', 'notifyOtherRecipient']
  
  return statusKeys.filter(statusKey => {
    const config = wf[statusKey]
    if (!config) return false
    return notifyKeys.some(notifyKey => config[notifyKey] === true)
  }).length
}
function importFile() {
  fileInputRef.value?.click()
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  if (!file) return

  try {
    showToastMessage('Processing import file...', 'info')

    // Read file content based on type
    let content: string | ArrayBuffer | null = null
    if (file.name.toLowerCase().endsWith('.csv')) {
      content = await file.text()
    } else {
      content = await file.arrayBuffer()
    }

    // Import accounting details from file
    const result = await importInspectionTypesFromFile(content, file.name)

    if (result.success) {
      showToastMessage(`Successfully imported ${result.importedCount} accounting details!`, 'success')
    } else {
      showToastMessage(`Import failed: ${result.message}`, 'error')
      if (result.errors && result.errors.length > 0) {
        console.error('Import errors:', result.errors)
      }
    }
  } catch (error) {
    showToastMessage(`Error reading file: ${(error as Error).message}`, 'error')
  } finally {
    // Reset file input
    if (input) {
      input.value = ''
    }
  }
}
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>