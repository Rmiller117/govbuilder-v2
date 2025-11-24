<template>
  <div class="min-h-screen bg-bg text-[rgb(var(--text))]">
    <!-- Header -->
    <header class="bg-surface border-b border-base shadow-sm">
      <div class="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="router.back()"
            class="p-2.5 rounded-lg hover:bg-[rgb(var(--elevated))] transition"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 class="text-3xl font-bold">
            {{ isNew ? 'Create Status' : 'Edit Status' }}
          </h1>
        </div>

        <div class="flex items-center gap-4">
          <button
            @click="showLiquidModal = true"
            class="px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-md
                   bg-[rgb(var(--primary))] text-[rgb(var(--bg))]
                   hover:bg-[rgb(var(--primary-hover))] transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Show Available Liquid
          </button>

          <ThemeToggleButton />
        </div>
      </div>
    </header>

    <!-- MAIN FORM -->
    <main class="max-w-4xl mx-auto px-6 py-10">
      <form
        @submit.prevent="save"
        class="bg-surface rounded-3xl shadow-xl ring-1 ring-base/50 p-8 lg:p-12 space-y-12"
      >
        <!-- Title -->
        <div>
          <label class="block text-sm font-semibold mb-3">
            Status Title <span class="text-danger">*</span>
          </label>
          <input
            v-model="form.title"
            required
            autofocus
            placeholder="e.g. In Review"
            class="w-full px-5 py-4 text-lg font-medium
                   bg-[rgb(var(--bg))]
                   text-[rgb(var(--text))]
                   placeholder-[rgb(var(--text-muted))]
                   border border-base rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))/0.5]"
          />
        </div>

        <!-- Hide from chevron -->
        <div class="border-t border-base pt-8">
          <ToggleRow
            label="Hide from status flow chevron"
            v-model="form.hideFromStatusFlowChevron"
          />
        </div>

        <!-- Notifications -->
        <div class="border-t border-base pt-8 space-y-10">
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
        <div class="flex justify-end gap-4 pt-8 border-t border-base">
          <button
            type="button"
            @click="router.back()"
            class="px-8 py-3.5 text-lg font-medium border border-base rounded-xl
                   hover:bg-[rgb(var(--elevated))]"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="px-8 py-3.5 text-lg font-medium rounded-xl shadow-md
                   bg-[rgb(var(--primary))] text-[rgb(var(--bg))]
                   hover:bg-[rgb(var(--primary-hover))]"
          >
            {{ isNew ? 'Create' : 'Save' }} Status
          </button>
        </div>
      </form>
    </main>

    <!-- Liquid Modal -->
    <teleport to="body">
      <TransitionRoot appear :show="showLiquidModal" as="template">
        <Dialog as="div" @close="showLiquidModal = false" class="relative z-50">

          <!-- Overlay -->
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-[rgb(var(--bg)/0.6)] backdrop-blur-sm" />
          </TransitionChild>

          <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0 scale-95"
                enter-to="opacity-100 scale-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100 scale-100"
                leave-to="opacity-0 scale-95"
              >
                <DialogPanel
                  class="w-full max-w-4xl max-h-[90vh] overflow-y-auto
                         bg-elevated rounded-2xl shadow-lg border border-base p-8"
                >
                  <div class="flex items-center justify-between mb-8">
                    <DialogTitle class="text-2xl font-bold">
                      Available Liquid Variables
                    </DialogTitle>

                    <button
                      @click="showLiquidModal = false"
                      class="p-2 rounded-lg hover:bg-[rgb(var(--surface))]"
                    >
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <p class="text-[rgb(var(--text-muted))] italic mb-8">
                    Click any variable to copy it.
                  </p>

                  <!-- Case Information -->
                  <section class="mb-10">
                    <h3 class="font-semibold text-lg mb-4">Case Information</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <LiquidTag tag="Number" desc="Case Number" @copied="handleCopy" />
                      <LiquidTag tag="CaseName" desc="Case Name" @copied="handleCopy" />
                      <LiquidTag tag="CaseNumberDetail" @copied="handleCopy" />
                      <LiquidTag tag="ApplicationLocation" desc="Address from form" @copied="handleCopy" />
                      <LiquidTag tag="Location" desc="Address from case/license" @copied="handleCopy" />
                      <LiquidTag tag="ExpectedCaseDate" desc="Expected Close Date" @copied="handleCopy" />
                      <LiquidTag tag="ActualCaseDate" desc="Actual Close Date" @copied="handleCopy" />
                      <LiquidTag tag="TotalCost" @copied="handleCopy" />
                      <LiquidTag tag="CaseStatus" desc="Current Case Status" @copied="handleCopy" />
                      <LiquidTag tag="ParcelNumber" @copied="handleCopy" />
                      <LiquidTag tag="BillingStatus" @copied="handleCopy" />
                      <LiquidTag tag="CaseType" @copied="handleCopy" />
                      <LiquidTag tag="SubTypes" desc="Comma-separated" @copied="handleCopy" />
                    </div>
                  </section>

                  <!-- Permit Dates -->
                  <section class="mb-10">
                    <h3 class="font-semibold text-lg mb-4">Permit Dates</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <LiquidTag tag="PermitIssuedDate" @copied="handleCopy" />
                      <LiquidTag tag="PermitExpirationDate" @copied="handleCopy" />
                      <LiquidTag tag="QuickRefNumber" @copied="handleCopy" />
                    </div>
                  </section>

                  <!-- Primary Contact -->
                  <section>
                    <h3 class="font-semibold text-lg mb-4">Primary Contact</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <LiquidTag tag="ApplicantFirstName" @copied="handleCopy" />
                      <LiquidTag tag="ApplicantLastName" @copied="handleCopy" />
                      <LiquidTag tag="Email" @copied="handleCopy" />
                      <LiquidTag tag="PhoneNumber" @copied="handleCopy" />
                      <LiquidTag tag="MailingAddress" @copied="handleCopy" />
                    </div>
                  </section>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </teleport>

    <!-- TOAST -->
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
        <div class="px-6 py-3 rounded-full shadow-lg border border-base
                    bg-surface text-[rgb(var(--text))]
                    flex items-center gap-3 font-medium text-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 13l4 4L19 7" />
          </svg>
          Copied <code class="font-mono px-2 py-1 rounded bg-[rgb(var(--elevated))]">
            {{ copiedTag }}
          </code> to clipboard
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStatusStore } from '@/stores/statusStore'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'
import LiquidTag from '@/components/LiquidTag.vue'
import ToggleRow from '@/components/ToggleRow.vue'
import NotifyRow from '@/components/NotifyRow.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

