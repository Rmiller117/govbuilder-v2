<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div>
          <button @click="router.back()" class="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 class="text-4xl font-bold text-slate-900">Case Workflows</h1>
          <p class="text-lg text-slate-600 mt-2">Define case types and automated status flows</p>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-12">
      <!-- Top Row – Case Types (left) + Subtypes (right) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        <!-- Case Types -->
        <section class="bg-white rounded-3xl shadow-lg p-8 border border-slate-200">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Case Types</h2>
            <button @click="openNewType()" class="text-blue-600 hover:text-blue-700 font-medium text-sm">
              + New Type
            </button>
          </div>

          <div class="space-y-4">
            <div v-for="type in caseTypes" :key="type.id"
              class="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition cursor-pointer"
              @click="editingType = { ...type }">
              <h3 class="font-bold text-lg text-slate-800">{{ type.title }}</h3>
              <p class="text-sm text-slate-600 mt-1">
                {{ type.prefix || '' }}{{ type.autoNumber ? '####' : '' }}{{ type.suffix || '' }}
              </p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="subId in type.subtypes" :key="subId"
                  class="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {{ subtypes.find(s => s.id === subId)?.name || 'Unknown' }}
                </span>
              </div>
            </div>
            <p v-if="!caseTypes.length" class="text-slate-500 italic text-center py-8">No case types yet</p>
          </div>
        </section>

        <!-- Subtypes -->
        <section class="bg-white rounded-3xl shadow-lg p-8 border border-slate-200">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Case Subtypes</h2>
          </div>

          <div class="flex gap-3 mb-6">
            <input
              v-model="newSubtypeName"
              @keyup.enter="addSubtype"
              placeholder="e.g. Building Permit"
              class="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button @click="addSubtype" :disabled="!newSubtypeName.trim()"
              class="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition">
              Add
            </button>
          </div>

          <div class="max-h-96 overflow-y-auto pr-2">
            <div class="flex flex-wrap gap-3 pb-2">
              <div v-for="sub in subtypes" :key="sub.id"
                class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                <span>{{ sub.name }}</span>
                <button @click="removeSubtype(sub.id)" class="text-emerald-600 hover:text-emerald-800">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <p v-if="!subtypes.length" class="text-slate-500 italic py-8 text-center">No subtypes yet</p>
          </div>
        </section>
      </div>

      <!-- Bottom Row – Workflows (full width) -->
      <section class="bg-white rounded-3xl shadow-lg p-8 border border-slate-200">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-800">Workflows</h2>
          <button @click="addWorkflow()" class="text-purple-600 hover:text-purple-700 font-medium text-sm">
            + New Workflow
          </button>
        </div>

        <div class="space-y-12">
          <div v-for="wf in workflows" :key="wf.id" class="bg-purple-50 rounded-2xl p-8 border border-purple-200">
            <div class="flex items-center justify-between mb-6">
              <input v-model="wf.name" placeholder="Click to edit workflow name" class="text-2xl font-bold bg-transparent outline-none flex-1" />
              <div class="flex gap-3">
                <button v-if="wf.saved" @click="wf.saved = false" class="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                  Edit
                </button>
                <button v-else @click="saveWorkflow(wf)" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  Save Workflow
                </button>
              </div>
            </div>

            <!-- Editing Mode -->
            <div v-if="!wf.saved">
              <!-- Add Status Dropdown -->
              <div class="mb-8">
                <p class="text-sm font-medium text-purple-700 mb-3">Add Status</p>
                <select v-model="wf.pendingStatusId" @change="addStatusToWorkflow(wf)" class="w-full px-4 py-3 border rounded-lg">
                  <option :value="null" disabled>Select a status...</option>
                  <option v-for="status in availableStatusesForWorkflow(wf)" :key="status.id" :value="status.id">
                    {{ status.title }}
                  </option>
                </select>
              </div>

              <!-- Reorderable Steps -->
              <p class="text-sm font-medium text-purple-700 mb-4">Workflow Steps (drag to reorder)</p>
              <draggable
                v-model="wf.steps"
                item-key="id"
                handle=".handle"
                :force-fallback="true"
                fallback-tolerance="5"
                class="min-h-80 bg-white rounded-xl p-6 border-2 border-dashed border-purple-300"
              >
                <template #item="{ element: step, index }">
                  <div class="p-5 bg-white rounded-xl shadow-md border border-purple-200 flex items-center justify-between mb-4 handle cursor-move select-none">
                    <div class="flex items-center gap-5">
                      <svg class="w-6 h-6 text-purple-600 handle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span class="text-lg font-semibold text-purple-900">
                        {{ index + 1 }}. {{ statuses.find(s => s.id === step.statusId)?.title || 'Unknown' }}
                      </span>
                    </div>
                    <button @click="removeStep(wf, step)" class="text-red-600 hover:text-red-800">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </template>

                <div v-if="!wf.steps.length" class="text-center text-purple-400 py-20 italic text-lg">
                  Select statuses from the dropdown above
                </div>
              </draggable>
            </div>

            <!-- Saved Mode – Ribbon Preview -->
            <div v-else class="mt-8">
              <p class="text-sm font-medium text-purple-700 mb-6">Saved Workflow – "{{ wf.name }}"</p>
              <div class="flex items-center gap-4 overflow-x-auto py-4">
                <div v-for="(step, index) in wf.steps" :key="step.id" class="flex items-center">
                  <div class="flex-shrink-0 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full font-bold text-lg shadow-lg">
                    {{ statuses.find(s => s.id === step.statusId)?.title || 'Unknown' }}
                  </div>
                  <svg v-if="index < wf.steps.length - 1" class="w-10 h-10 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Case Type Modal -->
    <teleport to="body">
      <div v-if="editingType" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-screen overflow-y-auto">
          <h3 class="text-2xl font-bold mb-6">
            {{ editingType.id && caseTypes.some(t => t.id === editingType.id) ? 'Edit' : 'New' }} Case Type
          </h3>
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input v-model="editingType.title" class="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Number Prefix</label>
                <input v-model="editingType.prefix" placeholder="CASE-" class="w-full px-4 py-3 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Number Suffix</label>
                <input v-model="editingType.suffix" placeholder="-2025" class="w-full px-4 py-3 border rounded-lg" />
              </div>
            </div>
            <div class="flex items-center gap-8">
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" v-model="editingType.autoNumber" class="w-5 h-5 text-blue-600 rounded" />
                <span>Use Auto-Number</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" v-model="editingType.autoLicense" class="w-5 h-5 text-blue-600 rounded" />
                <span>Auto-create License on Approval</span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Allowed Subtypes</label>
              <select multiple v-model="editingType.subtypes" class="w-full px-4 py-3 border rounded-lg h-48">
                <option v-for="sub in subtypes" :key="sub.id" :value="sub.id">
                  {{ sub.name }}
                </option>
              </select>
              <p class="text-xs text-slate-500 mt-2">Hold Ctrl/Cmd to select multiple</p>
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-8">
            <button @click="editingType = null" class="px-6 py-3 border rounded-xl">Cancel</button>
            <button @click="saveCaseType" class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
              Save Case Type
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="savedTag"
        class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60]"
      >
        <div class="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-medium text-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Saved <code class="font-mono bg-slate-700 px-2 py-1 rounded">{{ savedTag }}</code>!
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Draggable from 'vuedraggable'
import { useStatusStore } from '@/stores/statusStore'

