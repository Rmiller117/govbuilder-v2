<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold">
          {{ isNew ? 'New Status' : 'Edit Status' }}
        </h1>
        <button @click="router.back()" class="text-2xl text-gray-500 hover:text-gray-900">
          ✕
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-10 space-y-10">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium mb-2">
            Title <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            placeholder="e.g. In Review"
            class="w-full px-4 py-3 border rounded-lg text-lg"
            required
          />
        </div>

        <!-- Hide toggle -->
        <div class="border-t pt-8">
          <ToggleRow
            label="Hide Status From Status Flow Chevron"
            v-model="form.hideFromStatusFlowChevron"
          />
        </div>

        <!-- Notification rows -->
        <div class="space-y-8">
          <NotifyRow
            label="Notify Assigned Team Members"
            v-model="form.notifyAssignedTeamMembers"
            :email-body.sync="emailBodyAssignedTeamMembers"
            :use-default.sync="form.useDefaultAssignedTeamMembers"
          />
          <NotifyRow
            label="Notify Other Team Members"
            v-model="form.notifyOtherTeamMembers"
            :email-body.sync="emailBodyOtherTeamMembers"
            :use-default.sync="form.useDefaultOtherTeamMembers"
          />
          <NotifyRow
            label="Notify Applicant"
            v-model="form.notifyApplicant"
            :email-body.sync="emailBodyApplicant"
            :use-default.sync="form.useDefaultApplicant"
          />
          <NotifyRow
            label="Notify All Contacts"
            v-model="form.notifyAllContacts"
            :email-body.sync="emailBodyAllContacts"
            :use-default.sync="form.useDefaultAllContacts"
          />
          <NotifyRow
            label="Notify Other Recipient"
            v-model="form.notifyOtherRecipient"
            :email-body.sync="emailBodyOtherRecipient"
            :use-default.sync="form.useDefaultOtherRecipient"
          />
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-6 pt-8 border-t">
          <button @click="router.back()" class="px-8 py-3 border rounded-xl text-lg">
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
/* ------------------------------------------------------------------ */
/*  Imports                                                            */
/* ------------------------------------------------------------------ */
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStatusStore } from '@/stores/statusStore'
import ToggleRow from '@/components/ToggleRow.vue'
import NotifyRow from '@/components/NotifyRow.vue'

const route = useRoute()
const router = useRouter()
const statusStore = useStatusStore()

/* ------------------------------------------------------------------ */
/*  Route helpers                                                     */
/* ------------------------------------------------------------------ */
const id = computed(() => route.params.id as string)
const isNew = computed(() => route.path.endsWith('/new'))

/* ------------------------------------------------------------------ */
/*  Form shape                                                        */
/* ------------------------------------------------------------------ */
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

  useDefaultAssignedTeamMembers: boolean
  useDefaultOtherTeamMembers: boolean
  useDefaultApplicant: boolean
  useDefaultAllContacts: boolean
  useDefaultOtherRecipient: boolean
}

/* ------------------------------------------------------------------ */
/*  Reactive form                                                     */
/* ------------------------------------------------------------------ */
const form = ref<StatusForm>({
  title: '',
  hideFromStatusFlowChevron: false,

  notifyAssignedTeamMembers: false,
  notifyOtherTeamMembers: false,
  notifyApplicant: false,
  notifyAllContacts: false,
  notifyOtherRecipient: false,

  emailBodyAssignedTeamMembers: '',
  emailBodyOtherTeamMembers: '',
  emailBodyApplicant: '',
  emailBodyAllContacts: '',
  emailBodyOtherRecipient: '',

  useDefaultAssignedTeamMembers: false,
  useDefaultOtherTeamMembers: false,
  useDefaultApplicant: false,
  useDefaultAllContacts: false,
  useDefaultOtherRecipient: false,
})

