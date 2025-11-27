<template>
  <div class="min-h-screen bg-bg text-[rgb(var(--text))]">
    <!-- Header -->
    <header class="bg-surface border-b border-base shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-7">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="flex-1">
            <!-- Back button -->
            <nav class="text-sm mb-3">
              <button @click="router.push('/case-workflows')"
                class="inline-flex items-center gap-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] transition-colors">
                <ArrowLeftIcon class="w-4 h-4" />
                Back to Case Workflows
              </button>
            </nav>

            <h1 class="text-3xl font-bold">Case Export Wizard</h1>
            <p class="text-lg text-[rgb(var(--text-muted))] mt-1">
              Export case types and subtypes to Orchard Core recipe format
            </p>
          </div>

          <div class="flex items-center gap-5">
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-10">
      <!-- Progress Steps -->
      <div class="mb-10">
        <nav aria-label="Progress">
          <ol class="flex items-center justify-between">
            <li v-for="(step, index) in steps" :key="step.id" class="flex items-center">
              <div class="flex items-center"
                :class="{ 'cursor-pointer hover:opacity-80': index < currentStepIndex, 'cursor-not-allowed opacity-50': index > currentStepIndex }"
                @click="index < currentStepIndex && goToStep(index)">
                <div class="flex items-center">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium"
                    :class="getStepClass(index)">
                    <CheckIcon v-if="isStepCompleted(index)" class="h-6 w-6" />
                    <span v-else>{{ index + 1 }}</span>
                  </div>
                  <span class="ml-3 text-sm font-medium"
                    :class="getStepTextClass(index)">{{ step.title }}</span>
                </div>
              </div>
              <div v-if="index < steps.length - 1" class="flex-1 h-0.5 mt-5 mx-2"
                :class="index < currentStepIndex ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))]'"></div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Carousel Cards -->
      <div class="relative h-[600px] overflow-hidden rounded-2xl">
        <div class="relative w-full h-full">
          <!-- Step 1 Card -->
          <StepCard
            title="Generate Case Subtypes"
            description="First, we'll generate the Orchard Core recipe for case subtypes. This will create a JSON file with all your case subtypes."
            :step-index="0"
            :current-step-index="currentStepIndex"
            :status="step1Status === 'generating' ? 'generating' : step1Status"
            :alert="{
              type: 'info',
              title: 'File Generation',
              content: 'This step will create a JSON file in your Import Files directory.',
              link: {
                text: 'Open Import Files directory',
                onClick: () => openProjectDirectory()
              }
            }"
            :success-details="step1Status === 'success' ? {
              title: 'File Generated Successfully',
              items: [
                { 
                  label: 'File Path', 
                  value: subtypeFilePath,
                  isLink: true,
                  onClick: () => openProjectDirectory()
}
              ]
            } : undefined"
            action-label="Generate Case Subtypes"
            :is-generating="isGenerating"
            :error="step1Error"
            :show-checkbox="step1Status === 'success'"
            :checkbox-label="step0CheckboxLabel"
            :checkbox-checked="subtypesImported"
            @checkbox-change="(checked) => handleSubtypesImportConfirmation(checked)"
            @action="generateSubtypes"
          >
            <template #alertContent>
              <div class="space-y-3">
                <p>This step will create a <code class="bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] px-1 rounded">CaseSubTypes.json</code> file in your project's Import Files directory.</p>
                <div class="flex flex-col gap-2">
                   <div>
                     <strong>Directory:</strong> 
                     <code class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] px-1 rounded text-xs">{{ importFilesPath }}</code>
                   </div>
                   <div>
                     <strong>Import Page:</strong> 
                     <button 
                       type="button" 
                       @click="openOrchardImportPage" 
                       class="text-[rgb(var(--primary))] hover:underline cursor-pointer bg-transparent border-none p-0 text-sm text-left"
                     >
                       {{ projectStore.current?.stagingUrl?.replace(/\/$/, '') || 'your staging site' }}/Admin/DeploymentPlan/Import/Index?
                     </button>
                   </div>
                </div>
              </div>
            </template>
          </StepCard>



          <!-- Step 2 Card -->
          <StepCard
            title="Generate Case Statuses"
            description="Generate the Orchard Core recipe for custom case statuses. Default Orchard Core statuses will be skipped."
            :step-index="1"
            :current-step-index="currentStepIndex"
            :status="step2Status === 'generating' ? 'generating' : step2Status"
            :alert="{
              type: 'info',
              title: 'File Generation',
              content: 'This step will create a JSON file in your Import Files directory.',
              link: {
                text: 'Open Import Files directory',
                onClick: () => openProjectDirectory()
              }
            }"
            :success-details="step2Status === 'success' ? {
              title: 'File Generated Successfully',
              items: [
                { 
                  label: 'File Path', 
                  value: statusFilePath,
                  isLink: true,
                  onClick: () => openProjectDirectory()
                }
              ]
            } : undefined"
            action-label="Generate Case Statuses"
            :is-generating="isGeneratingStatuses"
            :error="step2Error"
            :show-checkbox="step2Status === 'success'"
            :checkbox-label="step1CheckboxLabel"
            :checkbox-checked="statusesImportedStep1"
            @checkbox-change="(checked) => handleStatusesImportConfirmationStep1(checked)"
            @action="generateStatuses"
          >
            <template #alertContent>
              <div class="space-y-3">
                <p>This step will create a <code class="bg-[rgb(var(--success))]/10 text-[rgb(var(--success))] px-1 rounded">CaseStatuses.json</code> file in your project's Import Files directory.</p>
                <div class="flex flex-col gap-2">
                  <div>
                    <strong>Directory:</strong> 
                    <code class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] px-1 rounded text-xs">{{ importFilesPath }}</code>
                  </div>
                  <div>
                    <strong>Import Page:</strong> 
                    <button 
                      type="button" 
                      @click="openOrchardImportPage" 
                      class="text-[rgb(var(--primary))] hover:underline cursor-pointer bg-transparent border-none p-0 text-sm text-left"
                    >
                      {{ projectStore.current?.stagingUrl?.replace(/\/$/, '') || 'your staging site' }}/Admin/DeploymentPlan/Import/Index?
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </StepCard>

          <!-- Step 3 Card -->
          <StepCard
            title="Query Subtype IDs"
            description="Query Orchard Core API to fetch the IDs of the newly created case subtypes."
            :step-index="2"
            :current-step-index="currentStepIndex"
            :status="step3Status === 'querying' ? 'querying' : step3Status"
            :alert="{
              type: 'info',
              content: step3AlertContent
            }"
            :success-details="step3Status === 'success' ? {
              title: 'Retrieved Subtype IDs',
              items: retrievedSubtypes.map(subtype => ({
                label: subtype.DisplayText || subtype.name || '',
                value: subtype.ContentItemId || subtype.id || ''
              }))
            } : undefined"
            :error="step3Error"
            action-label="Query Subtype IDs"
            :is-generating="isQuerying"
            @action="querySubtypeIds"
          />
          
          <!-- Step 4 Card -->
          <StepCard
            title="Query Status IDs"
            description="Query Orchard Core API to fetch the IDs of the newly created case statuses."
            :step-index="3"
            :current-step-index="currentStepIndex"
            :status="step4Status === 'querying' ? 'querying' : step4Status"
            :alert="{
              type: 'info',
              content: step4AlertContent
            }"
            :success-details="step4Status === 'success' ? {
              title: 'Retrieved Status IDs',
              items: retrievedStatuses.map(status => ({
                label: status.DisplayText || status.name || '',
                value: status.ContentItemId || status.id || ''
              }))
            } : undefined"
            :error="step4Error"
            action-label="Query Status IDs"
            :is-generating="isQueryingStatuses"
            @action="queryStatusIds"
          />
          
          <!-- Step 5 Card -->
          <StepCard
            title="Generate Case Types"
            description="Finally, we'll generate the Orchard Core recipe for case types using the retrieved subtype and status IDs."
            :step-index="4"
            :current-step-index="currentStepIndex"
            :status="step5Status === 'generating' ? 'generating' : step5Status"
            :alert="{
              type: 'info',
              title: 'Final File Generation',
              content: 'This step will create the final CaseTypes.json file with proper ID references.',
              link: {
                text: 'Open Import Files directory',
                onClick: () => openProjectDirectory()
              }
            }"
            :success-details="step5Status === 'success' ? {
              title: 'Export Completed Successfully',
              items: [
                { 
                  label: 'File Path', 
                  value: caseTypeFilePath,
                  isLink: true,
                  onClick: () => openProjectDirectory()
                }
              ]
            } : undefined"
            :error="step5Error"
            @action="generateCaseTypes"
          >
            <template #alertContent>
              <div class="space-y-3">
                <p>This step will create a <code class="bg-[rgb(var(--success))]/10 text-[rgb(var(--success))] px-1 rounded">CaseTypes.json</code> file with proper subtype and status ID references.</p>
                <div class="flex flex-col gap-2">
                  <div>
                    <strong>Directory:</strong> 
                    <code class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] px-1 rounded text-xs">{{ importFilesPath }}</code>
                  </div>
                  <div>
                    <strong>Import Page:</strong> 
                    <button 
                      type="button" 
                      @click="openOrchardImportPage" 
                      class="text-[rgb(var(--primary))] hover:underline cursor-pointer bg-transparent border-none p-0 text-sm text-left"
                    >
                      {{ projectStore.current?.stagingUrl?.replace(/\/$/, '') || 'your staging site' }}/Admin/DeploymentPlan/Import/Index?
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </StepCard>
        </div>
      </div>

      <!-- Alert Notification -->
      <Toast 
        v-if="showToast"
        :message="toastMessage" 
        :type="toastType" 
        @close="showToast = false" 
      />

      <!-- Navigation Buttons -->
      <div class="mt-8 flex justify-between">
        <button @click="previousStep" :disabled="currentStepIndex === 0"
          class="inline-flex items-center px-4 py-2 border border-[rgb(var(--border))] text-sm font-medium rounded-md text-[rgb(var(--text))] bg-[rgb(var(--surface))] hover:bg-[rgb(var(--elevated))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <ArrowLeftIcon class="mr-2 h-4 w-4" />
          Previous
        </button>

        <button v-if="currentStepIndex < steps.length - 1" @click="nextStep" :disabled="!canProceed"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-hover))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Next
          <ArrowRightIcon class="ml-2 h-4 w-4" />
        </button>

        <button v-else @click="goToDashboard"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(var(--success))] hover:bg-[rgb(var(--success))]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--success))] transition-colors">
          <CheckIcon class="mr-2 h-4 w-4" />
          Complete
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { generateCaseSubtypeRecipe, generateCaseStatusRecipe, queryCaseSubtypeIdsFromAPI, queryCaseStatusIdsFromAPI, generateCaseTypeRecipeWithIds } from '@/utils/caseExportUtils'
import { invoke } from '@tauri-apps/api/core'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import StepCard from '@/components/StepCard.vue'
import Toast from '@/components/Toast.vue'