const router = useRouter()
const statusStore = useStatusStore()
const statuses = computed(() => statusStore.list.value || [])

interface CaseType {
  id: string
  title: string
  prefix: string
  suffix: string
  autoNumber: boolean
  autoLicense: boolean
  subtypes: string[]
}

interface Subtype { id: string; name: string }
interface WorkflowStep { id: string; statusId: string }
interface Workflow { 
  id: string
  name: string
  steps: WorkflowStep[]
  pendingStatusId: string | null
  saved: boolean
}

const caseTypes = ref<CaseType[]>([])
const subtypes = ref<Subtype[]>([])
const workflows = ref<Workflow[]>([])

const newSubtypeName = ref('')
const editingType = ref<CaseType | null>(null)

function openNewType() {
  editingType.value = {
    id: crypto.randomUUID(),
    title: '',
    prefix: '',
    suffix: '',
    autoNumber: true,
    autoLicense: false,
    subtypes: []
  }
}

function addSubtype() {
  if (!newSubtypeName.value.trim()) return
  subtypes.value.push({
    id: crypto.randomUUID(),
    name: newSubtypeName.value.trim()
  })
  newSubtypeName.value = ''
}

function removeSubtype(id: string) {
  subtypes.value = subtypes.value.filter(s => s.id !== id)
}

function addWorkflow() {
  workflows.value.push({
    id: crypto.randomUUID(),
    name: 'New Workflow',
    steps: [],
    pendingStatusId: null,
    saved: false
  })
}

function addStatusToWorkflow(wf: Workflow) {
  if (!wf.pendingStatusId) return
  if (wf.steps.some(s => s.statusId === wf.pendingStatusId)) return

  wf.steps.push({
    id: crypto.randomUUID(),
    statusId: wf.pendingStatusId
  })
  wf.pendingStatusId = null
}

function removeStep(wf: Workflow, step: WorkflowStep) {
  wf.steps = wf.steps.filter(s => s.id !== step.id)
}

function saveWorkflow(wf: Workflow) {
  if (wf.steps.length === 0) {
    alert('Add at least one status before saving')
    return
  }
  wf.saved = true
  handleSaved('Workflow')
  console.log('Saved workflow:', wf)
}

function availableStatusesForWorkflow(wf: Workflow) {
  return statuses.value.filter(s => !wf.steps.some(step => step.statusId === s.id))
}

function saveCaseType() {
  if (!editingType.value) return
  const existing = caseTypes.value.findIndex(t => t.id === editingType.value!.id)
  if (existing >= 0) {
    caseTypes.value[existing] = { ...editingType.value }
  } else {
    caseTypes.value.push({ ...editingType.value })
  }
  editingType.value = null
  handleSaved('Case Type')
}

const savedTag = ref<string>('')

function handleSaved(tag: string) {
  savedTag.value = tag
  setTimeout(() => {
    savedTag.value = ''
  }, 1500)
}
</script>

<style scoped>
.handle {
  cursor: grab;
}
.handle:active {
  cursor: grabbing;
}
</style>