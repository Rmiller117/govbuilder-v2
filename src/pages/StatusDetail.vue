<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold">
          {{ isNew ? 'New Status' : 'Edit Status' }}
        </h1>
        <button @click="router.push('/statuses')" class="text-2xl text-gray-500 hover:text-gray-900">✕</button>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-10 space-y-10">
        <!-- Title & Email -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label class="block text-sm font-medium mb-2">Title <span class="text-red-500">*</span></label>
            <input v-model="form.title" placeholder="e.g. In Review" class="w-full px-4 py-3 border rounded-lg text-lg" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Email (optional)</label>
            <input v-model="form.email" type="email" placeholder="status@company.com" class="w-full px-4 py-3 border rounded-lg text-lg" />
          </div>
        </div>

        <!-- Big toggle – matches screenshot placement/style -->
        <div class="border-t pt-8">
          <ToggleRow label="Hide Status From Status Flow Chevron" v-model="form.hideFromStatusFlowChevron" />
        </div>

        <!-- Notification toggles – exactly the ones from your screenshot -->
        <div class="space-y-8">
          <ToggleRow label="Append Assign Team Members" v-model="form.appendAssignTeamMembers" />
          <ToggleRow label="Notify Assigned Team Members" v-model="form.notifyAssignedTeamMembers" />
          <ToggleRow label="Notify Other Team Members" v-model="form.notifyOtherTeamMembers" />
          <ToggleRow label="Notify Applicant" v-model="form.notifyApplicant" />
          <ToggleRow label="Notify All Contacts" v-model="form.notifyAllContacts" />
          <ToggleRow label="Notify Other Recipient" v-model="form.notifyOtherRecipient" />
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-6 pt-8 border-t">
          <button @click="router.push('/statuses')" class="px-8 py-3 border rounded-xl text-lg">
            Cancel
          </button>
          <button @click="save" class="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-lg">
            {{ isNew ? 'Create' : 'Save' }} Status
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStatusStore } from '@/stores/statusStore'
import ToggleRow from '@/components/ToggleRow.vue'

const route = useRoute()
const router = useRouter()
const statusStore = useStatusStore()

const id = computed(() => route.params.id as string)
const isNew = computed(() => id.value === 'new')

interface StatusForm {
  title: string
  email: string
  hideFromStatusFlowChevron: boolean
  appendAssignTeamMembers: boolean
  notifyAssignedTeamMembers: boolean
  notifyOtherTeamMembers: boolean
  notifyApplicant: boolean
  notifyAllContacts: boolean
  notifyOtherRecipient: boolean
}

const form = ref<StatusForm>({
  title: '',
  email: '',
  hideFromStatusFlowChevron: false,
  appendAssignTeamMembers: false,
  notifyAssignedTeamMembers: false,
  notifyOtherTeamMembers: false,
  notifyApplicant: false,
  notifyAllContacts: false,
  notifyOtherRecipient: false,
})

onMounted(() => {
  if (!isNew.value) {
    const existing = statusStore.list.find(s => s.id === id.value)
    if (existing) {
      form.value = {
        title: existing.title || '',
        email: existing.email || '',
        hideFromStatusFlowChevron: !!existing.hideFromStatusFlowChevron,
        appendAssignTeamMembers: !!existing.appendAssignTeamMembers,
        notifyAssignedTeamMembers: !!existing.notifyAssignedTeamMembers,
        notifyOtherTeamMembers: !!existing.notifyOtherTeamMembers,
        notifyApplicant: !!existing.notifyApplicant,
        notifyAllContacts: !!existing.notifyAllContacts,
        notifyOtherRecipient: !!existing.notifyOtherRecipient,
      }
    } else {
      router.push('/statuses') // safety
    }
  }
})

function save() {
  if (!form.value.title.trim()) {
    alert('Title is required!')
    return
  }

  const payload = {
    ...form.value,
    id: isNew.value ? crypto.randomUUID() : id.value,
  }

  if (isNew.value) {
    statusStore.add(payload)
  } else {
    statusStore.update(id.value, payload)
  }

  router.push('/statuses')
}
</script>