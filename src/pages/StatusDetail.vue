<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="p-2.5 rounded-lg hover:bg-slate-100 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-slate-900">
            {{ isNew ? 'Create Status' : 'Edit Status' }}
          </h1>
        </div>

        <button
          @click="showLiquidModal = true"
          class="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition flex items-center gap-2 shadow-md"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Show Available Liquid
        </button>
      </div>
    </header>

    <!-- MAIN FORM — THIS WAS MISSING BEFORE! -->
    <main class="max-w-4xl mx-auto px-6 py-10">
      <form @submit.prevent="save" class="bg-white rounded-3xl shadow-xl ring-1 ring-slate-200/50 p-8 lg:p-12 space-y-12">
        <!-- Title -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-3">Status Title <span class="text-red-500">*</span></label>
          <input v-model="form.title" required autofocus placeholder="e.g. In Review" class="w-full px-5 py-4 text-lg font-medium bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Hide from chevron -->
        <div class="border-t pt-8">
          <ToggleRow label="Hide from status flow chevron" v-model="form.hideFromStatusFlowChevron" />
        </div>

        <!-- Notifications -->
        <div class="border-t pt-8 space-y-10">
          <NotifyRow
            v-for="row in notificationRows"
            :key="row.key"
            :label="row.label"
            v-model="form[row.key]"
            :email-body="form[row.bodyKey] ?? ''"
            @update:email-body="form[row.bodyKey] = $event || undefined"
          />
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-4 pt-8 border-t">
          <button type="button" @click="router.back()" class="px-8 py-3.5 text-lg font-medium border border-slate-300 rounded-xl hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" class="px-8 py-3.5 text-lg font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md">
            {{ isNew ? 'Create' : 'Save' }} Status
          </button>
        </div>
      </form>
    </main>

    <!-- Liquid Modal (same as before — now works perfectly) -->
    <teleport to="body">
      <TransitionRoot appear :show="showLiquidModal" as="template">
        <Dialog as="div" @close="showLiquidModal = false" class="relative z-50">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </TransitionChild>

          <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4">
              <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                <DialogPanel class="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-8">
                  <div class="flex items-center justify-between mb-8">
                    <DialogTitle class="text-2xl font-bold text-slate-900">Available Liquid Variables</DialogTitle>
                    <button @click="showLiquidModal = false" class="p-2 rounded-lg hover:bg-slate-100">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <p class="text-slate-600 italic mb-8">Click any variable to copy it.</p>

                  <!-- Case Information -->
                  <section class="mb-10">
                    <h3 class="font-semibold text-lg text-slate-800 mb-4">Case Information</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <LiquidTag tag="Number" desc="Case Number" @copied="handleCopy"/>
                      <LiquidTag tag="CaseName" desc="Case Name" @copied="handleCopy"/>
                      <LiquidTag tag="CaseNumberDetail" @copied="handleCopy"/>
                      <LiquidTag tag="ApplicationLocation" desc="Address from form" @copied="handleCopy"/>
                      <LiquidTag tag="Location" desc="Address from case/license" @copied="handleCopy"/>
                      <LiquidTag tag="ExpectedCaseDate" desc="Expected Close Date" @copied="handleCopy"/>
                      <LiquidTag tag="ActualCaseDate" desc="Actual Close Date" @copied="handleCopy"/>
                      <LiquidTag tag="TotalCost" @copied="handleCopy"/>
                      <LiquidTag tag="CaseStatus" desc="Current Case Status" @copied="handleCopy"/>
                      <LiquidTag tag="ParcelNumber" @copied="handleCopy"/>
                      <LiquidTag tag="BillingStatus" @copied="handleCopy"/>
                      <LiquidTag tag="CaseType" @copied="handleCopy"/>
                      <LiquidTag tag="SubTypes" desc="Comma-separated" @copied="handleCopy"/>
                    </div>
                  </section>

                  <!-- Permit Dates -->
                  <section class="mb-10">
                    <h3 class="font-semibold text-lg text-slate-800 mb-4">Permit Dates</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <LiquidTag tag="PermitIssuedDate" @copied="handleCopy"/>
                      <LiquidTag tag="PermitExpirationDate" @copied="handleCopy"/>
                      <LiquidTag tag="QuickRefNumber" @copied="handleCopy"/>
                    </div>
                  </section>

                  <!-- Primary Contact -->
                  <section>
                    <h3 class="font-semibold text-lg text-slate-800 mb-4">Primary Contact</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <LiquidTag tag="ApplicantFirstName" @copied="handleCopy"/>
                      <LiquidTag tag="ApplicantLastName" @copied="handleCopy"/>
                      <LiquidTag tag="Email" @copied="handleCopy"/>
                      <LiquidTag tag="PhoneNumber" @copied="handleCopy"/>
                      <LiquidTag tag="MailingAddress" @copied="handleCopy"/>
                    </div>
                  </section>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </teleport>
<Transition
  enter-active-class="transition ease-out duration-300"
  enter-from-class="opacity-0 translate-y-4"
  enter-to-class="opacity-100 translate-y-0"
  leave-active-class="transition ease-in duration-200"
  leave-from-class="opacity-100 translate-y-0"
  leave-to-class="opacity-0 -translate-y-4"
>
  <div
    v-if="copiedTag"
    class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60]" 
  >
    <div class="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-medium text-sm">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      Copied <code class="font-mono bg-slate-700 px-2 py-1 rounded">{{ copiedTag }}</code> to clipboard
    </div>
  </div>
</Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStatusStore } from '@/stores/statusStore'  // ← THIS WAS MISSING
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'
import LiquidTag from '@/components/LiquidTag.vue'     // ← Don't forget this!
import ToggleRow from '@/components/ToggleRow.vue'
import NotifyRow from '@/components/NotifyRow.vue'

const route = useRoute()
const router = useRouter()
const statusStore = useStatusStore()               // ← Now defined!

const id = computed(() => route.params.id as string)
const isNew = computed(() => route.path.endsWith('/new'))
const showLiquidModal = ref(false)

// ──────────────────────────────────────────────────────────────
// Type-safe keys
// ──────────────────────────────────────────────────────────────
type NotifyKey =
  | 'notifyAssignedTeamMembers'
  | 'notifyOtherTeamMembers'
  | 'notifyApplicant'
  | 'notifyAllContacts'
  | 'notifyOtherRecipient'

type BodyKey =
  | 'emailBodyAssignedTeamMembers'
  | 'emailBodyOtherTeamMembers'
  | 'emailBodyApplicant'
  | 'emailBodyAllContacts'
  | 'emailBodyOtherRecipient'

// ──────────────────────────────────────────────────────────────
// Form interface
// ──────────────────────────────────────────────────────────────
interface StatusForm {
  title: string
  hideFromStatusFlowChevron: boolean

  notifyAssignedTeamMembers: boolean
  notifyOtherTeamMembers: boolean
  notifyApplicant: boolean
  notifyAllContacts: boolean
  notifyOtherRecipient: boolean

  emailBodyAssignedTeamMembers?: string
  emailBodyOtherTeamMembers?: string
  emailBodyApplicant?: string
  emailBodyAllContacts?: string
  emailBodyOtherRecipient?: string

  [key: string]: any
}

// ──────────────────────────────────────────────────────────────
// Data-driven rows
// ──────────────────────────────────────────────────────────────
const notificationRows = [
  { label: 'Notify Assigned Team Members', key: 'notifyAssignedTeamMembers' as NotifyKey, bodyKey: 'emailBodyAssignedTeamMembers' as BodyKey },
  { label: 'Notify Other Team Members',    key: 'notifyOtherTeamMembers' as NotifyKey,    bodyKey: 'emailBodyOtherTeamMembers' as BodyKey },
  { label: 'Notify Applicant',             key: 'notifyApplicant' as NotifyKey,             bodyKey: 'emailBodyApplicant' as BodyKey },
  { label: 'Notify All Contacts',          key: 'notifyAllContacts' as NotifyKey,          bodyKey: 'emailBodyAllContacts' as BodyKey },
  { label: 'Notify Other Recipient',       key: 'notifyOtherRecipient' as NotifyKey,       bodyKey: 'emailBodyOtherRecipient' as BodyKey },
] satisfies { label: string; key: NotifyKey; bodyKey: BodyKey }[]

// ──────────────────────────────────────────────────────────────
// Form state
// ──────────────────────────────────────────────────────────────
const form = ref<StatusForm>({
  title: '',
  hideFromStatusFlowChevron: false,
  notifyAssignedTeamMembers: false,
  notifyOtherTeamMembers: false,
  notifyApplicant: false,
  notifyAllContacts: false,
  notifyOtherRecipient: false,
})

// ──────────────────────────────────────────────────────────────
// Load existing status
// ──────────────────────────────────────────────────────────────
onMounted(() => {
  if (!isNew.value) {
    const existing = statusStore.list.value.find(s => s.id === id.value)
    if (!existing) {
      router.replace('/statuses')
      return
    }

    Object.assign(form.value, {
      title: existing.title || '',
      hideFromStatusFlowChevron: !!existing.hideFromStatusFlowChevron,
      notifyAssignedTeamMembers: !!existing.notifyAssignedTeamMembers,
      notifyOtherTeamMembers: !!existing.notifyOtherTeamMembers,
      notifyApplicant: !!existing.notifyApplicant,
      notifyAllContacts: !!existing.notifyAllContacts,
      notifyOtherRecipient: !!existing.notifyOtherRecipient,
      emailBodyAssignedTeamMembers: existing.emailBodyAssignedTeamMembers,
      emailBodyOtherTeamMembers: existing.emailBodyOtherTeamMembers,
      emailBodyApplicant: existing.emailBodyApplicant,
      emailBodyAllContacts: existing.emailBodyAllContacts,
      emailBodyOtherRecipient: existing.emailBodyOtherRecipient,
    })
  }
})

// ──────────────────────────────────────────────────────────────
// Save
// ──────────────────────────────────────────────────────────────
async function save() {
  if (!form.value.title.trim()) {
    alert('Title is required!')
    return
  }

  const payload: any = {
    ...form.value,
    id: isNew.value ? crypto.randomUUID() : id.value,
  }

  notificationRows.forEach(row => {
    if (!payload[row.key]) {
      delete payload[row.bodyKey]
    }
  })

  if (isNew.value) {
    await statusStore.add(payload)
  } else {
    await statusStore.update(id.value, payload)
  }

  router.push('/statuses')
}
const copiedTag = ref<string>('')

// Listen for copy events from all LiquidTag components
function handleCopy(tag: string) {
  copiedTag.value = `{{${tag}}}`
  setTimeout(() => {
    copiedTag.value = ''
  }, 1500) // disappears after 1.5s
}
</script>