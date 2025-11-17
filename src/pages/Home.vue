<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">GovBuilder</h1>

    <!-- Create New Project – inline form -->
    <div class="mb-8 p-5 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Create New Project</h2>
      <div class="flex gap-3">
        <input
          v-model="newProjectName"
          @keyup.enter="createProject"
          placeholder="Enter project name..."
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          autofocus
        />
        <button
          @click="createProject"
          :disabled="!newProjectName.trim()"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Create
        </button>
      </div>
    </div>

    <!-- Project List -->
    <div v-if="projects.length" class="space-y-3">
      <div
        v-for="proj in projects"
        :key="proj.path"
        class="flex items-center justify-between p-4 bg-white rounded shadow hover:shadow-md cursor-pointer transition"
        @click="openProject(proj)"
      >
        <div>
          <h3 class="font-semibold">{{ proj.name }}</h3>
          <p class="text-sm text-gray-600">{{ proj.path }}</p>
        </div>
        <span class="text-blue-600 font-medium">Open →</span>
      </div>
    </div>

    <p v-else class="text-gray-500 mt-8">No projects yet. Create one above to get started.</p>
  </div>
</template>
<script setup lang="ts">
import { useProjectStore } from '@/stores/projectStore'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

interface ProjectSummary { name: string; path: string }

const projectStore = useProjectStore()
const router = useRouter()
const newProjectName = ref('')

const projects = projectStore.projects

onMounted(async () => {
  await projectStore.scanProjects()
})

async function createProject() {
  const name = newProjectName.value.trim()
  if (!name) return

  try {
    await projectStore.createFromTemplate(name)
    newProjectName.value = ''          // clear input
    router.push('/dashboard')
  } catch (err: any) {
    alert(`Could not create project: ${err.message || err}`)
  }
}

async function openProject(proj: ProjectSummary) {
  try {
    await projectStore.loadProject(proj.path)
    router.push('/dashboard')
  } catch (err: any) {
    alert(`Could not open project: ${err.message || err}`)
  }
}
</script>