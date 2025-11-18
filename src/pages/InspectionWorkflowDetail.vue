<!-- src/views/InspectionWorkflowDetail.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="p-2.5 rounded-lg hover:bg-gray-100 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isNew ? 'Create' : 'Edit' }} Inspection Workflow
          </h1>
        </div>
        <button @click="handleSave" class="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
          Save Workflow
        </button>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-12">
      <form @submit.prevent="handleSave" class="bg-white rounded-3xl shadow-xl p-8 space-y-8">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            Workflow Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            required
            placeholder="e.g. Building Final - Completed Notifications"
            class="w-full px-5 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div class="space-y-10">
          <h2 class="text-2xl font-bold text-gray-800">Notification Settings by Status</h2>

          <div v-for="status in statusKeys" :key="status" class="border rounded-2xl p-6 bg-gray-50">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-800">{{ formatStatus(status) }}</h3>
              <ToggleRow label="Enable Notifications" v-model="getConfig(status).enabled" />
            </div>

            <Transition name="fade">
              <div v-if="getConfig(status).enabled" class="space-y-8 pl-8">
                <!-- Switches -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ToggleRow label="Append Assign Team Members" v-model="getConfig(status).appendAssignTeamMembers" />
                  <ToggleRow label="Notify Assigned Team Members" v-model="getConfig(status).notifyAssignedTeamMembers" />
                  <ToggleRow label="Notify Other Team Members" v-model="getConfig(status).notifyOtherTeamMembers" />
                  <ToggleRow label="Notify Applicant" v-model="getConfig(status).notifyApplicant" />
                  <ToggleRow label="Notify All Contacts" v-model="getConfig(status).notifyAllContacts" />
                  <ToggleRow label="Notify Other Recipient" v-model="getConfig(status).notifyOtherRecipient" />
                  <ToggleRow label="Do Not Send Mail When Applicant and Approver are Same" v-model="getConfig(status).doNotSendMailWhenApplicantAndApproverSame" />
                  <ToggleRow label="Attach Permit Types" v-model="getConfig(status).attachPermitTypes" />
                  <ToggleRow label="Attach Form Letters" v-model="getConfig(status).attachFormLetters" />
                </div>

                <!-- Email Templates — only show if the notify switch is ON -->
                <template v-for="key in notifyKeys" :key="key">
                  <div v-if="getConfig(status)[key]" class="mt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ notifyLabels[key] }} Email Template
                    </label>
                    <textarea
                      v-model="getConfig(status)[key + 'Template']"
                      rows="12"
                      class="w-full font-mono text-sm p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 resize-y"
                    ></textarea>
                  </div>
                </template>
              </div>
            </Transition>
          </div>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInspectionWorkflowStore, type InspectionWorkflow } from '@/stores/inspectionWorkflowStore'
import ToggleRow from '@/components/ToggleRow.vue'

const route = useRoute()
const router = useRouter()
const { list, save: saveWorkflow } = useInspectionWorkflowStore()

const id = computed(() => route.params.id as string)
const isNew = computed(() => route.path.endsWith('/new'))

const form = ref<Partial<InspectionWorkflow>>({ name: '' })
const config = ref<Record<string, any>>({})

const statusKeys = [
  'AcceptedInvite','Approved','CancelledByAdmin','CancelledByUser',
  'Completed','DeclinedInvite','Failed','InProgress','NotRequired','Submitted'
] as const

// The notify switches that get email templates
const notifyKeys = [
  'notifyAssignedTeamMembers',
  'notifyOtherTeamMembers',
  'notifyApplicant',
  'notifyAllContacts',
  'notifyOtherRecipient',
] as const

const notifyLabels: Record<typeof notifyKeys[number], string> = {
  notifyAssignedTeamMembers: 'Assigned Team Members',
  notifyOtherTeamMembers: 'Other Team Members',
  notifyApplicant: 'Applicant',
  notifyAllContacts: 'All Contacts',
  notifyOtherRecipient: 'Other Recipient',
}

const defaultConfig = {
  enabled: false,
  appendAssignTeamMembers: false,
  notifyAssignedTeamMembers: false,
  notifyOtherTeamMembers: false,
  notifyApplicant: false,
  notifyAllContacts: false,
  notifyOtherRecipient: false,
  doNotSendMailWhenApplicantAndApproverSame: false,
  attachPermitTypes: false,
  attachFormLetters: false,
  notifyAssignedTeamMembersTemplate: '<emailTemplate></emailTemplate>',
  notifyOtherTeamMembersTemplate: '<emailTemplate></emailTemplate>',
  notifyApplicantTemplate: '<emailTemplate></emailTemplate>',
  notifyAllContactsTemplate: '<emailTemplate></emailTemplate>',
  notifyOtherRecipientTemplate: '<emailTemplate></emailTemplate>',
}

function getConfig(key: string) {
  if (!config.value[key]) {
    config.value[key] = { ...defaultConfig }
  }
  return config.value[key]
}

function formatStatus(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

onMounted(() => {
  statusKeys.forEach(key => getConfig(key))

  if (!isNew.value) {
    const existing = list.value.find(w => w.id === id.value)
    if (!existing) {
      router.replace('/inspection-workflows')
      return
    }
    form.value = { ...existing }
    statusKeys.forEach(key => {
      const saved = (existing as any)[key]
      if (saved) {
        config.value[key] = { ...defaultConfig, ...saved }
      }
    })
  }
})

async function handleSave() {
  if (!form.value.name?.trim()) {
    alert('Workflow name is required')
    return
  }

  const payload: InspectionWorkflow = {
    id: isNew.value ? undefined : id.value,
    name: form.value.name.trim(),
    ...Object.fromEntries(
      Object.entries(config.value)
        .map(([k, c]: [string, any]) => {
          if (!c.enabled) return [k, undefined]
          const cleaned = { ...c }
          // Remove template if the switch is off
          notifyKeys.forEach(field => {
            if (!cleaned[field]) delete cleaned[field + 'Template']
          })
          return [k, cleaned]
        })
        .filter(([, v]) => v !== undefined)
    ),
  }

  await saveWorkflow(payload as InspectionWorkflow)
  router.push('/inspection-workflows')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>