const route = useRoute()
const router = useRouter()
const statusStore = useStatusStore()

const id = computed(() => route.params.id as string)
const isNew = computed(() => route.path.endsWith('/new'))
const showLiquidModal = ref(false)

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

const notificationRows = [
  { label: 'Notify Assigned Team Members', key: 'notifyAssignedTeamMembers' as NotifyKey, bodyKey: 'emailBodyAssignedTeamMembers' as BodyKey },
  { label: 'Notify Other Team Members',    key: 'notifyOtherTeamMembers' as NotifyKey,    bodyKey: 'emailBodyOtherTeamMembers' as BodyKey },
  { label: 'Notify Applicant',             key: 'notifyApplicant' as NotifyKey,           bodyKey: 'emailBodyApplicant' as BodyKey },
  { label: 'Notify All Contacts',          key: 'notifyAllContacts' as NotifyKey,         bodyKey: 'emailBodyAllContacts' as BodyKey },
  { label: 'Notify Other Recipient',       key: 'notifyOtherRecipient' as NotifyKey,      bodyKey: 'emailBodyOtherRecipient' as BodyKey },
]

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

const form = ref<StatusForm>({
  title: '',
  hideFromStatusFlowChevron: false,
  notifyAssignedTeamMembers: false,
  notifyOtherTeamMembers: false,
  notifyApplicant: false,
  notifyAllContacts: false,
  notifyOtherRecipient: false,
})

onMounted(() => {
  if (!isNew.value) {
    const existing = statusStore.list.value.find((s: { id: string }) => s.id === id.value)
    if (!existing) {
      router.replace('/statuses')
      return
    }

    Object.assign(form.value, existing)
  }
})

async function save() {
  if (!form.value.title.trim()) {
    alert('Title is required!')
    return
  }

  const payload = {
    ...form.value,
    id: isNew.value ? crypto.randomUUID() : id.value,
  }

  notificationRows.forEach(row => {
    if (!payload[row.key]) delete payload[row.bodyKey]
  })

  if (isNew.value) await statusStore.add(payload)
  else await statusStore.update(id.value, payload)

  router.push('/statuses')
}

const copiedTag = ref('')

function handleCopy(tag: string) {
  copiedTag.value = `{{${tag}}}`
  setTimeout(() => {
    copiedTag.value = ''
  }, 1500)
}
</script>
