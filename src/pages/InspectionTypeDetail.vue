<!-- src/views/InspectionTypeDetail.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="p-2.5 rounded-lg hover:bg-gray-100 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isNew ? 'Create' : 'Edit' }} Inspection Type
          </h1>
        </div>
        <button
          @click="handleSave"
          :disabled="!form.title?.trim() || !form.durationHours"
          class="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {{ isNew ? 'Create' : 'Save' }}
        </button>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-12">
      <form @submit.prevent="handleSave" class="bg-white rounded-3xl shadow-xl p-8 space-y-12">
        <!-- Title -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            Title <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            required
            placeholder="e.g. Building Final"
            class="w-full px-5 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Duration -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            Inspection Duration <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-3 gap-4 max-w-md">
            <select v-model.number="hours" class="px-5 py-4 border border-gray-300 rounded-xl text-lg">
              <option v-for="n in 9" :key="n" :value="n-1">{{ n-1 }} hours</option>
            </select>
            <select v-model.number="minutes" class="px-5 py-4 border border-gray-300 rounded-xl text-lg">
              <option :value="0">0 minutes</option>
              <option :value="15">15 minutes</option>
              <option :value="30">30 minutes</option>
              <option :value="45">45 minutes</option>
            </select>
            <div class="flex items-center justify-center text-xl font-medium text-gray-700 bg-gray-50 rounded-xl">
              {{ formattedDuration }}
            </div>
          </div>
        </div>
                <!-- Workflow Selector -->
<!-- In InspectionTypeDetail.vue -->
<div class="border-t pt-8">
  <label class="block text-sm font-semibold text-gray-700 mb-3">Inspection Notification Workflow</label>
  <select v-model="form.workflowId" class="w-full max-w-lg px-5 py-4 border border-gray-300 rounded-xl text-lg">
    <option :value="undefined">No notifications</option>
    <option v-for="wf in inspectionWorkflows" :key="wf.id" :value="wf.id">
      {{ wf.name }}
    </option>
  </select>
  <p class="text-sm text-gray-600 mt-3">
    Manage workflows in <router-link to="/inspection-types" class="text-purple-600 underline">Inspection Types</router-link>
  </p>
</div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInspectionTypeStore, type InspectionType } from '@/stores/inspectionTypeStore'
import { useWorkflowStore } from '@/stores/workflowStore'
import { useInspectionWorkflowStore } from '@/stores/inspectionWorkflowStore'
const { list: inspectionWorkflowList } = useInspectionWorkflowStore()
const inspectionWorkflows = computed(() => inspectionWorkflowList.value)

const route = useRoute()
const router = useRouter()

// Renamed to avoid duplicate identifier
const { list, save: saveInspectionType } = useInspectionTypeStore()
const { list: workflowList } = useWorkflowStore()

const workflows = computed(() => workflowList.value)

const id = computed(() => route.params.id as string)
const isNew = computed(() => route.path.endsWith('/new'))

const form = ref<Partial<InspectionType>>({
  title: '',
  durationHours: 1,
  workflowId: undefined,
})

const hours = ref(1)
const minutes = ref(0)

watch([hours, minutes], () => {
  form.value.durationHours = hours.value + minutes.value / 60
}, { immediate: true })

const formattedDuration = computed(() => {
  const total = form.value.durationHours || 0
  const h = Math.floor(total)
  const m = Math.round((total - h) * 60)
  return h || m ? `${h ? h + 'h ' : ''}${m ? m + 'm' : ''}`.trim() : '0m'
})

onMounted(() => {
  if (!isNew.value) {
    const existing = list.value.find(t => t.id === id.value)
    if (!existing) {
      router.replace('/inspection-types')
      return
    }
    form.value = { ...existing }
    hours.value = Math.floor(existing.durationHours || 0)
    minutes.value = Math.round((existing.durationHours || 0 - hours.value) * 60)
  }
})

async function handleSave() {
  if (!form.value.title?.trim()) {
    alert('Title is required')
    return
  }
  if (!form.value.durationHours || form.value.durationHours <= 0) {
    alert('Please set a valid duration')
    return
  }

  await saveInspectionType({
    id: isNew.value ? undefined : id.value,
    title: form.value.title.trim(),
    durationHours: form.value.durationHours,
    workflowId: form.value.workflowId || undefined,
  } as InspectionType)

  router.push('/inspection-types')
}
</script>