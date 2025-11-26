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
              <!-- Simple progress line -->
              <div v-if="index < steps.length - 1" class="flex-1 h-0.5 mt-5 mx-2"
                :class="index < currentStepIndex ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))]'"></div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Step Content with Carousel Cards -->
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
              content: step1AlertContent,
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
            @action="generateSubtypes"
          />

          <!-- Step 2 Card -->
          <StepCard
            title="Create Query"
            description="Create a custom SQL query in Orchard Core to retrieve all case subtype IDs."
            :step-index="1"
            :current-step-index="currentStepIndex"
            status="pending"
            :alert="{
              type: 'info',
              title: 'SQL Query Required',
              content: 'Create a custom SQL query in Orchard Core to retrieve all case subtype IDs.',
              link: stagingUrl ? {
                text: 'Open Query Builder',
                onClick: () => openQueryBuilder()
              } : undefined
            }"
            :show-checkbox="true"
            :checkbox-label="step2CheckboxLabel"
            :checkbox-checked="queryCreated"
            @checkbox-change="(checked) => handleQueryCreation(checked)"
          >
            <template #alertContent>
              <div class="space-y-4">
                <div>
                  <strong class="text-[rgb(var(--text))]">Query Name:</strong>
                  <div class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] p-3 rounded-lg mt-2 font-mono text-sm flex items-center justify-between">
                    <span class="text-[rgb(var(--text))]">GetAllCaseSubTypeIds</span>
                    <button @click="copyQueryName" class="ml-2 p-1.5 text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 rounded transition-colors">
                      <ClipboardIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <strong class="text-[rgb(var(--text))]">SQL Query:</strong>
                  <div class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] p-3 rounded-lg mt-2 font-mono text-sm relative">
                    <pre class="pr-12 text-[rgb(var(--text))]">SELECT ContentItemId, DisplayText
FROM ContentItemIndex
WHERE ContentType = 'CaseSubType'
AND Published = 1
AND Latest = 1</pre>
                    <button @click="copySqlQuery" class="absolute top-3 right-3 p-1.5 text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 rounded transition-colors">
                      <ClipboardIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </StepCard>
          
          <!-- Step 3 Card -->
          <StepCard
            title="Configure API Access"
            description="Configure the 'ANONYMOUS' role in Orchard Core to allow public access to the 'GetAllCaseSubTypeIds' query endpoint."
            :step-index="2"
            :current-step-index="currentStepIndex"
            status="pending"
            :alert="{
              type: 'warning',
              title: 'Manual Step Required',
              content: step3AlertContent,
              link: stagingUrl ? {
                text: 'Open Citizen Role Settings',
                onClick: () => openCitizenRolePage()
              } : undefined
            }"
            :show-checkbox="true"
            :checkbox-label="step3CheckboxLabel"
            :checkbox-checked="accessConfirmed"
            @checkbox-change="(checked) => handleAccessConfirmation(checked)"
          />
          
          <!-- Step 4 Card -->
          <StepCard
            title="Query Subtype IDs"
            description="Query Orchard Core API to fetch the IDs of the newly created case subtypes."
            :step-index="3"
            :current-step-index="currentStepIndex"
            :status="step4Status === 'querying' ? 'querying' : step4Status"
            :alert="{
              type: 'info',
              content: step4AlertContent
            }"
            :success-details="step4Status === 'success' ? {
              title: 'Retrieved Subtype IDs',
              items: retrievedSubtypes.map(subtype => ({
                label: subtype.DisplayText || subtype.name,
                value: subtype.ContentItemId || subtype.id
              }))
            } : undefined"
            :error="step4Error"
            action-label="Query Subtype IDs"
            :is-generating="isQuerying"
            @action="querySubtypeIds"
          />
          
          <!-- Step 5 Card -->
          <StepCard
            title="Generate Case Types"
            description="Finally, we'll generate the Orchard Core recipe for case types using the retrieved subtype IDs."
            :step-index="4"
            :current-step-index="currentStepIndex"
            :status="step5Status === 'generating' ? 'generating' : step5Status"
            :alert="{
              type: 'info',
              content: step5AlertContent
            }"
            :success-details="step5Status === 'success' ? {
              title: 'Export Completed Successfully',
              items: [
                { label: 'File Path', value: caseTypeFilePath }
              ]
            } : undefined"
            action-label="Generate Case Types"
            :is-generating="isGeneratingCaseTypes"
            :error="step5Error"
            @action="generateCaseTypes"
          />
        </div>
      </div>

      <!-- Toast Notification -->
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
import { generateCaseSubtypeRecipe, queryCaseSubtypeIdsFromAPI, generateCaseTypeRecipeWithIds } from '@/utils/caseExportUtils'
import { invoke } from '@tauri-apps/api/core'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import StepCard from '@/components/StepCard.vue'
import Toast from '@/components/Toast.vue'