// Heroicons
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const projectStore = useProjectStore()

const stagingUrl = computed(() => projectStore.stagingUrl)

// Notification state
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('info')
const showToast = ref(false)
let toastTimeout: NodeJS.Timeout | null = null

function showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) {
  if (toastTimeout) clearTimeout(toastTimeout)
  
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, duration)
}

// Steps array so we can show what step we're on
const steps = [
  { id: 'subtypes', title: 'Generate Case Subtypes' },
  { id: 'statuses', title: 'Generate Case Statuses' },
  { id: 'querySubtypeIds', title: 'Query Subtype IDs' },
  { id: 'queryStatusIds', title: 'Query Status IDs' },
  { id: 'caseTypes', title: 'Generate Case Types' }
]

const currentStepIndex = ref(0)

// Step 1: Generate Subtypes
const step1Status = ref<'pending' | 'generating' | 'success' | 'error'>('pending')
const step1Error = ref('')
const subtypeFilePath = ref('')
const isGenerating = ref(false)

// Step 2: Generate Statuses
const step2Status = ref<'pending' | 'generating' | 'success' | 'error'>('pending')
const step2Error = ref('')
const statusFilePath = ref('')
const isGeneratingStatuses = ref(false)

// Step 1.5: Import Subtypes Confirmation
const subtypesImported = ref(false)

