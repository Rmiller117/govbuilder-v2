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
                    <code class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] px-1 rounded text-xs">{{ importFilesPathStatuses }}</code>
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
            title="Create Subtype Query"
            description="Create a custom SQL query in Orchard Core to retrieve all case subtype IDs."
            :step-index="2"
            :current-step-index="currentStepIndex"
            status="pending"
            :alert="{
              type: 'info',
              title: 'SQL Query Required',
              content: step3AlertContent,
              link: stagingUrl ? {
                text: 'Open Query Builder',
                onClick: () => openQueryBuilder()
              } : undefined
            }"
            :show-checkbox="true"
            :checkbox-label="step3CheckboxLabel"
            :checkbox-checked="querySubtypeCreated"
            @checkbox-change="(checked) => handleSubtypeQueryCreation(checked)"
          >
            <template #alertContent>
              <div class="space-y-4">
                <div>
                  <strong class="text-[rgb(var(--text))]">Query Name:</strong>
                  <div class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] p-3 rounded-lg mt-2 font-mono text-sm flex items-center justify-between">
                    <span class="text-[rgb(var(--text))]">GetAllCaseSubTypeIds</span>
                    <button @click="copySubtypeQueryName" class="ml-2 p-1.5 text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 rounded transition-colors">
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
                    <button @click="copySubtypeSqlQuery" class="absolute top-3 right-3 p-1.5 text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 rounded transition-colors">
                      <ClipboardIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </StepCard>

          <!-- Step 4 Card -->
          <StepCard
            title="Create Status Query"
            description="Create a custom SQL query in Orchard Core to retrieve all case status IDs."
            :step-index="3"
            :current-step-index="currentStepIndex"
            status="pending"
            :alert="{
              type: 'info',
              title: 'SQL Query Required',
              content: step4AlertContent,
              link: stagingUrl ? {
                text: 'Open Query Builder',
                onClick: () => openQueryBuilder()
              } : undefined
            }"
            :show-checkbox="true"
            :checkbox-label="step4CheckboxLabel"
            :checkbox-checked="queryStatusCreated"
            @checkbox-change="(checked) => handleStatusQueryCreation(checked)"
          >
            <template #alertContent>
              <div class="space-y-4">
                <div>
                  <strong class="text-[rgb(var(--text))]">Query Name:</strong>
                  <div class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] p-3 rounded-lg mt-2 font-mono text-sm flex items-center justify-between">
                    <span class="text-[rgb(var(--text))]">GetAllCaseStatusIds</span>
                    <button @click="copyStatusQueryName" class="ml-2 p-1.5 text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 rounded transition-colors">
                      <ClipboardIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <strong class="text-[rgb(var(--text))]">SQL Query:</strong>
                  <div class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] p-3 rounded-lg mt-2 font-mono text-sm relative">
                    <pre class="pr-12 text-[rgb(var(--text))]">SELECT ContentItemId, DisplayText
