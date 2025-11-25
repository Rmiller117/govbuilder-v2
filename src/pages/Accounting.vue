<template>
  <div class="min-h-screen bg-bg text-[rgb(var(--text))]">
<!-- Header -->
<header class="bg-surface border-b border-base shadow-sm">
  <div class="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
    <!-- Left -->
    <div class="flex items-center gap-4">
      <button @click="router.push('/dashboard')" class="p-2.5 rounded-lg hover:bg-[rgb(var(--bg))] transition">
        <ArrowLeftIcon class="w-6 h-6" />
      </button>
      <h1 class="text-3xl font-bold">Accounting Details</h1>
    </div>

    <!-- Right -->
    <div class="flex items-center gap-4">

      <!-- Add Detail button (keep as main CTA) -->
      <button
        @click="openModal()"
        class="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
      >
        <PlusIcon class="w-5 h-5" />
        Add Detail
      </button>

      <!-- ACTION MENU (Import + Generate) -->
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

            <!-- Generate Govbuilt Import -->
            <MenuItem v-slot="{ active }">
              <button
                @click="generateGovbuiltImport"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition"
                :class="active ? 'bg-surface' : ''"
              >
                <ArrowDownTrayIcon class="w-5 h-5 text-primary" />
                Generate Govbuilt Import
              </button>
            </MenuItem>

            <!-- Import File -->
            <MenuItem v-slot="{ active }">
              <button
                @click="importFile"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition"
                :class="active ? 'bg-surface' : ''"
              >
                <DocumentArrowUpIcon class="w-5 h-5 text-primary" />
                Import File
              </button>
            </MenuItem>

          </MenuItems>
        </Transition>
      </Menu>

      <!-- Theme toggle -->
      <ThemeToggleButton />
    </div>
  </div>
