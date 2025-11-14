<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Statuses</h1>
      <button @click="openForm()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Add Status
      </button>
    </div>

    <table class="min-w-full bg-white border">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 text-left">Title</th>
          <th class="px-4 py-2 text-left">Email</th>
          <th class="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in statuses" :key="s.id" class="border-t">
          <td class="px-4 py-2">{{ s.title }}</td>
          <td class="px-4 py-2">{{ s.email }}</td>
          <td class="px-4 py-2">
            <button @click="edit(s)" class="text-blue-600 mr-2">Edit</button>
            <button @click="remove(s.id)" class="text-red-600">Delete</button>
          </td>
        </tr>
        <tr v-if="!statuses.length">
          <td colspan="3" class="text-center py-4 text-gray-500">No statuses yet.</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal form -->
    <teleport to="body">
      <div v-if="showForm" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg w-full max-w-md">
          <StatusForm
            :initial="editing"
            @save="save"
            @cancel="closeForm"
          />
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import StatusForm from '@/components/StatusForm.vue'
import { useStatusStore } from '@/stores/statusStore'
import { useProjectStore } from '@/stores/projectStore'

/* ---------- Project handling ---------- */
const projectStore = useProjectStore()
const currentProject = projectStore.currentProject

/* ---------- Status list handling ---------- */
const statusStore = useStatusStore()
const statuses = computed(() => statusStore.list)

const showForm = ref(false)
const editing = ref<any>(null)

function openForm() {
  editing.value = null
  showForm.value = true
}
function edit(item: any) {
  editing.value = { ...item }
  showForm.value = true
}
function closeForm() {
  showForm.value = false
  editing.value = null
}
function save(data: any) {
  if (editing.value?.id) {
    statusStore.update(editing.value.id, data)
  } else {
    statusStore.add(data)
  }
  closeForm()
}
function remove(id: string) {
  if (confirm('Delete this status?')) statusStore.remove(id)
}

/* ---------- Load / Save to project config ---------- */
onMounted(async () => {
  if (!currentProject.value) return
  const cfg = await projectStore.loadConfig()
  statusStore.setList(cfg.statuses ?? [])
})

watch(
  () => statusStore.list,
  (newList) => {
    if (!currentProject.value) return
    projectStore.saveConfig({ ...projectStore.currentConfig, statuses: newList })
  },
  { deep: true }
)
</script>