FROM ContentItemIndex
WHERE ContentType = 'CaseStatus'
AND Published = 1
AND Latest = 1</pre>
                    <button @click="copyStatusSqlQuery" class="absolute top-3 right-3 p-1.5 text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 rounded transition-colors">
                      <ClipboardIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </StepCard>
          
          <!-- Step 5 Card -->
          <StepCard
            title="Configure API Access"
            description="Configure the 'ANONYMOUS' role in Orchard Core to allow public access to both query endpoints."
            :step-index="4"
            :current-step-index="currentStepIndex"
            status="pending"
            :alert="{
              type: 'warning',
              title: 'Manual Step Required',
              content: step5AlertContent,
              link: stagingUrl ? {
                text: 'Open ANONYMOUS Role Settings',
                onClick: () => openAnonymousRolePage()
              } : undefined
            }"
            :show-checkbox="true"
            :checkbox-label="step5CheckboxLabel"
            :checkbox-checked="accessConfirmed"
            @checkbox-change="(checked) => handleAccessConfirmation(checked)"
          />
          
          <!-- Step 6 Card -->
          <StepCard
            title="Query Subtype IDs"
            description="Query Orchard Core API to fetch the IDs of the newly created case subtypes."
            :step-index="5"
            :current-step-index="currentStepIndex"
            :status="step6Status === 'querying' ? 'querying' : step6Status"
            :alert="{
              type: 'info',
              content: step6AlertContent
            }"
            :success-details="step6Status === 'success' ? {
              title: 'Retrieved Subtype IDs',
              items: retrievedSubtypes.map(subtype => ({
                label: subtype.DisplayText || subtype.name || '',
                value: subtype.ContentItemId || subtype.id || ''
              }))
            } : undefined"
            :error="step6Error"
            action-label="Query Subtype IDs"
            :is-generating="isQuerying"
            @action="querySubtypeIds"
          />
          
          <!-- Step 7 Card -->
          <StepCard
            title="Query Status IDs"
            description="Query Orchard Core API to fetch the IDs of the newly created case statuses."
            :step-index="6"
            :current-step-index="currentStepIndex"
            :status="step7Status === 'querying' ? 'querying' : step7Status"
            :alert="{
              type: 'info',
              content: step7AlertContent
            }"
            :success-details="step7Status === 'success' ? {
              title: 'Retrieved Status IDs',
              items: retrievedStatuses.map(status => ({
                label: status.DisplayText || status.name || '',
                value: status.ContentItemId || status.id || ''
              }))
            } : undefined"
            :error="step7Error"
            action-label="Query Status IDs"
            :is-generating="isQueryingStatuses"
            @action="queryStatusIds"
          />
          
          <!-- Step 8 Card -->
          <StepCard
            title="Generate Case Types"
            description="Finally, we'll generate the Orchard Core recipe for case types using the retrieved subtype and status IDs."
            :step-index="7"
            :current-step-index="currentStepIndex"
            :status="step8Status === 'generating' ? 'generating' : step8Status"
            :alert="{
              type: 'info',
              title: 'Final File Generation',
              content: 'This step will create the final CaseTypes.json file with proper ID references.',
              link: {
                text: 'Open Import Files directory',
                onClick: () => openProjectDirectory()
              }
            }"
            :success-details="step8Status === 'success' ? {
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
            action-label="Generate Case Types"
            :is-generating="isGeneratingCaseTypes"
            :error="step8Error"
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
import { generateCaseSubtypeRecipe, generateCaseStatusRecipe, queryCaseSubtypeIdsFromAPI, queryCaseStatusIdsFromAPI, generateCaseTypeRecipeWithIds } from '@/utils/caseExportUtils'
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
  { id: 'statuses', title: 'Generate Case Statuses' },
  { id: 'createSubtypeQuery', title: 'Create Subtype Query' },
  { id: 'createStatusQuery', title: 'Create Status Query' },
  { id: 'access', title: 'Allow ANONYMOUS Access' },
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

// Step 3: Create Subtype Query
const querySubtypeCreated = ref(false)

// Step 4: Create Status Query
const queryStatusCreated = ref(false)

// Step 5: Access Confirmation
const accessConfirmed = ref(false)

// Step 6: Query Subtype IDs
const step6Status = ref<'pending' | 'querying' | 'success' | 'error'>('pending')
const step6Error = ref('')
const subtypeIds = ref<Array<{ name?: string; id?: string; DisplayText?: string; ContentItemId?: string }>>([])
const isQuerying = ref(false)

// Step 7: Query Status IDs
const step7Status = ref<'pending' | 'querying' | 'success' | 'error'>('pending')
const step7Error = ref('')
const statusIds = ref<Array<{ name?: string; id?: string; DisplayText?: string; ContentItemId?: string }>>([])
const isQueryingStatuses = ref(false)

// Step 8: Generate Case Types
const step8Status = ref<'pending' | 'generating' | 'success' | 'error'>('pending')
const step8Error = ref('')
const caseTypeFilePath = ref('')
const isGeneratingCaseTypes = ref(false)

const retrievedSubtypes = computed(() => subtypeIds.value)
const retrievedStatuses = computed(() => statusIds.value)

// Directory paths for display
const importFilesPath = computed(() => {
  const projectPath = projectStore.current?.path || 'your project'
  return `${projectPath}\\Import Files`
})

const importFilesPathStatuses = computed(() => {
  const projectPath = projectStore.current?.path || 'your project'
  return `${projectPath}\\Import Files`
})



const step3AlertContent = computed(() => {
  return `Create a custom SQL query in Orchard Core to retrieve all case subtype IDs.<br><br><strong>Query Name:</strong> GetAllCaseSubTypeIds`
})

const step4AlertContent = computed(() => {
  return `Create a custom SQL query in Orchard Core to retrieve all case status IDs.<br><br><strong>Query Name:</strong> GetAllCaseStatusIds`
})

