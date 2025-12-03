<template>
  <div class="min-h-screen bg-bg text-[rgb(var(--text))]">
    <!-- Header -->
    <header class="bg-surface border-b border-base shadow-sm">
      <div class="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="router.push('/Dashboard')"
            class="p-2 rounded-lg hover:bg-[rgb(var(--bg))] transition-colors"
            title="Go back"
          >
            <ArrowLeftIcon class="w-6 h-6" />
          </button>
          <h1 class="text-3xl font-bold">Statuses</h1>
        </div>

        <div class="flex items-center gap-4">
          <button
            @click="router.push('/statuses/new')"
            class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon class="w-5 h-5" />
            Add Status
          </button>

          <!-- ACTION MENU (Import) -->
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

          <ThemeToggleButton />
        </div>
      </div>
    </header>

    <!-- Navigation Bar -->
    <div class="bg-surface border-b border-base shadow-sm">
      <div class="max-w-4xl mx-auto px-6 py-4">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <!-- Search and Filters -->
          <div class="flex flex-col sm:flex-row gap-3 flex-1">
            <SearchInput
              v-model="searchQuery"
              placeholder="Search statuses..."
              class="w-full sm:w-96"
              @search="handleSearch"
              @clear="handleSearchClear"
            />
            <FilterDropdown
              :active-filters="activeFilters"
              @filter-change="handleFilterChange"
              @filter-clear="handleFilterClear"
            />
          </div>

          <!-- Results count -->
          <div class="text-sm text-[rgb(var(--text-muted))]">
            <span v-if="totalFilteredItems > 0">
              {{ totalFilteredItems }} {{ totalFilteredItems === 1 ? 'status' : 'statuses' }} found
            </span>
            <span v-else>
              No statuses found
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-6 py-10">
      <!-- Status List Container -->
      <div class="bg-surface rounded-2xl shadow-lg border border-base overflow-hidden">
        <!-- Empty state -->
        <div v-if="!paginatedStatuses.length && !searchQuery && !Object.keys(activeFilters).length" class="text-center py-20 px-8">
          <div class="bg-surface border border-base w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <DocumentTextIcon class="w-12 h-12 text-[rgb(var(--text-muted))]" />
          </div>
          <h3 class="text-xl font-semibold mb-2">No statuses yet</h3>
          <p class="text-[rgb(var(--text-muted))]">Create your first status to get started.</p>
        </div>

        <!-- No results state -->
        <div v-else-if="!paginatedStatuses.length" class="text-center py-20 px-8">
          <div class="bg-surface border border-base w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <MagnifyingGlassIcon class="w-12 h-12 text-[rgb(var(--text-muted))]" />
          </div>
          <h3 class="text-xl font-semibold mb-2">No statuses found</h3>
          <p class="text-[rgb(var(--text-muted))]">Try adjusting your search or filters.</p>
          <button
            @click="clearAllFilters"
            class="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>

        <!-- Status list -->
        <div v-else>
          <ul class="divide-y divide-base">
            <li
              v-for="s in paginatedStatuses"
              :key="s.id"
              class="group hover:bg-[rgb(var(--bg))] transition-colors"
            >
              <div
                class="px-8 py-6 flex items-center justify-between cursor-pointer"
                @click="router.push(`/statuses/${s.id}`)"
              >
                <div class="flex-1">
                  <h3 class="text-lg font-medium">
                    {{ s.title?.trim() || "(Untitled status)" }}
                  </h3>
                  
                  <!-- Notification Pills -->
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span 
                      v-if="s.notifyAssignedTeamMembers" 
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
                    >
                      <UsersIcon class="w-3 h-3 mr-1" />
                      Team
                    </span>
                    
                    <span 
                      v-if="s.notifyApplicant" 
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300"
                    >
                      <UserIcon class="w-3 h-3 mr-1" />
                      Applicant
                    </span>
                    
                    <span 
                      v-if="s.notifyOtherTeamMembers" 
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300"
                    >
                      <UserGroupIcon class="w-3 h-3 mr-1" />
                      Other Team
                    </span>
                    
                    <span 
                      v-if="s.notifyAllContacts" 
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"
                    >
                      <UsersIcon class="w-3 h-3 mr-1" />
                      All Contacts
                    </span>
                    
                    <span 
                      v-if="s.notifyOtherRecipient" 
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300"
                    >
                      <EnvelopeIcon class="w-3 h-3 mr-1" />
                      Other Recipient
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <!-- Hide from status flow chevron icon -->
                  <div v-if="s.hideFromStatusFlowChevron" title="Hidden from status flow">
                    <EyeSlashIcon class="w-5 h-5 text-[rgb(var(--text-muted))]" />
                  </div>

                  <button
                    @click.stop="remove(s.id)"
                    class="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Delete status"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>

                  <ChevronRightIcon class="w-5 h-5 text-[rgb(var(--text-muted))]" />
                </div>
              </div>
            </li>
          </ul>

          <!-- Pagination -->
          <Pagination
            v-if="totalPages > 1"
            v-model:current-page="currentPage"
            :total-items="totalFilteredItems"
            :page-size="pageSize"
            :page-size-options="pageSizeOptions"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
          />
        </div>
      </div>
    </main>
    <DashboardButton />

    <!-- Toast notification -->
    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">
      <div v-if="showToast" class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div class="px-6 py-3 rounded-full shadow-lg border border-base bg-surface text-[rgb(var(--text))] flex items-center gap-3 font-medium text-sm">
          <svg v-if="toastType === 'success'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="toastType === 'error'" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ toastMessage }}
        </div>
      </div>
    </Transition>

    <!-- File input for import (hidden) -->
    <input ref="fileInputRef" type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="handleFileUpload" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStatusStore } from '@/stores/statusStore'
import DashboardButton from '@/components/DashboardButton.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import SearchInput from '@/components/SearchInput.vue'
import Pagination from '@/components/Pagination.vue'
import FilterDropdown from '@/components/FilterDropdown.vue'
import { importStatusesFromFile } from '@/utils/statusImportUtils'
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem
} from '@headlessui/vue'

// Import Heroicons
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  DocumentTextIcon,
  UsersIcon,
  UserIcon,
  UserGroupIcon,
  EnvelopeIcon,
  EyeSlashIcon,
  TrashIcon,
  ChevronRightIcon,
  DocumentArrowUpIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { 
  remove,
  // Navigation state
  searchQuery,
  currentPage,
  pageSize,
  activeFilters,
  pageSizeOptions,
  // Computed
  paginatedStatuses,
  totalPages,
  totalFilteredItems,
  // Actions
  setSearchQuery,
  setPage,
  setPageSize,
  setFilters,
  clearFilters
} = useStatusStore()

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

// Navigation handlers
function handleSearch(query: string) {
  setSearchQuery(query)
}

function handleSearchClear() {
  setSearchQuery('')
}

function handleFilterChange(filters: Record<string, string[]>) {
  setFilters(filters)
}

function handleFilterClear() {
  clearFilters()
}

function handlePageChange(page: number) {
  setPage(page)
}

function handlePageSizeChange(newSize: number) {
  setPageSize(newSize)
}

function clearAllFilters() {
  clearFilters()
  setSearchQuery('')
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

    // Import statuses from file
    const result = await importStatusesFromFile(content, file.name)

    if (result.success) {
      showToastMessage(`Successfully imported ${result.importedCount} statuses!`, 'success')
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
/* Add some additional styling for better visual appeal */
.group:hover .status-title {
  color: #2563eb;
}
</style>