/* ------------------------------------------------------------------ */
/*  Coalesce optional email bodies → string (NotifyRow expects string) */
/* ------------------------------------------------------------------ */
const emailBodyAssignedTeamMembers = computed({
  get: () => form.value.emailBodyAssignedTeamMembers ?? '',
  set: v => (form.value.emailBodyAssignedTeamMembers = v),
})
const emailBodyOtherTeamMembers = computed({
  get: () => form.value.emailBodyOtherTeamMembers ?? '',
  set: v => (form.value.emailBodyOtherTeamMembers = v),
})
const emailBodyApplicant = computed({
  get: () => form.value.emailBodyApplicant ?? '',
  set: v => (form.value.emailBodyApplicant = v),
})
const emailBodyAllContacts = computed({
  get: () => form.value.emailBodyAllContacts ?? '',
  set: v => (form.value.emailBodyAllContacts = v),
})
const emailBodyOtherRecipient = computed({
  get: () => form.value.emailBodyOtherRecipient ?? '',
  set: v => (form.value.emailBodyOtherRecipient = v),
})

/* ------------------------------------------------------------------ */
/*  Load existing status                                              */
/* ------------------------------------------------------------------ */
onMounted(() => {
  if (!isNew.value) {
    const existing = statusStore.list.value.find((s: any) => s.id === id.value)
    if (existing) {
      Object.assign(form.value, {
        title: existing.title ?? '',
        hideFromStatusFlowChevron: !!existing.hideFromStatusFlowChevron,

        notifyAssignedTeamMembers: !!existing.notifyAssignedTeamMembers,
        notifyOtherTeamMembers: !!existing.notifyOtherTeamMembers,
        notifyApplicant: !!existing.notifyApplicant,
        notifyAllContacts: !!existing.notifyAllContacts,
        notifyOtherRecipient: !!existing.notifyOtherRecipient,

        emailBodyAssignedTeamMembers: existing.emailBodyAssignedTeamMembers ?? '',
        emailBodyOtherTeamMembers: existing.emailBodyOtherTeamMembers ?? '',
        emailBodyApplicant: existing.emailBodyApplicant ?? '',
        emailBodyAllContacts: existing.emailBodyAllContacts ?? '',
        emailBodyOtherRecipient: existing.emailBodyOtherRecipient ?? '',

        useDefaultAssignedTeamMembers: !!existing.useDefaultAssignedTeamMembers,
        useDefaultOtherTeamMembers: !!existing.useDefaultOtherTeamMembers,
        useDefaultApplicant: !!existing.useDefaultApplicant,
        useDefaultAllContacts: !!existing.useDefaultAllContacts,
        useDefaultOtherRecipient: !!existing.useDefaultOtherRecipient,
      })
    } else {
      router.replace('/statuses')
    }
  }
})

/* ------------------------------------------------------------------ */
/*  Save – clean up empty bodies when toggle is off                  */
/* ------------------------------------------------------------------ */
async function save() {
  if (!form.value.title.trim()) {
    alert('Title is required!')
    return
  }

  // Strip email bodies when their toggle is false
  const clean = (toggle: keyof StatusForm, bodyKey: keyof StatusForm) => {
    if (!form.value[toggle]) {
      // @ts-ignore
      form.value[bodyKey] = undefined
    }
  }
  clean('notifyAssignedTeamMembers', 'emailBodyAssignedTeamMembers')
  clean('notifyOtherTeamMembers',    'emailBodyOtherTeamMembers')
  clean('notifyApplicant',          'emailBodyApplicant')
  clean('notifyAllContacts',        'emailBodyAllContacts')
  clean('notifyOtherRecipient',     'emailBodyOtherRecipient')

  const payload = {
    ...form.value,
    id: isNew.value ? crypto.randomUUID() : id.value,
  }

  if (isNew.value) {
    await statusStore.add(payload)   // <-- saves to govbuilder.json
  } else {
    await statusStore.update(id.value, payload) // <-- saves to govbuilder.json
  }

  router.push('/statuses')
}

/* ------------------------------------------------------------------ */
/*  Live‑save while editing (optional)                                */
/* ------------------------------------------------------------------ */
watch(
  form,
  async () => {
    if (!isNew.value && id.value) {
      await statusStore.update(id.value, form.value) // <-- saves to govbuilder.json
    }
  },
  { deep: true }
)
</script>