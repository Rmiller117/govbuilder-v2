<template>
  <Modal :open="open" @close="$emit('close')" class="z-50">
    <template #title>
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
          <CogIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        API Configuration Wizard
      </div>
    </template>
    
    <div class="w-full max-w-6xl mx-auto">
      <div class="space-y-6">
      <!-- Progress Steps -->
      <div class="mb-6 sm:mb-10">
        <nav aria-label="Progress">
          <ol class="flex items-center justify-between">
            <li v-for="(step, index) in steps" :key="step.id" class="flex items-center">
              <div class="flex items-center"
                :class="{ 'cursor-pointer hover:opacity-80': index < currentStepIndex, 'cursor-not-allowed opacity-50': index > currentStepIndex }"
                @click="index < currentStepIndex && goToStep(index)">
                <div class="flex items-center">
                  <div class="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 text-xs sm:text-sm font-medium"
                    :class="getStepClass(index)">
                    <CheckIcon v-if="isStepCompleted(index)" class="h-4 w-4 sm:h-6 sm:w-6" />
                    <span v-else>{{ index + 1 }}</span>
                  </div>
                  <span class="ml-2 sm:ml-3 text-xs sm:text-sm font-medium"
                    :class="getStepTextClass(index)">{{ step.title }}</span>
                </div>
              </div>
              <div v-if="index < steps.length - 1" class="flex-1 h-0.5 mt-4 sm:mt-5 mx-1 sm:mx-2 hidden sm:block"
                :class="index < currentStepIndex ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))]'"></div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Carousel Cards -->
      <div class="relative h-[400px] sm:h-[600px] overflow-hidden rounded-2xl">
        <div class="relative w-full h-full">
          <!-- Step 0 Card - URL Configuration -->
          <StepCard
            title="Configure Staging URL"
            description="Enter the base URL for your Orchard Core staging site where API configurations will be applied."
            :step-index="0"
            :current-step-index="currentStepIndex"
            status="pending"
            :show-checkbox="true"
            :checkbox-label="urlCheckboxLabel"
            :checkbox-checked="urlConfirmed"
            @checkbox-change="(checked) => handleUrlConfirmation(checked)"
          >
            <template #default>
              <div class="space-y-4">
                <div>
                  <label for="wizard-staging-url" class="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Staging URL
                  </label>
                  <input
                    id="wizard-staging-url"
                    v-model="tempStagingUrl"
                    type="url"
                    placeholder="https://your-staging-site.com"
                    class="w-full px-4 py-3 rounded-xl border border-base bg-surface placeholder:text-[rgb(var(--text-muted))/0.5 text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))/0.5] ring-focus"
                  />
                  <p class="mt-2 text-sm text-[rgb(var(--text-muted))]">
                    Enter the base URL for your Orchard Core staging site.
                  </p>
                </div>
              </div>
            </template>
          </StepCard>

          <!-- Step 1 Card - Create Queries -->
          <StepCard
            title="Create Queries"
            description="Create a custom SQL query in Orchard Core to retrieve content items by display text."
            :step-index="1"
            :current-step-index="currentStepIndex"
            status="pending"
            :alert="{
              type: 'info',
              title: 'SQL Query Required',
              content: 'Create one custom SQL query in Orchard Core to retrieve content items by display text.'
            }"
            :show-checkbox="true"
            :checkbox-label="step1CheckboxLabel"
            :checkbox-checked="queriesCreated"
            @checkbox-change="(checked) => handleQueriesConfirmation(checked)"
          >
            <template #default>
              <div class="space-y-6">
                <!-- Content Items Query -->
                <div class="space-y-3">
                  <h5 class="font-medium text-[rgb(var(--text))]">Content Items Query</h5>
                  <div class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] p-4 rounded-lg space-y-3">
                    <div>
                      <label class="text-xs font-medium text-[rgb(var(--text-muted))]">Query Name</label>
                      <div class="mt-1 flex items-center justify-between">
                        <code class="text-sm font-mono text-[rgb(var(--text))]">GetAllContentItemsByContentType</code>
                        <button @click="copyToClipboard('GetAllContentItemsByContentType')" class="p-1.5 text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 rounded transition-colors">
                          <ClipboardIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-[rgb(var(--text-muted))]">SQL Query</label>
                      <div class="mt-1 relative">
                        <pre class="text-sm font-mono text-[rgb(var(--text))] p-3 pr-12 bg-[rgb(var(--bg))] rounded border border-[rgb(var(--border))]">SELECT ContentItemId, DisplayText