// Step 1: Import Statuses Confirmation  
const statusesImportedStep1 = ref(false)

// Step 3: Query Subtype IDs
const step3Status = ref<'pending' | 'querying' | 'success' | 'error'>('pending')
const step3Error = ref('')
const subtypeIds = ref<Array<{ name?: string; id?: string; DisplayText?: string; ContentItemId?: string }>>([])
const isQuerying = ref(false)

// Step 4: Query Status IDs
const step4Status = ref<'pending' | 'querying' | 'success' | 'error'>('pending')
const step4Error = ref('')
const statusIds = ref<Array<{ name?: string; id?: string; DisplayText?: string; ContentItemId?: string }>>([])
const isQueryingStatuses = ref(false)

// Step 5: Generate Case Types
const step5Status = ref<'pending' | 'generating' | 'success' | 'error'>('pending')
const step5Error = ref('')
const caseTypeFilePath = ref('')
const isGeneratingCaseTypes = ref(false)

const retrievedSubtypes = computed(() => subtypeIds.value)
const retrievedStatuses = computed(() => statusIds.value)

// Directory paths for display
const importFilesPath = computed(() => 
  `${projectStore.current?.path || 'your project'}\\Import Files`
)

const step3AlertContent = computed(() => {
  const baseUrl = projectStore.current?.stagingUrl?.replace(/\/$/, '') || 'your staging site'
  return `Querying <code class="bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] px-1 rounded">${baseUrl}/api/queries/GetAllCaseSubTypeIds</code> to retrieve the ContentItem IDs for all case subtypes.<br><br><strong>Note:</strong> This request bypasses browser CORS restrictions using the Tauri backend.`
})

