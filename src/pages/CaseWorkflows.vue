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
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
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

        <!-- Workflows + Subtypes -->
        <div class="space-y-10">
          <!-- Subtypes -->
          <section class="bg-white rounded-3xl shadow-lg p-8 border border-slate-200">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-slate-800">Case Subtypes</h2>
            </div>

            <!-- Add new subtype -->
            <div class="flex gap-3 mb-6">
              <input
                v-model="newSubtypeName"
                @keyup.enter="addSubtype"
                placeholder="e.g. Building Permit"
                class="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button @click="addSubtype" :disabled="!newSubtypeName.trim()"
                class="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition">
                Add Subtype
              </button>
            </div>

            <!-- List of subtypes -->
            <div class="space-y-3">
              <div v-for="sub in subtypes" :key="sub.id"
                class="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span class="font-medium">{{ sub.name }}</span>
                <button @click="removeSubtype(sub.id)" class="text-red-600 hover:text-red-800">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          <!-- Workflows -->
          <section class="bg-white rounded-3xl shadow-lg p-8 border border-slate-200">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-slate-800">Workflows</h2>
              <button @click="addWorkflow()" class="text-purple-600 hover:text-purple-700 font-medium text-sm">
                + New Workflow
              </button>
            </div>

            <div class="space-y-8">
              <div v-for="wf in workflows" :key="wf.id" class="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <input v-model="wf.name" placeholder="Workflow Name" class="text-xl font-bold bg-transparent outline-none w-full mb-6" />

                <!-- Status Palette -->
<div class="mb-6">
  <p class="text-sm font-medium text-purple-700 mb-4">Available Statuses (drag to workflow)</p>
  
  <div v-if="statuses.length === 0" class="text-center py-8 text-purple-400 italic">
    No statuses found. Create some in Statuses first.
  </div>
  
  <draggable
    v-else
    :list="statuses"
    :group="{ name: 'statuses', pull: 'clone', put: false }"
    :sort="false"
    item-key="id"
    class="grid grid-cols-2 gap-4"
    :clone="cloneStatus"
  >
    <template #item="{ element: status }">
      <div class="p-4 bg-white rounded-lg border border-purple-200 cursor-grab active:cursor-grabbing hover:shadow-md transition select-none">
        <span class="font-medium">{{ status.title }}</span>
      </div>
    </template>
  </draggable>
</div>

                <!-- Workflow Drop Zone -->
                <div
                  @dragover.prevent
                  @drop.prevent="drop($event, wf)"
                  class="min-h-64 bg-white rounded-xl p-6 border-2 border-dashed border-purple-300"
                >
                  <p v-if="!wf.steps.length" class="text-center text-purple-400 py-12 italic">
                    Drop statuses here to build workflow
                  </p>
<draggable
  v-model="wf.steps"
  group="statuses"
  item-key="id"
  class="min-h-64 bg-white rounded-xl p-6 border-2 border-dashed border-purple-300"
  @add="onDrop($event, wf)"
>
  <template #item="{ element: step }">
    <div class="p-4 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg border border-purple-300 flex items-center justify-between mb-3">
      <span class="font-semibold">
        {{ statuses.find(s => s.id === step.statusId)?.title || 'Unknown' }}
      </span>
      <button @click="removeStep(wf, step)" class="text-red-600 hover:text-red-800">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </template>
  
  <div v-if="!wf.steps.length" class="text-center text-purple-400 py-12 italic">
    Drop statuses here to build workflow
  </div>
</draggable>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

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

              <!-- Multi-select for Subtypes -->
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
    </main>

    <DashboardButton />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Draggable from 'vuedraggable'
import DashboardButton from '@/components/DashboardButton.vue'
import { useStatusStore } from '@/stores/statusStore'

const router = useRouter()
const statusStore = useStatusStore()

// Load statuses from your real store
const statuses = computed(() => statusStore.list.value)

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
interface Workflow { id: string; name: string; steps: WorkflowStep[] }

const caseTypes = ref<CaseType[]>([])
const subtypes = ref<Subtype[]>([])
const workflows = ref<Workflow[]>([])

const newSubtypeName = ref('')
const editingType = ref<CaseType | null>(null)
let draggedStatusId: string | null = null

onMounted(() => {
  // Load from project store later
  console.log('Loaded statuses:', statuses.value.length)
})

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
    steps: []
  })
}


function drop(e: DragEvent, wf: Workflow) {
  const statusId = e.dataTransfer?.getData('statusId')
  if (statusId && !wf.steps.some(s => s.statusId === statusId)) {
    wf.steps.push({
      id: crypto.randomUUID(),
      statusId
    })
  }
}

function removeStep(wf: Workflow, step: WorkflowStep) {
  wf.steps = wf.steps.filter(s => s.id !== step.id)
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
}
function cloneStatus(status: any) {
  return {
    id: crypto.randomUUID(),
    statusId: status.id
  }
}

function onDrop(_evt: any, workflow: Workflow) {
  // vuedraggable handles it, but we can log if needed
  console.log('Dropped into workflow:', workflow.name)
}
</script>