// Heroicons
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClipboardIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const projectStore = useProjectStore()

const stagingUrl = computed(() => projectStore.stagingUrl)

// Toast state
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('info')
const showToast = ref(false)
let toastTimeout: NodeJS.Timeout | null = null

// Centralized toast function
function showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) {
  // Clear existing timeout
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
  
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  // Auto-dismiss after specified duration
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, duration)
}

// Steps configuration
const steps = [
  { id: 'subtypes', title: 'Generate Case Subtypes' },
  { id: 'createQuery', title: 'Create Query' },
  { id: 'access', title: 'Allow Citizen Access' },
  { id: 'queryIds', title: 'Query Subtype IDs' },
  { id: 'caseTypes', title: 'Generate Case Types' }
]

const currentStepIndex = ref(0)

// Step 1: Generate Subtypes
const step1Status = ref<'pending' | 'generating' | 'success' | 'error'>('pending')
const step1Error = ref('')
const subtypeFilePath = ref('')
const isGenerating = ref(false)

// Step 2: Create Query
const queryCreated = ref(false)

// Step 3: Access Confirmation
const accessConfirmed = ref(false)

// Step 4: Query IDs
const step4Status = ref<'pending' | 'querying' | 'success' | 'error'>('pending')
const step4Error = ref('')
const subtypeIds = ref<Array<{ name: string; id: string; DisplayText?: string; ContentItemId?: string }>>([])
const isQuerying = ref(false)

// Step 5: Generate Case Types
const step5Status = ref<'pending' | 'generating' | 'success' | 'error'>('pending')
const step5Error = ref('')
const caseTypeFilePath = ref('')
const isGeneratingCaseTypes = ref(false)

const retrievedSubtypes = computed(() => subtypeIds.value)

// Alert content computed properties
const step1AlertContent = computed(() => {
  const projectPath = projectStore.current?.path || 'your project'
  const importFilesPath = `${projectPath}/Import Files`
  return `This step will create a <code class="bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] px-1 rounded">CaseSubTypes.json</code> file in your project's Import Files directory.<br><br><strong>Directory:</strong> <code class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] px-1 rounded text-xs">${importFilesPath}</code>`
})

const step3AlertContent = computed(() => {
  const baseUrl = projectStore.current?.stagingUrl?.replace(/\/$/, '') || 'your staging site'
  return `Please follow these steps in Orchard Core:<ol class="list-decimal list-inside space-y-1"><li>Navigate to <strong>Security</strong> → <strong>Roles</strong></li><li>Find and select the <strong>ANONYMOUS</strong> role</li><li>Go to <strong>Permissions</strong> tab</li><li>Find and enable <strong>Execute API</strong> permission for <strong>GetAllCaseSubTypeIds</strong></li><li>Save changes</li></ol><br><p><strong>Your staging site:</strong> <code class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] px-1 rounded text-xs">${baseUrl}</code></p>`
})

const step4AlertContent = computed(() => {
  const baseUrl = projectStore.current?.stagingUrl?.replace(/\/$/, '') || 'your staging site'
  return `Querying <code class="bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] px-1 rounded">${baseUrl}/api/queries/GetAllCaseSubTypeIds</code> to retrieve the ContentItem IDs for all case subtypes.<br><br><strong>Note:</strong> This request bypasses browser CORS restrictions using the Tauri backend.`
})

const step5AlertContent = computed(() => 
  'This step will create a <code class="bg-[rgb(var(--success))]/10 text-[rgb(var(--success))] px-1 rounded">CaseTypes.json</code> file with proper subtype ID references.'
)

const step2CheckboxLabel = computed(() => 
  'I have created the SQL query in Orchard Core'
)

const step3CheckboxLabel = computed(() => 
  'I have enabled citizen access to "GetAllCaseSubTypeIds"'
)



// Navigation methods
function goToStep(index: number) {
  if (index < currentStepIndex.value) {
    currentStepIndex.value = index
  }
}

function handleQueryCreation(checked: boolean) {
  queryCreated.value = checked
  if (checked) {
    // Auto-advance to step 3 after a short delay
    setTimeout(() => {
      nextStep()
    }, 500)
  }
}