const step4AlertContent = computed(() => {
  const baseUrl = projectStore.current?.stagingUrl?.replace(/\/$/, '') || 'your staging site'
  return `Querying <code class="bg-[rgb(var(--success))]/10 text-[rgb(var(--success))] px-1 rounded">${baseUrl}/api/queries/GetAllCaseStatusIds</code> to retrieve the ContentItem IDs for all case statuses.<br><br><strong>Note:</strong> This request bypasses browser CORS restrictions using the Tauri backend.`
})



const step0CheckboxLabel = computed(() => 
  'I have imported the "CaseSubTypes.json" file into Orchard Core'
)

const step1CheckboxLabel = computed(() => 
  'I have imported the "CaseStatuses.json" file into Orchard Core'
)



function goToStep(index: number) {
  if (index < currentStepIndex.value) {
    currentStepIndex.value = index
  }
}

// Step 2: Generate Statuses
async function generateStatuses() {
  if (!projectStore.current) {
    step2Status.value = 'error'
    step2Error.value = 'No project selected'
    return
  }

  isGeneratingStatuses.value = true
  step2Status.value = 'generating'

  try {
    const result = await generateCaseStatusRecipe(
      projectStore.current.data.name,
      'Case Export Wizard'
    )

    if (result.success) {
      step2Status.value = 'success'
      statusFilePath.value = `${projectStore.current.path}\\Import Files\\CaseStatuses.json`
      // Don't auto-advance - wait for user to confirm import
    } else {
      step2Status.value = 'error'
      step2Error.value = result.error || 'Unknown error'
    }
  } catch (error) {
    step2Status.value = 'error'
    step2Error.value = (error as Error).message
  } finally {
    isGeneratingStatuses.value = false
  }
}

function handleSubtypesImportConfirmation(checked: boolean) {
  subtypesImported.value = checked
  if (checked) {
    // Auto-advance to next step after a short delay
    setTimeout(() => {
      nextStep()
    }, 500)
  }
}

