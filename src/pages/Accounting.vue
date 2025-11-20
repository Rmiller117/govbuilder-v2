<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.push('/dashboard')" class="p-2.5 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeftIcon class="w-6 h-6" />
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Accounting Details</h1>
        </div>

        <div class="flex gap-4">
<button @click="generateGovbuiltImport" class="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition flex items-center gap-2">
            <ArrowDownTrayIcon class="w-5 h-5" />
            Generate Govbuilt Import
          </button>
          <button @click="openModal()" class="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
            <PlusIcon class="w-5 h-5" />
            Add Detail
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-12">
      <!-- Empty State -->
      <div v-if="!list.length" class="text-center py-20">
        <div class="bg-gray-100 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
          <DocumentTextIcon class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No accounting details yet</h3>
        <p class="text-gray-500">Click “Add Detail” to create your first one.</p>
      </div>

      <!-- Vertical List -->
      <TransitionGroup name="list" tag="ul" class="space-y-4">
        <li
          v-for="detail in list"
          :key="detail.id"
          class="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
          @click="openModal(detail)"
        >
          <div class="px-8 py-6 flex items-center justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900">{{ detail.title }}</h3>
              <div class="mt-2 flex items-center gap-3 text-sm">
                <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium text-xs">
                  GL: {{ detail.glKey }}
                </span>
                <span v-if="detail.notes" class="text-gray-600 line-clamp-1">{{ detail.notes }}</span>
                <span v-else class="text-gray-400 italic">No notes</span>
              </div>
            </div>

            <button
              @click.stop="remove(detail.id)"
              class="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
              title="Delete detail"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </li>
      </TransitionGroup>
    </main>

    <!-- Animated Modal -->
    <teleport to="body">
  <TransitionRoot :show="modalOpen" appear>
    <Dialog as="div" class="relative z-50" @close="modalOpen = false">
      <!-- Backdrop -->
      <TransitionChild
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      </TransitionChild>

      <!-- Modal Panel -->
      <div class="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <TransitionChild
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:scale-95"
        >
          <DialogPanel class="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 class="text-2xl font-bold mb-8">
              {{ editing?.id ? 'Edit' : 'Add' }} Accounting Detail
            </h2>

            <form @submit.prevent="saveDetail" class="space-y-6">
              <!-- Title * -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="editing.title"
                  required
                  class="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- GL Key * -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  GL Key <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="editing.glKey"
                  required
                  placeholder="e.g. 01-101-550021"
                  class="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Rest of the fields – same as before -->
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tran Code</label>
                  <input v-model="editing.tranCode" class="w-full px-5 py-3 border border-gray-300 rounded-xl" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Fee Code</label>
                  <input v-model="editing.feeCode" class="w-full px-5 py-3 border border-gray-300 rounded-xl" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fee Abbreviation</label>
                <input
                  v-model="editing.feeAbbreviation"
                  placeholder="Required for JetPay..."
                  class="w-full px-5 py-3 border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea v-model="editing.notes" rows="3" class="w-full px-5 py-3 border border-gray-300 rounded-xl"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Debit Account Number</label>
                  <input v-model="editing.debitAccountNumber" class="w-full px-5 py-3 border border-gray-300 rounded-xl" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Debit Account Transfer Number</label>
                  <input v-model="editing.debitAccountTransferNumber" class="w-full px-5 py-3 border border-gray-300 rounded-xl" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fee Details</label>
                <textarea v-model="editing.feeDetails" rows="4" class="w-full px-5 py-3 border border-gray-300 rounded-xl"></textarea>
              </div>

              <!-- Buttons -->
              <div class="flex justify-end gap-4 pt-8 border-t">
                <button
                  type="button"
                  @click="modalOpen = false"
                  class="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountingStore, type AccountingDetail } from '@/stores/acountingStore'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
} from '@headlessui/vue'

// Import Heroicons
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  DocumentTextIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

import { invoke } from '@tauri-apps/api/core'


const router = useRouter()
const { list, save, remove } = useAccountingStore()

const modalOpen = ref(false)
const editing = ref<Partial<AccountingDetail>>({})

function openModal(detail?: AccountingDetail) {
  editing.value = detail ? { ...detail } : { title: '', glKey: '' }
  modalOpen.value = true
}

async function saveDetail() {
  const success = await save(editing.value as AccountingDetail)
  if (success) modalOpen.value = false
}

async function generateGovbuiltImport() {
  const govBuiltData = {
    name: "AccountingDetails",
    displayName: "Accounting Details",
    description: "Accounting details for Govbuilt import",
    author: "",
    website: "",
    version: "1.0.0",
    issetuprecipe: false,
    categories: [],
    tags: [],
    steps: [
      {
        name: "content",
        data: list.value.map(detail => ({
          ContentType: "AccountingDetails",
          DisplayText: detail.title,
          Latest: true,
          Published: true,
          ModifiedUtc: "[js: new Date()]",
          PublishedUtc: "[js: new Date()]",
          CreatedUtc: "[js: new Date()]",
          Owner: "",
          Author: "",
          AccountingDetails: {
            GLKey: {
              Text: detail.glKey || ""
            },
            TranCode: {
              Text: detail.tranCode || ""
            },
            FeeAbbreviation: {
              Text: detail.feeAbbreviation || ""
            },
            Notes: {
              Text: detail.notes || ""
            },
            FeeCode: {
              Text: detail.feeCode || ""
            },
            DebitAccountNumber: {
              Text: detail.debitAccountNumber || ""
            },
            DebitAccountTransferNumber: {
              Text: detail.debitAccountTransferNumber || ""
            },
            FeeDetails: {}
          },
          TitlePart: {
            Title: detail.title
          }
        }))
      }
    ]
  };
  try {
    // Call the Tauri command to generate the file in Import Files directory
  await invoke('generate_import_file', {
      data: govBuiltData,
      path: 'Import Files/AccountingDetails.json'
    });
    
    // Show success message
    alert('Govbuilt import file generated successfully in Import Files directory!');
  } catch (error) {
    console.error('Error generating import file:', error);
    alert('Error generating import file: ' + error);
  }
}
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active { transition: all 0.4s ease; }
.list-enter-from,
.list-leave-to { opacity: 0; transform: translateY(30px); }
.list-leave-active { position: absolute; width: 100%; }

.group:hover .group-hover\:opacity-100 { opacity: 1; }
.line-clamp-1 { 
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>