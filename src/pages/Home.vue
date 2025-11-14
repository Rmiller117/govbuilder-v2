<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">GovBuilder</h1>

    <!-- Create New Project Button -->
    <button
      @click="createProject"
      class="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      + New Project
    </button>

    <!-- Project List -->
    <div v-if="projects.length" class="space-y-3">
      <div
        v-for="proj in projects"
        :key="proj.path"
        class="flex items-center justify-between p-4 bg-white rounded shadow hover:shadow-md cursor-pointer"
        @click="openProject(proj)"
      >
        <div>
          <h3 class="font-semibold">{{ proj.name }}</h3>
          <p class="text-sm text-gray-600">{{ proj.path }}</p>
        </div>
        <span class="text-blue-600">Open</span>
      </div>
    </div>

    <p v-else class="text-gray-500">No projects yet. Create one to get started.</p>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '@/stores/projectStore'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const projectStore = useProjectStore()
const router = useRouter()

// Use store values directly
const projects = projectStore.projects

// Scan on mount
onMounted(async () => {
  await projectStore.scanProjects()
})

// CREATE PROJECT – now used in template
async function createProject() {
  const input = prompt('Project name:')
  if (!input?.trim()) {
    console.log('Create cancelled')
    return
  }

  try {
    console.log('Creating project:', input)
    await projectStore.createProject(input.trim())
    router.push('/dashboard')
  } catch (err: any) {
    console.error('Create failed:', err)
    alert(`Error: ${err.message}`)
  }
}

// OPEN PROJECT – now used in template
async function openProject(proj: any) {
  try {
    await projectStore.loadProject(proj.path)
    router.push('/dashboard')
  } catch (err: any) {
    alert(`Error: ${err.message}`)
  }
}
</script>