function handleStatusesImportConfirmationStep1(checked: boolean) {
  statusesImportedStep1.value = checked
  if (checked) {
    // Auto-advance to next step after a short delay
    setTimeout(() => {
      nextStep()
    }, 500)
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

function goToDashboard() {
  router.push('/dashboard')
}

async function openProjectDirectory() {
  if (projectStore.current) {
    try {
      const importFilesPath = `${projectStore.current.path}\\Import Files`
      await invoke('open_directory', { 
        path: importFilesPath
      })
    } catch (error) {
      console.error('Failed to open directory:', error)
    }
  }
}





async function openOrchardImportPage() {
  if (!stagingUrl.value) return
  
  try {
    const importUrl = `${stagingUrl.value}/Admin/DeploymentPlan/Import/Index?`
    await invoke('open_url', { url: importUrl })
  } catch (error) {
    console.error('Failed to open Orchard Core Import page:', error)
  }
}



// Step completion checks
function isStepCompleted(index: number) {
  const stepChecks = [
    () => step1Status.value === 'success' && subtypesImported.value,
    () => step2Status.value === 'success' && statusesImportedStep1.value,
    () => step3Status.value === 'success',
    () => step4Status.value === 'success',
    () => step5Status.value === 'success'
  ]
  return stepChecks[index]?.() || false
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

const canProceed = computed(() => {
  const proceedChecks = [
    () => step1Status.value === 'success' && subtypesImported.value,
    () => step2Status.value === 'success' && statusesImportedStep1.value,
    () => step3Status.value === 'success',
    () => step4Status.value === 'success',
    () => step5Status.value === 'success'
  ]
  return proceedChecks[currentStepIndex.value]?.() || false
})

// Step actions
async function generateSubtypes() {
  if (!projectStore.current) {
    step1Status.value = 'error'
    step1Error.value = 'No project selected'
    return
  }

  isGenerating.value = true
  step1Status.value = 'generating'

  try {
    const result = await generateCaseSubtypeRecipe(
      projectStore.current.data.name,
      'Case Export Wizard'
    )

    if (result.success) {
      step1Status.value = 'success'
      subtypeFilePath.value = `${projectStore.current.path}\\Import Files\\CaseSubTypes.json`
      // Don't auto-advance - wait for user to confirm import
    } else {
      step1Status.value = 'error'
      step1Error.value = result.error || 'Unknown error'
    }
  } catch (error) {
    step1Status.value = 'error'
    step1Error.value = (error as Error).message
  } finally {
    isGenerating.value = false
  }
}

async function querySubtypeIds() {
  isQuerying.value = true
  step3Status.value = 'querying'

  try {
    const result = await queryCaseSubtypeIdsFromAPI()

    if (result.success && result.data) {
      step3Status.value = 'success'
      subtypeIds.value = result.data
      // Auto-advance to next step after successful query
      setTimeout(() => {
        nextStep()
        // Automatically start querying status IDs when step 3 becomes active
        setTimeout(() => {
          queryStatusIds()
        }, 500)
      }, 3000) // 3 second delay to let users see the retrieved data
    } else {
      step3Status.value = 'error'
      step3Error.value = result.error || 'Failed to query subtype IDs'
    }
  } catch (error) {
    step3Status.value = 'error'
    step3Error.value = (error as Error).message
  } finally {
    isQuerying.value = false
  }
}





async function queryStatusIds() {
  isQueryingStatuses.value = true
  step4Status.value = 'querying'

  try {
    const result = await queryCaseStatusIdsFromAPI()

    if (result.success && result.data) {
      step4Status.value = 'success'
      statusIds.value = result.data
      // Auto-advance to next step after successful query
      setTimeout(() => {
        nextStep()
      }, 3000) // 3 second delay to let users see the retrieved data
    } else {
      step4Status.value = 'error'
      step4Error.value = result.error || 'Failed to query status IDs'
    }
  } catch (error) {
    step4Status.value = 'error'
    step4Error.value = (error as Error).message
  } finally {
    isQueryingStatuses.value = false
  }
}

async function generateCaseTypes() {
  if (!projectStore.current) {
    step5Status.value = 'error'
    step5Error.value = 'No project selected'
    return
  }

  isGeneratingCaseTypes.value = true
  step5Status.value = 'generating'

  try {
    const result = await generateCaseTypeRecipeWithIds(
      projectStore.current.data.name,
      'Case Export Wizard',
      subtypeIds.value,
      statusIds.value
    )

    if (result.success) {
      step5Status.value = 'success'
      caseTypeFilePath.value = `${projectStore.current.path}\\Import Files\\CaseTypes.json`
      // Auto-advance to completion after successful generation
      setTimeout(() => {
        nextStep()
      }, 500)
    } else {
      step5Status.value = 'error'
      step5Error.value = result.error || 'Unknown error'
    }
  } catch (error) {
    const errorMessage = (error as Error).message
    step5Status.value = 'error'
    step5Error.value = errorMessage
    showToastMessage(errorMessage, 'error', 5000) // Show for 5 seconds
  } finally {
    isGeneratingCaseTypes.value = false
  }
}

onMounted(async () => {
  await projectStore.scanProjects()
  if (!projectStore.current) {
    router.replace('/')
  }
})

onUnmounted(() => {
  // Clean up toast timeout when component unmounts
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
})
</script>