const step5AlertContent = computed(() => {
  const baseUrl = projectStore.current?.stagingUrl?.replace(/\/$/, '') || 'your staging site'
  return `Please follow these steps in Orchard Core:<ol class="list-decimal list-inside space-y-1"><li>Navigate to <strong>Security</strong> → <strong>Roles</strong></li><li>Find and select the <strong>ANONYMOUS</strong> role</li><li>Go to <strong>Permissions</strong> tab</li><li>Find and enable <strong>Execute API</strong> permission for both <strong>GetAllCaseSubTypeIds</strong> and <strong>GetAllCaseStatusIds</strong></li><li>Save changes</li></ol><br><p><strong>Your staging site:</strong> <code class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] px-1 rounded text-xs">${baseUrl}</code></p>`
})

const step6AlertContent = computed(() => {
  const baseUrl = projectStore.current?.stagingUrl?.replace(/\/$/, '') || 'your staging site'
  return `Querying <code class="bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] px-1 rounded">${baseUrl}/api/queries/GetAllCaseSubTypeIds</code> to retrieve the ContentItem IDs for all case subtypes.<br><br><strong>Note:</strong> This request bypasses browser CORS restrictions using the Tauri backend.`
})

const step7AlertContent = computed(() => {
  const baseUrl = projectStore.current?.stagingUrl?.replace(/\/$/, '') || 'your staging site'
  return `Querying <code class="bg-[rgb(var(--success))]/10 text-[rgb(var(--success))] px-1 rounded">${baseUrl}/api/queries/GetAllCaseStatusIds</code> to retrieve the ContentItem IDs for all case statuses.<br><br><strong>Note:</strong> This request bypasses browser CORS restrictions using the Tauri backend.`
})



const step3CheckboxLabel = computed(() => 
  'I have created the "GetAllCaseSubTypeIds" SQL query in Orchard Core'
)

const step4CheckboxLabel = computed(() => 
  'I have created the "GetAllCaseStatusIds" SQL query in Orchard Core'
)

const step0CheckboxLabel = computed(() => 
  'I have imported the "CaseSubTypes.json" file into Orchard Core'
)

const step1CheckboxLabel = computed(() => 
  'I have imported the "CaseStatuses.json" file into Orchard Core'
)





const step5CheckboxLabel = computed(() => 
  'I have enabled ANONYMOUS access to both "GetAllCaseSubTypeIds" and "GetAllCaseStatusIds"'
)



// Navigation methods
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

function handleSubtypeQueryCreation(checked: boolean) {
  querySubtypeCreated.value = checked
  if (checked) {
    // Auto-advance to step 4 after a short delay
    setTimeout(() => {
      nextStep()
    }, 500)
  }
}

function handleStatusQueryCreation(checked: boolean) {
  queryStatusCreated.value = checked
  if (checked) {
    // Auto-advance to step 5 after a short delay
    setTimeout(() => {
      nextStep()
    }, 500)
  }
}

