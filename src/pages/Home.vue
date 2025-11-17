<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">GovBuilder</h1>

    <div class="flex items-center justify-between mb-6">
      <div class="text-xs text-gray-500 font-mono bg-gray-100 px-3 py-1.5 rounded-lg">
        Root: {{ projectsRoot || 'Not set' }} | {{ projects.length }} project{{ projects.length !== 1 ? 's' : '' }}
      </div>
      <button
        @click="refreshProjects"
        :disabled="refreshing"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
      >
        <svg v-if="!refreshing" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ refreshing ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <!-- First-time welcome -->
    <div v-if="!projectsRoot" class="text-center py-16">
      <h2 class="text-2xl font-semibold mb-4">Welcome to GovBuilder!</h2>
      <p class="text-gray-600 mb-8 max-w-md mx-auto">
        Choose the folder that contains your project folders.
      </p>
      <button @click="projectStore.chooseProjectsRoot()" class="px-8 py-3 bg-green-600 text-white text-lg rounded-lg hover:bg-green-700 transition">
        Select Projects Folder
      </button>
    </div>

    <!-- Normal view -->
    <div v-else>
      <div class="mb-8 p-5 bg-gray-50 rounded-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Create New Project</h2>
          <button @click="projectStore.chooseProjectsRoot()" class="text-sm underline text-blue-600 hover:text-blue-800">
            Change folder
          </button>
        </div>
        <div class="flex gap-3">
          <input v-model="newProjectName" @keyup.enter="createProject" placeholder="My New Project" class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" autofocus />
          <button @click="createProject" :disabled="!newProjectName.trim() || creating" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition">
            {{ creating ? 'Creating…' : 'Create' }}
          </button>
        </div>
      </div>

      <!-- Project List -->
      <div v-if="projects.length" class="space-y-3">
        <div v-for="proj in projects" :key="proj.path" @click="openProject(proj)" class="flex items-center justify-between p-5 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition-all border border-gray-200">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">{{ proj.name }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ proj.path }}</p>
          </div>
          <span class="text-blue-600 font-medium">Open</span>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <div class="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-6" />
        <p class="text-xl text-gray-600 font-medium">No projects found</p>
        <p class="text-gray-500 mt-2">Make sure your project folders are directly inside the selected folder.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '@/stores/projectStore'
import { useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

const projectStore = useProjectStore()
const router = useRouter()

// THIS IS THE MAGIC LINE — NO MORE ERRORS
const { projects, projectsRoot } = storeToRefs(projectStore)

const newProjectName = ref('')
const creating = ref(false)
const refreshing = ref(false)

onMounted(async () => {
  await projectStore.scanProjects()
})

async function createProject() {
  const name = newProjectName.value.trim()
  if (!name) return
  creating.value = true
  try {
    await projectStore.createProject(name)
    newProjectName.value = ''
    router.push('/dashboard')
  } catch (err: any) {
    alert(err.message || 'Failed to create project')
  } finally {
    creating.value = false
  }
}

async function openProject(proj: { path: string }) {
  try {
    await projectStore.loadProject(proj.path)
    router.push('/dashboard')
  } catch (err: any) {
    alert(err.message || 'Failed to open project')
  }
}

async function refreshProjects() {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await projectStore.scanProjects()
  } finally {
    setTimeout(() => { refreshing.value = false }, 500)
  }
}

watch(() => projectsRoot.value, () => {
  if (projectsRoot.value) refreshProjects()
})
</script>