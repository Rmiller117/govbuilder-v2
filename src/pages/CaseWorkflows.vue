<template>
  <div class="min-h-screen bg-bg text-[rgb(var(--text))]">
    <!-- Header -->
    <header class="bg-surface border-b border-base shadow-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div>
          <button @click="router.push('/dashboard')" class="flex items-center gap-2 text-[rgb(var(--text-muted))] hover:text-primary mb-2">
            Back to Dashboard
          </button>
          <h1 class="text-4xl font-bold">Case Workflows</h1>
          <p class="text-lg text-[rgb(var(--text-muted))] mt-2">Define case types and automated status flows</p>
        </div>

        <div class="flex items-center gap-4">
          <!-- ACTION MENU (Manage Subtypes) -->
          <Menu as="div" class="relative">
            <MenuButton
              class="p-2.5 rounded-xl border border-base bg-surface hover:bg-[rgb(var(--bg))] transition"
              title="More actions"
            >
              <EllipsisVerticalIcon class="w-6 h-6 text-[rgb(var(--text))]" />
            </MenuButton>

            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <MenuItems
                class="absolute right-0 mt-3 w-56 p-2 bg-elevated border border-base rounded-xl shadow-lg focus:outline-none"
              >
                 <!-- Manage Subtypes -->
                <MenuItem v-slot="{ active }">
                  <button
                    @click="subtypesModalOpen = true"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition"
                    :class="active ? 'bg-surface' : ''"
                  >
                    <CogIcon class="w-5 h-5 text-emerald-600" />
                    Manage Subtypes
                  </button>
                </MenuItem>

                <!-- Export Case Types -->
                <MenuItem v-slot="{ active }">
                  <router-link
                    to="/case-export"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition"
                    :class="active ? 'bg-surface' : ''"
                  >
                    <ArrowDownTrayIcon class="w-5 h-5 text-blue-600" />
                    Export Case Types
                  </router-link>
                </MenuItem>
              </MenuItems>
            </Transition>
          </Menu>

          <ThemeToggleButton />
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-12 space-y-20">
      <!-- Case Types -->
      <section>
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold">Case Types</h2>
          <button @click="openNewType"
            class="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
            <PlusIcon class="w-5 h-5" />
            New Case Type
          </button>
        </div>
        <TransitionGroup name="list" tag="div" class="space-y-5">
          <div v-for="type in caseTypes" :key="type.id"
            class="relative bg-surface rounded-2xl shadow-base border border-base transition-all duration-300 hover:shadow-lg group">
            <!-- TrashIcon (hover right side only) -->
            <div class="absolute inset-y-0 right-0 w-32 flex items-center justify-center pointer-events-none">
              <button @click.stop="deleteCaseType(type.id)"
                class="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                title="Delete case type">
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>

            <div @click="openEditType(type)" class="pl-10 pr-40 py-8 cursor-pointer hover:bg-[rgb(var(--bg))] transition">
              <!-- Workflow Tag -->
              <div v-if="type.workflowId" class="absolute top-4 right-8">
                <button @click.stop="openWorkflowEditor(workflowStore.get(type.workflowId)!)"
                  class="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition">
                  Workflow: {{ workflowStore.get(type.workflowId)?.name || 'Untitled' }}
                </button>
              </div>

              <h3 class="font-bold text-xl">{{ type.title }}</h3>
              <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
                {{ type.prefix || '' }}{{ type.autoNumber ? '####' : '' }}{{ type.suffix || '' }}
              </p>

              <div class="mt-4 flex flex-wrap gap-2">
                <span v-for="sub in sortedSubtypeNames(type.subtypes)" :key="sub.id"
                  class="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                  {{ sub.name }}
                </span>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <p v-if="!caseTypes.length" class="text-center text-[rgb(var(--text-muted))] italic py-20 text-lg">
          No case types yet — click "+ New Case Type" to create one
        </p>
      </section>

      <!-- Workflows -->
      <section>
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold">Workflows</h2>
          <button @click="addWorkflow"
            class="px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition flex items-center gap-2">
            <PlusIcon class="w-5 h-5" />
            New Workflow
          </button>
        </div>
        <TransitionGroup name="list" tag="div" class="space-y-4">
          <div v-for="wf in workflows" :key="wf.id"
            class="relative bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 transition-all duration-300 hover:shadow-lg group">
            <!-- TrashIcon (hover right side only) -->
            <div class="absolute inset-y-0 right-0 w-28 flex items-center justify-center pointer-events-none">
              <button @click.stop="deleteWorkflow(wf.id)"
                class="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                title="Delete workflow">
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>

            <div @click="openWorkflowEditor(wf)" class="pl-8 pr-36 py-6 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-800/30 transition">
              <h3 class="text-xl font-bold text-purple-900 dark:text-purple-300 mb-3">{{ wf.name }}</h3>
              <div class="flex items-center gap-3 overflow-x-auto">
                <div v-for="step in wf.steps" :key="step.id" class="flex-shrink-0">
                  <div
                    class="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-sm font-medium shadow">
                    {{ statusTitle(step.statusId) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <p v-if="!workflows.length" class="text-center text-[rgb(var(--text-muted))] italic py-20 text-lg">
          No workflows yet — click "+ New Workflow" to create one
        </p>
      </section>
    </main>

    <!-- ==================== CASE TYPE MODAL ==================== -->
    <teleport to="body">
  <TransitionRoot :show="caseTypeModalOpen" appear>
    <Dialog as="div" class="relative z-50" @close="closeCaseTypeModal">
      <!-- Backdrop -->
      <TransitionChild enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      </TransitionChild>

      <!-- Modal Panel -->
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:scale-95">
          <DialogPanel class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-3xl w-full p-8 max-h-screen overflow-y-auto">
            <h3 class="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              {{ editingType?.id ? 'Edit' : 'New' }} Case Type
            </h3>

            <div v-if="editingType" class="space-y-6">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Title <span class="text-red-600">*</span>
                </label>
                <input v-model="editingType.title"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g. Building Permit" autofocus />
              </div>

              <!-- Prefix / Suffix -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Number Prefix</label>
                  <input v-model="editingType.prefix" placeholder="BLDG-"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Number Suffix</label>
                  <input v-model="editingType.suffix" placeholder="-{{yy}}"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>
              </div>

              <!-- Checkboxes -->
              <div class="flex items-center gap-8 text-gray-900 dark:text-gray-100">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" v-model="editingType.autoNumber"
                    class="w-5 h-5 text-blue-600 rounded" />
                  <span>Use Auto-Number</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" v-model="editingType.autoLicense"
                    class="w-5 h-5 text-blue-600 rounded" />
                  <span>Auto-create License on Approval</span>
                </label>
              </div>

              <!-- Subtypes -->
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Allowed Subtypes</label>
                <select v-model="pendingSubtypeId" @change="addSubtypeToType"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option :value="null">Add a subtype...</option>
                  <option v-for="sub in sortedSubtypes" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
                </select>
                <div class="mt-4 flex flex-wrap gap-3">
                  <div v-for="subId in editingType.subtypes" :key="subId"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                    <span>{{ subtypeName(subId) }}</span>
                    <button @click="editingType.subtypes = editingType.subtypes.filter(id => id !== subId)"
                      class="text-blue-600 hover:text-blue-800">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Workflow -->
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Assigned Workflow</label>
                <select v-model="editingType.workflowId"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option :value="undefined">No workflow</option>
                  <option v-for="wf in workflows" :key="wf.id" :value="wf.id">{{ wf.name }} ({{ wf.steps.length }} steps)</option>
                </select>
              </div>
            </div>

            <!-- Modal Actions -->
            <div class="flex justify-end gap-4 mt-8">
              <button @click="closeCaseTypeModal"
                class="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button @click="saveCaseType" :disabled="!editingType?.title?.trim()"
                class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition">
                Save Case Type
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</teleport>


    <!-- ==================== WORKFLOW EDITOR MODAL ==================== -->
    <teleport to="body">
  <TransitionRoot :show="workflowModalOpen" appear>
    <Dialog as="div" class="relative z-50" @close="closeWorkflowModal">
      <!-- Backdrop -->
      <TransitionChild enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      </TransitionChild>

      <!-- Modal Panel -->
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:scale-95">
          <DialogPanel class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full p-8 max-h-screen overflow-y-auto">
            <h3 v-if="editingWorkflow" class="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Edit Workflow: {{ editingWorkflow.name }}
            </h3>

            <div v-if="editingWorkflow" class="space-y-6">
              <!-- Workflow Name -->
              <input v-model="editingWorkflow.name" placeholder="Workflow name"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-xl font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-6" />

              <!-- Add Status -->
              <div class="mb-8">
                <p class="text-sm font-medium text-purple-700 dark:text-purple-300 mb-3">Add Status</p>
                <select v-model="pendingStatusId" @change="addStatusToWorkflow"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option :value="null" disabled>Select a status...</option>
                  <option v-for="status in availableStatuses" :key="status.id" :value="status.id">{{ status.title }}</option>
                </select>
              </div>

              <!-- Workflow Steps -->
              <p class="text-sm font-medium text-purple-700 dark:text-purple-300 mb-4">Workflow Steps (drag to reorder)</p>
              <draggable v-model="editingWorkflow.steps" item-key="id" handle=".handle" :force-fallback="true"
                fallback-tolerance="5"
                class="min-h-80 bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-dashed border-purple-300 dark:border-purple-700">
                <template #item="{ element: step }">
                  <div
                    class="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-base border border-purple-200 dark:border-purple-700 flex items-center justify-between mb-4 handle cursor-move select-none">
                    <div class="flex items-center gap-5">
                      <Bars3Icon class="w-6 h-6 text-purple-600 handle" />
                      <span class="text-lg font-semibold text-purple-900 dark:text-purple-300">{{ statusTitle(step.statusId) }}</span>
                    </div>
                    <button @click.stop="removeStep(step.id)" class="text-red-600 hover:text-red-800">
                      <TrashIcon class="w-5 h-5" />
                    </button>
                  </div>
                </template>
              </draggable>

              <div v-if="!editingWorkflow.steps.length"
                class="text-center text-purple-400 dark:text-purple-500 py-20 italic text-lg">
                Select statuses from the dropdown above
              </div>
            </div>

            <!-- Modal Actions -->
            <div class="flex justify-end gap-4 mt-8">
              <button @click="closeWorkflowModal"
                class="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button @click="saveWorkflow"
                class="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">Save Workflow</button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</teleport>


    <!-- ==================== SUBTYPES MODAL ==================== -->
    <teleport to="body">
      <TransitionRoot :show="subtypesModalOpen" appear>
        <Dialog as="div" class="relative z-50" @close="subtypesModalOpen = false">
          <TransitionChild enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
            leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </TransitionChild>

          <div class="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:scale-95">
              <DialogPanel class="bg-surface rounded-3xl shadow-2xl max-w-2xl w-full p-8">
                <h3 class="text-2xl font-bold mb-6">Manage Case Subtypes</h3>
                <div class="flex gap-3 mb-6">
                  <input v-model="newSubtypeName" @keyup.enter="addSubtype" placeholder="e.g. Residential"
                    class="flex-1 px-4 py-3 border border-base rounded-lg focus:ring-2 focus:ring-emerald-500 bg-bg" />
                  <button @click="addSubtype" :disabled="!newSubtypeName.trim()"
                    class="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">Add</button>
                </div>
                <div class="flex flex-wrap gap-3">
                  <div v-for="sub in sortedSubtypes" :key="sub.id"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-full text-sm font-medium">
                    <span>{{ sub.name }}</span>
                    <button @click="removeSubtype(sub.id)" class="text-emerald-600 hover:text-emerald-800">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="flex justify-end mt-8">
                  <button @click="subtypesModalOpen = false"
                    class="px-6 py-3 bg-gray-600 text-white rounded-xl">Close</button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </TransitionRoot>
    </teleport>

    <!-- Toast Component -->
    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">
      <Toast :message="toastMessage" :type="toastType" v-if="showToast" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Toast from '@/components/Toast.vue'
import draggable from 'vuedraggable'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem
} from '@headlessui/vue'

import { useStatusStore } from '@/stores/statusStore'
import { useCaseSubTypeStore } from '@/stores/caseSubTypeStore'
import { useCaseTypeStore, type CaseType } from '@/stores/caseTypeStore'
import { useWorkflowStore, type Workflow } from '@/stores/workflowStore'



import {
  PlusIcon,
  TrashIcon,
  CogIcon,
  Bars3Icon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

const router = useRouter()
const statusStore = useStatusStore()
const subtypeStore = useCaseSubTypeStore()
const caseTypeStore = useCaseTypeStore()
const workflowStore = useWorkflowStore()
// const projectStore = useProjectStore()

const statuses = computed(() => statusStore.list.value || [])
const subtypes = computed(() => subtypeStore.list.value || [])
const caseTypes = computed(() => caseTypeStore.list.value || [])
const workflows = computed(() => workflowStore.list.value)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('success')

function showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  // Auto-hide after 3 seconds
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const sortedSubtypes = computed(() => [...subtypes.value].sort((a, b) => a.name.localeCompare(b.name)))
const sortedSubtypeNames = (ids: string[]) => ids.map(id => ({ id, name: subtypeName(id) })).sort((a, b) => a.name.localeCompare(b.name))

const subtypeName = (id: string) => subtypes.value.find(s => s.id === id)?.name || 'Unknown'
const statusTitle = (id: string) => statuses.value.find((s: { id: string }) => s.id === id)?.title || 'Unknown'

const editingType = ref<CaseType | null>(null)
const editingWorkflow = ref<Workflow | null>(null)
const newSubtypeName = ref('')
const pendingSubtypeId = ref<string | null>(null)
const pendingStatusId = ref<string | null>(null)

// Modal open states — ref + watch = 100% crash-proof
const caseTypeModalOpen = ref(false)
const workflowModalOpen = ref(false)
const subtypesModalOpen = ref(false)

// Sync editing state → modal visibility
watch(editingType, (val) => caseTypeModalOpen.value = !!val)
watch(editingWorkflow, (val) => workflowModalOpen.value = !!val)

// Available statuses for current workflow
const availableStatuses = computed(() =>
  editingWorkflow.value
    ? statuses.value.filter((s: { id: string }) => !editingWorkflow.value!.steps.some(st => st.statusId === s.id))
    : []
)

// Safe close handlers
const closeCaseTypeModal = () => {
  editingType.value = null
}
const closeWorkflowModal = () => {
  editingWorkflow.value = null
}

// Actions
const openNewType = () => {
  editingType.value = {
    id: crypto.randomUUID(),
    title: '',
    prefix: '',
    suffix: '',
    autoNumber: true,
    autoLicense: false,
    subtypes: [],
    workflowId: undefined
  }
}

const openEditType = (type: CaseType) => {
  editingType.value = { ...type }
}

const openWorkflowEditor = (wf: Workflow) => {
  editingWorkflow.value = { ...wf, steps: [...wf.steps] }
}

const addSubtypeToType = () => {
  if (!pendingSubtypeId.value || !editingType.value) return
  if (!editingType.value.subtypes.includes(pendingSubtypeId.value)) {
    editingType.value.subtypes.push(pendingSubtypeId.value)
  }
  pendingSubtypeId.value = null
}

const saveCaseType = async () => {
  if (!editingType.value?.title?.trim()) return
  await caseTypeStore.save(editingType.value)
  editingType.value = null
  showToastMessage('Case Type Saved')
}

const deleteCaseType = async (id: string) => {
  if (confirm('Delete this case type? This cannot be undone.')) {
    await caseTypeStore.remove(id)
    showToastMessage('Case Type Deleted', 'info')
  }
}

const addWorkflow = () => {
  editingWorkflow.value = {
    id: crypto.randomUUID(),
    name: 'New Workflow',
    steps: []
  }
}

const addStatusToWorkflow = () => {
  if (!pendingStatusId.value || !editingWorkflow.value) return
  editingWorkflow.value.steps.push({
    id: crypto.randomUUID(),
    statusId: pendingStatusId.value
  })
  pendingStatusId.value = null
}

const removeStep = (id: string) => {
  if (!editingWorkflow.value) return
  editingWorkflow.value.steps = editingWorkflow.value.steps.filter(s => s.id !== id)
}

const saveWorkflow = async () => {
  if (!editingWorkflow.value || editingWorkflow.value.steps.length === 0) {
    showToastMessage('Please add at least one status', 'info')
    return
  }
  await workflowStore.save(editingWorkflow.value)
  editingWorkflow.value = null
  showToastMessage('Workflow Saved')
}

const deleteWorkflow = async (id: string) => {
  await workflowStore.remove(id)
  showToastMessage('Workflow Deleted', 'info')
}

const addSubtype = async () => {
  if (newSubtypeName.value.trim()) {
    await subtypeStore.add(newSubtypeName.value.trim())
    newSubtypeName.value = ''
  }
}

const removeSubtype = async (id: string) => {
  await subtypeStore.remove(id)
  showToastMessage('Subtype Deleted', 'info')
}



</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}

div:hover>div>button {
  opacity: 1 !important;
}

.handle {
  cursor: grab;
}

.handle:active {
  cursor: grabbing;
}
</style>