</header>

    <main class="max-w-5xl mx-auto px-6 py-12">
      <!-- Empty State -->
      <div v-if="!list.length" class="text-center py-20">
        <div class="bg-surface border border-base w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
          <DocumentTextIcon class="w-12 h-12 text-[rgb(var(--text-muted))]" />
        </div>
        <h3 class="text-xl font-semibold mb-2">No accounting details yet</h3>
        <p class="text-[rgb(var(--text-muted))]">Click "Add Detail" to create your first one.</p>
      </div>

      <!-- Vertical List -->
      <TransitionGroup name="list" tag="ul" class="space-y-4">
        <li v-for="detail in list" :key="detail.id"
          class="bg-surface rounded-2xl shadow-base border border-base overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
          @click="openModal(detail)">
          <div class="px-8 py-6 flex items-center justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-semibold">{{ detail.title }}</h3>
              <div class="mt-2 flex items-center gap-3 text-sm">
                <span
                  class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full font-medium text-xs">
                  GL: {{ detail.glKey }}
                </span>
                <span v-if="detail.notes" class="text-[rgb(var(--text-muted))] line-clamp-1">{{ detail.notes }}</span>
                <span v-else class="text-[rgb(var(--text-muted))] italic">No notes</span>
              </div>
            </div>

            <button @click.stop="remove(detail.id), handleDelete()"
              class="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              title="Delete detail">
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </li>
      </TransitionGroup>
    </main>

    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">
      <Toast :message="toastMessage" :type="toastType" v-if="showToast" />
    </Transition>


    <!-- Animated Modal -->
    <teleport to="body">
      <TransitionRoot :show="modalOpen" appear>
        
        <Dialog as="div" class="relative z-50" @close="modalOpen = false">

          <!-- Backdrop (dark/light automatically) -->
          <TransitionChild enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
            leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
            <div class="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
          </TransitionChild>

          <!-- Modal Panel -->
          <div class="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
            <TransitionChild enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:scale-95">
              <DialogPanel
                class="bg-elevated shadow-lg rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 border border-base text-[rgb(var(--text))]">
                <h2 class="text-2xl font-bold mb-8">
                  {{ editing?.id ? 'Edit' : 'Add' }} Accounting Detail
                </h2>

                <form @submit.prevent="saveDetail" class="space-y-6">

                  <!-- TITLE -->
                  <div>
                    <label class="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                      Title <span class="text-danger">*</span>
                    </label>
                    <input v-model="editing.title" required
                      class="w-full px-5 py-3 border border-base rounded-xl bg-surface text-[rgb(var(--text))] ring-focus" />
                  </div>

                  <!-- GL KEY -->
                  <div>
                    <label class="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                      GL Key <span class="text-danger">*</span>
                    </label>
                    <input v-model="editing.glKey" required placeholder="e.g. 01-101-550021"
                      class="w-full px-5 py-3 border border-base rounded-xl bg-surface text-[rgb(var(--text))] ring-focus" />
                  </div>

                  <!-- GRID FIELDS -->
                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium mb-2">Tran Code</label>
                      <input v-model="editing.tranCode"
                        class="w-full px-5 py-3 border border-base rounded-xl bg-surface text-[rgb(var(--text))]" />
                    </div>

                    <div>
                      <label class="block text-sm font-medium mb-2">Fee Code</label>
                      <input v-model="editing.feeCode"
                        class="w-full px-5 py-3 border border-base rounded-xl bg-surface text-[rgb(var(--text))]" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Fee Abbreviation</label>
                    <input v-model="editing.feeAbbreviation" placeholder="Required for JetPay..."
                      class="w-full px-5 py-3 border border-base rounded-xl bg-surface text-[rgb(var(--text))]" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Notes</label>
                    <textarea v-model="editing.notes" rows="3"
                      class="w-full px-5 py-3 border border-base rounded-xl bg-surface text-[rgb(var(--text))]"></textarea>
                  </div>

                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium mb-2">Debit Account Number</label>
                      <input v-model="editing.debitAccountNumber"
                        class="w-full px-5 py-3 border border-base rounded-xl bg-surface text-[rgb(var(--text))]" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-2">Debit Account Transfer Number</label>
                      <input v-model="editing.debitAccountTransferNumber"
                        class="w-full px-5 py-3 border border-base rounded-xl bg-surface text-[rgb(var(--text))]" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Fee Details</label>
                    <textarea v-model="editing.feeDetails" rows="4"
                      class="w-full px-5 py-3 border border-base rounded-xl bg-surface text-[rgb(var(--text))]"></textarea>
                  </div>

                  <!-- BUTTONS -->
                  <div class="flex justify-end gap-4 pt-8 border-t border-base">
                    <button type="button" @click="modalOpen = false"
                      class="px-8 py-3 border border-base rounded-xl bg-surface hover:bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
                      Cancel
                    </button>

                    <button type="submit"
                      class="px-8 py-3 rounded-xl text-white bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-hover))] transition">
                      {{ editing?.id ? 'Save' : 'Create' }} Detail
                    </button>
                  </div>
                </form>

              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </TransitionRoot>
    </teleport>


    <!-- File input for import (hidden) -->
    <input ref="fileInputRef" type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="handleFileUpload" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountingStore, type AccountingDetail } from '@/stores/acountingStore'
import { exportAccountingDetailsToFile } from '@/utils/accountingExportUtils'
import Toast from '@/components/Toast.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import { importAccountingDetailsFromFile } from '@/utils/accountingImportUtils'
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
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  EllipsisVerticalIcon
} from '@heroicons/vue/24/outline'

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('success')

function showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const router = useRouter()
const { list, save, remove } = useAccountingStore()

const modalOpen = ref(false)
const editing = ref<Partial<AccountingDetail>>({})
const fileInputRef = ref<HTMLInputElement | null>(null)

function openModal(detail?: AccountingDetail) {
  editing.value = detail ? { ...detail } : { title: '', glKey: '' }
  modalOpen.value = true
}

async function saveDetail() {
  const success = await save(editing.value as AccountingDetail)
  if (success) {
    modalOpen.value = false
    showToastMessage('Accounting detail saved successfully!')
  }
}

function handleDelete() {
  showToastMessage('Accounting detail deleted.', 'info')
}


async function generateGovbuiltImport() {
  try {
    const result = await exportAccountingDetailsToFile()
    
    if (result.success) {
      showToastMessage('Govbuilt import file generated successfully in Import Files folder!', 'success')
    } else {
      showToastMessage(result.error || 'Error generating import file', 'error')
    }
  } catch (err) {
    console.error(err)
    showToastMessage('Error generating import file: ' + (err as Error).message, 'error')
  }
}


// Import functionality
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
    const result = await importAccountingDetailsFromFile(content, file.name)

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

.list-leave-active {
  position: absolute;
  width: 100%;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-clamp: 1;
}
</style>