function handleAccessConfirmation(checked: boolean) {
  accessConfirmed.value = checked
  if (checked) {
    // Auto-advance to step 4 after a short delay
    setTimeout(() => {
      nextStep()
      // Automatically start querying when step 4 becomes active
      setTimeout(() => {
        querySubtypeIds()
      }, 500)
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
      await invoke('open_directory', { 
        path: projectStore.current.path
      })
    } catch (error) {
      console.error('Failed to open directory:', error)
    }
  }
}



async function openCitizenRolePage() {
  if (!stagingUrl.value) return
  
  try {
    const citizenRoleUrl = `${stagingUrl.value}/Admin/Roles/Edit/Citizen`
    await invoke('open_url', { url: citizenRoleUrl })
  } catch (error) {
    console.error('Failed to open Citizen Role page:', error)
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

// Step completion checks
function isStepCompleted(index: number) {
  if (index === 0) return step1Status.value === 'success'
  if (index === 1) return queryCreated.value
  if (index === 2) return accessConfirmed.value
  if (index === 3) return step4Status.value === 'success'
  if (index === 4) return step5Status.value === 'success'
  return false
}

// Copy functions
async function copyQueryName() {
  try {
    await navigator.clipboard.writeText('GetAllCaseSubTypeIds')
    showToastMessage('Query name copied to clipboard!', 'success')
  } catch (error) {
    console.error('Failed to copy query name:', error)
    showToastMessage('Failed to copy query name', 'error')
  }
}

async function copySqlQuery() {
  try {
    const sqlQuery = `SELECT ContentItemId, DisplayText
FROM ContentItemIndex
WHERE ContentType = 'CaseSubType'
AND Published = 1
AND Latest = 1`
    await navigator.clipboard.writeText(sqlQuery)
    showToastMessage('SQL query copied to clipboard!', 'success')
  } catch (error) {
    console.error('Failed to copy SQL query:', error)
    showToastMessage('Failed to copy SQL query', 'error')
  }
}

function getStepClass(index: number) {
  if (isStepCompleted(index)) {
    return 'bg-[rgb(var(--primary))] border-[rgb(var(--primary))] text-white'
  }
  if (index === currentStepIndex.value) {
    return 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
  }
  return 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
}

function getStepTextClass(index: number) {
  if (isStepCompleted(index)) {
    return 'text-[rgb(var(--primary))]'
  }
  if (index === currentStepIndex.value) {
    return 'text-[rgb(var(--primary))]'
  }
  return 'text-[rgb(var(--text-muted))]'
}

const canProceed = computed(() => {
  if (currentStepIndex.value === 0) return step1Status.value === 'success'
  if (currentStepIndex.value === 1) return queryCreated.value
  if (currentStepIndex.value === 2) return accessConfirmed.value
  if (currentStepIndex.value === 3) return step4Status.value === 'success'
  if (currentStepIndex.value === 4) return step5Status.value === 'success'
  return false
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
      subtypeFilePath.value = `${projectStore.current.path}/Import Files/CaseSubTypes.json`
      // Auto-advance to next step after successful generation
      setTimeout(() => {
        nextStep()
      }, 500)
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
  console.log('querySubtypeIds: Starting query')
  isQuerying.value = true
  step4Status.value = 'querying'

  try {
    console.log('querySubtypeIds: Calling queryCaseSubtypeIdsFromAPI')
    const result = await queryCaseSubtypeIdsFromAPI()
    console.log('querySubtypeIds: Result:', result)

    if (result.success && result.data) {
      console.log('querySubtypeIds: Success, data:', result.data)
      step4Status.value = 'success'
      subtypeIds.value = result.data
      // Auto-advance to next step after successful query
      setTimeout(() => {
        nextStep()
      }, 3000) // 3 second delay to let users see the retrieved data
    } else {
      console.log('querySubtypeIds: Error:', result.error)
      step4Status.value = 'error'
      step4Error.value = result.error || 'Failed to query subtype IDs'
    }
  } catch (error) {
    console.log('querySubtypeIds: Exception:', error)
    step4Status.value = 'error'
    step4Error.value = (error as Error).message
  } finally {
    console.log('querySubtypeIds: Finished, isQuerying:', isQuerying.value)
    isQuerying.value = false
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
      subtypeIds.value
    )

    if (result.success) {
      step5Status.value = 'success'
      caseTypeFilePath.value = `${projectStore.current.path}/Import Files/CaseTypes.json`
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