function handleAccessConfirmation(checked: boolean) {
  accessConfirmed.value = checked
  if (checked) {
    // Auto-advance to step 6 after a short delay
    setTimeout(() => {
      nextStep()
      // Automatically start querying when step 6 becomes active
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
      const importFilesPath = `${projectStore.current.path}\\Import Files`
      await invoke('open_directory', { 
        path: importFilesPath
      })
    } catch (error) {
      console.error('Failed to open directory:', error)
    }
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

async function openOrchardImportPage() {
  if (!stagingUrl.value) return
  
  try {
    const importUrl = `${stagingUrl.value}/Admin/DeploymentPlan/Import/Index?`
    await invoke('open_url', { url: importUrl })
  } catch (error) {
    console.error('Failed to open Orchard Core Import page:', error)
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
  if (index === 0) return step1Status.value === 'success' && subtypesImported.value
  if (index === 1) return step2Status.value === 'success' && statusesImportedStep1.value
  if (index === 2) return querySubtypeCreated.value
  if (index === 3) return queryStatusCreated.value
  if (index === 4) return accessConfirmed.value
  if (index === 5) return step6Status.value === 'success'
  if (index === 6) return step7Status.value === 'success'
  if (index === 7) return step8Status.value === 'success'
  return false
}

// Copy functions
async function copySubtypeQueryName() {
  try {
    await navigator.clipboard.writeText('GetAllCaseSubTypeIds')
    showToastMessage('Query name copied to clipboard!', 'success')
  } catch (error) {
    console.error('Failed to copy query name:', error)
    showToastMessage('Failed to copy query name', 'error')
  }
}

async function copySubtypeSqlQuery() {
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

async function copyStatusQueryName() {
  try {
    await navigator.clipboard.writeText('GetAllCaseStatusIds')
    showToastMessage('Query name copied to clipboard!', 'success')
  } catch (error) {
    console.error('Failed to copy query name:', error)
    showToastMessage('Failed to copy query name', 'error')
  }
}

async function copyStatusSqlQuery() {
  try {
    const sqlQuery = `SELECT ContentItemId, DisplayText
FROM ContentItemIndex
WHERE ContentType = 'CaseStatus'
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
  console.log('canProceed check - currentStepIndex:', currentStepIndex.value)
  console.log('step1Status:', step1Status.value)
  console.log('subtypesImported:', subtypesImported.value)
  
  if (currentStepIndex.value === 0) {
    const result = step1Status.value === 'success' && subtypesImported.value
    console.log('Step 0 can proceed:', result)
    return result // Can proceed only after generation AND import confirmation
  }
  if (currentStepIndex.value === 1) return step2Status.value === 'success' && statusesImportedStep1.value // Can proceed only after generation AND import confirmation
  if (currentStepIndex.value === 2) return querySubtypeCreated.value
  if (currentStepIndex.value === 3) return queryStatusCreated.value
  if (currentStepIndex.value === 4) return accessConfirmed.value
  if (currentStepIndex.value === 5) return step6Status.value === 'success'
  if (currentStepIndex.value === 6) return step7Status.value === 'success'
  if (currentStepIndex.value === 7) return step8Status.value === 'success'
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
  console.log('querySubtypeIds: Starting query')
  isQuerying.value = true
  step6Status.value = 'querying'

  try {
    console.log('querySubtypeIds: Calling queryCaseSubtypeIdsFromAPI')
    const result = await queryCaseSubtypeIdsFromAPI()
    console.log('querySubtypeIds: Result:', result)

    if (result.success && result.data) {
      console.log('querySubtypeIds: Success, data:', result.data)
      step6Status.value = 'success'
      subtypeIds.value = result.data
      // Auto-advance to next step after successful query
      setTimeout(() => {
        nextStep()
        // Automatically start querying status IDs when step 6 becomes active
        setTimeout(() => {
          queryStatusIds()
        }, 500)
      }, 3000) // 3 second delay to let users see the retrieved data
    } else {
      console.log('querySubtypeIds: Error:', result.error)
      step6Status.value = 'error'
      step6Error.value = result.error || 'Failed to query subtype IDs'
    }
  } catch (error) {
    console.log('querySubtypeIds: Exception:', error)
    step6Status.value = 'error'
    step6Error.value = (error as Error).message
  } finally {
    console.log('querySubtypeIds: Finished, isQuerying:', isQuerying.value)
    isQuerying.value = false
  }
}





async function queryStatusIds() {
  console.log('queryStatusIds: Starting query')
  isQueryingStatuses.value = true
  step7Status.value = 'querying'

  try {
    console.log('queryStatusIds: Calling queryCaseStatusIdsFromAPI')
    const result = await queryCaseStatusIdsFromAPI()
    console.log('queryStatusIds: Result:', result)

    if (result.success && result.data) {
      console.log('queryStatusIds: Success, data:', result.data)
      step7Status.value = 'success'
      statusIds.value = result.data
      // Auto-advance to next step after successful query
      setTimeout(() => {
        nextStep()
      }, 3000) // 3 second delay to let users see the retrieved data
    } else {
      console.log('queryStatusIds: Error:', result.error)
      step7Status.value = 'error'
      step7Error.value = result.error || 'Failed to query status IDs'
    }
  } catch (error) {
    console.log('queryStatusIds: Exception:', error)
    step7Status.value = 'error'
    step7Error.value = (error as Error).message
  } finally {
    console.log('queryStatusIds: Finished, isQueryingStatuses:', isQueryingStatuses.value)
    isQueryingStatuses.value = false
  }
}

async function generateCaseTypes() {
  if (!projectStore.current) {
    step8Status.value = 'error'
    step8Error.value = 'No project selected'
    return
  }

  isGeneratingCaseTypes.value = true
  step8Status.value = 'generating'

  try {
    const result = await generateCaseTypeRecipeWithIds(
      projectStore.current.data.name,
      'Case Export Wizard',
      subtypeIds.value,
      statusIds.value
    )

    if (result.success) {
      step8Status.value = 'success'
      caseTypeFilePath.value = `${projectStore.current.path}\\Import Files\\CaseTypes.json`
      // Auto-advance to completion after successful generation
      setTimeout(() => {
        nextStep()
      }, 500)
    } else {
      step8Status.value = 'error'
      step8Error.value = result.error || 'Unknown error'
    }
  } catch (error) {
    const errorMessage = (error as Error).message
    step8Status.value = 'error'
    step8Error.value = errorMessage
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