FROM ContentItemIndex
WHERE Published = 1
AND Latest = 1
ORDER BY DisplayText</pre>
                        <button @click="copyToClipboard(contentItemsSqlQuery)" class="absolute top-3 right-3 p-1.5 text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 rounded transition-colors">
                          <ClipboardIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="stagingUrl" class="pt-4 border-t border-[rgb(var(--border))]">
                  <button
                    @click="openQueryBuilder"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition"
                  >
                    <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                    Open Query Builder
                  </button>
                </div>
              </div>
            </template>
          </StepCard>

          <!-- Step 2 Card - API Access -->
          <StepCard
            title="Configure API Access"
            description="Configure the 'ANONYMOUS' role in Orchard Core to allow public access to the query endpoint."
            :step-index="2"
            :current-step-index="currentStepIndex"
            status="pending"
            :alert="{
              type: 'warning',
              title: 'Manual Step Required',
              content: step2AlertContent,
              link: stagingUrl ? {
                text: 'Open ANONYMOUS Role Settings',
                onClick: () => openAnonymousRolePage()
              } : undefined
            }"
            :show-checkbox="true"
            :checkbox-label="step2CheckboxLabel"
            :checkbox-checked="accessConfirmed"
            @checkbox-change="(checked) => handleAccessConfirmation(checked)"
          />
        </div>
      </div>

      <!-- Sync Progress -->
      <div v-if="isSyncing" class="mt-6 p-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg">
        <div class="flex items-center gap-3 mb-3">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--primary))]"></div>
          <h4 class="font-medium text-[rgb(var(--text))]">Syncing Content from API...</h4>
        </div>
        
        <div v-if="syncProgress" class="space-y-2">
          <div class="flex justify-between text-sm text-[rgb(var(--text-muted))]">
            <span>Current: {{ syncProgress.current }}</span>
            <span>{{ syncProgress.completed }} / {{ syncProgress.total }}</span>
          </div>
          <div class="w-full bg-[rgb(var(--border))] rounded-full h-2">
            <div 
              class="bg-[rgb(var(--primary))] h-2 rounded-full transition-all duration-300"
              :style="{ width: `${(syncProgress.completed / syncProgress.total) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Sync Error -->
      <div v-if="syncError" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="text-sm font-medium text-red-800 dark:text-red-200">Sync Failed</h4>
            <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ syncError }}</p>
            <p class="mt-2 text-xs text-red-600 dark:text-red-400">
              API configuration was saved, but content sync failed. You can try syncing manually from the Dashboard.
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <button @click="previousStep" :disabled="currentStepIndex === 0"
          class="inline-flex items-center justify-center px-4 py-2 border border-[rgb(var(--border))] text-sm font-medium rounded-md text-[rgb(var(--text))] bg-[rgb(var(--surface))] hover:bg-[rgb(var(--elevated))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <ArrowLeftIcon class="mr-2 h-4 w-4" />
          Previous
        </button>

        <button v-if="currentStepIndex < steps.length - 1" @click="nextStep" :disabled="!canProceed"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-hover))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Next
          <ArrowRightIcon class="ml-2 h-4 w-4" />
        </button>

        <button v-else @click="complete" :disabled="isSyncing"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(var(--success))] hover:bg-[rgb(var(--success))]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--success))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <div v-if="isSyncing" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          <CheckIcon v-else class="mr-2 h-4 w-4" />
          {{ isSyncing ? 'Syncing...' : 'Complete' }}
        </button>
      </div>
      </div>
    </div>
  </Modal>
  <Toast :message="toastMessage" :type="toastType" v-if="showToast" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { invoke } from '@tauri-apps/api/core'
import Modal from '@/components/Modal.vue'
import StepCard from '@/components/StepCard.vue'
import { type SyncProgress } from '@/utils/apiSyncUtils'
import Toast from '@/components/Toast.vue'

// Heroicons
import {
  CogIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ClipboardIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'complete'): void
}

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

defineProps<Props>()
const emit = defineEmits<Emits>()

const projectStore = useProjectStore()
const stagingUrl = computed(() => projectStore.current?.stagingUrl ?? null)

// Steps
const steps = [
  { id: 'url', title: 'Staging URL' },
  { id: 'queries', title: 'Create Queries' },
  { id: 'access', title: 'API Access' }
]

const currentStepIndex = ref(0)

// State
const urlConfirmed = ref(false)
const accessConfirmed = ref(false)
const queriesCreated = ref(false)
const tempStagingUrl = ref('')
const isSyncing = ref(false)
const syncProgress = ref<SyncProgress | null>(null)
const syncError = ref<string | null>(null)

// SQL Queries
const contentItemsSqlQuery = `SELECT ContentItemId, DisplayText
FROM ContentItemIndex
WHERE Published = 1
AND Latest = 1
ORDER BY DisplayText`

// Computed
const urlCheckboxLabel = computed(() => 
  'I have entered a valid staging URL'
)

const step1CheckboxLabel = computed(() => 
  'I have created the "GetAllContentItemsByContentType" SQL query in Orchard Core'
)

const step2AlertContent = computed(() => {
  const baseUrl = projectStore.current?.stagingUrl?.replace(/\/$/, '') || 'your staging site'
  return `Please follow these steps in Orchard Core:<ol class="list-decimal list-inside space-y-1 mt-2"><li>Navigate to <strong>Security</strong> → <strong>Roles</strong></li><li>Find and select the <strong>ANONYMOUS</strong> role</li><li>Go to <strong>Permissions</strong> tab</li><li>Find and enable <strong>Execute API</strong> permission for <strong>GetAllContentItemsByContentType</strong></li><li>Save changes</li></ol><p class="mt-2"><strong>Your staging site:</strong> <code class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] px-1 rounded text-xs">${baseUrl}</code></p>`
})

const step2CheckboxLabel = computed(() => 
  'I have enabled ANONYMOUS access to "GetAllContentItemsByContentType"'
)

const canProceed = computed(() => {
  if (currentStepIndex.value === 0) return urlConfirmed.value && tempStagingUrl.value.trim()
  if (currentStepIndex.value === 1) return queriesCreated.value
  if (currentStepIndex.value === 2) return accessConfirmed.value
  return false
})

// Methods
function isStepCompleted(index: number) {
  if (index === 0) return urlConfirmed.value && tempStagingUrl.value.trim()
  if (index === 1) return queriesCreated.value
  if (index === 2) return accessConfirmed.value
  return false
}

function getStepClass(index: number) {
  if (isStepCompleted(index)) return 'bg-[rgb(var(--primary))] border-[rgb(var(--primary))] text-white'
  if (index === currentStepIndex.value) return 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
  return 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
}

function getStepTextClass(index: number) {
  if (isStepCompleted(index)) return 'text-[rgb(var(--primary))]'
  if (index === currentStepIndex.value) return 'text-[rgb(var(--primary))]'
  return 'text-[rgb(var(--text-muted))]'
}

function goToStep(index: number) {
  if (index < currentStepIndex.value) {
    currentStepIndex.value = index
  }
}

function nextStep() {
  if (canProceed.value && currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value++
  }
}

function previousStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

function handleUrlConfirmation(checked: boolean) {
  urlConfirmed.value = checked
  if (checked && tempStagingUrl.value.trim()) {
    // Save the URL and auto-advance to next step
    saveStagingUrlFromWizard()
    setTimeout(() => {
      nextStep()
    }, 500)
  }
}

function handleAccessConfirmation(checked: boolean) {
  accessConfirmed.value = checked
  if (checked) {
    // Auto-advance to step 2 after a short delay
    setTimeout(() => {
      nextStep()
    }, 500)
  }
}

function handleQueriesConfirmation(checked: boolean) {
  queriesCreated.value = checked
  if (checked) {
    // Auto-advance to next step after a short delay
    setTimeout(() => {
      nextStep()
    }, 500)
  }
}

async function complete() {
  console.log('🚀 Starting API sync completion process...')
  
  // Start sync process
  isSyncing.value = true
  syncError.value = null
  
  try {
    console.log('📡 Calling syncContentFromApi...')
    
    // Sync content from API
    await projectStore.syncContentFromApi((progress) => {
      console.log('📊 Progress update:', progress)
      syncProgress.value = progress
    })
    
    console.log('✅ Sync completed successfully!')
    
    // Mark API as configured
    await projectStore.updateApiConfigured(true)
    
    emit('complete')
    emit('close')
  } catch (error) {
    console.error('Sync failed:', error)
    syncError.value = error instanceof Error ? error.message : 'Unknown error occurred during sync'
    
    // Still mark API as configured but let user know sync failed
    await projectStore.updateApiConfigured(true)
  } finally {
    isSyncing.value = false
    syncProgress.value = null
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    // Could add toast notification here
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

async function openAnonymousRolePage() {
  if (!stagingUrl.value) return
  
  try {
    const anonymousRoleUrl = `${stagingUrl.value}/Admin/Roles/Edit/Anonymous`
    await invoke('open_url', { url: anonymousRoleUrl })
  } catch (error) {
    console.error('Failed to open ANONYMOUS Role page:', error)
  }
}

async function openQueryBuilder() {
  if (!stagingUrl.value) return
  
  try {
    const queryBuilderUrl = `${stagingUrl.value}/Admin/Queries/Create/Sql`
    await invoke('open_url', { url: queryBuilderUrl })
  } catch (error) {
    console.error('Failed to open Query Builder:', error)
  }
}

async function saveStagingUrlFromWizard() {
  if (!tempStagingUrl.value.trim()) return
  
  try {
    await projectStore.updateStagingUrl(tempStagingUrl.value.trim())
  } catch (error) {
    console.error('Failed to save staging URL:', error)
    alert('Failed to save staging URL. Please try again.')
  }
}

// Watch for staging URL changes to sync with modal
watch(() => stagingUrl.value, (newUrl) => {
  tempStagingUrl.value = newUrl || ''
})

onMounted(() => {
  tempStagingUrl.value = stagingUrl.value || ''
})
</script>