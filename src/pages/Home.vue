<template>
  <div class="min-h-screen max-w-4xl mx-auto bg-bg text-[rgb(var(--text))] transition-all">
    <!-- Header -->
    <header class="bg-[rgb(var(--primary))] text-white px-8 py-6 rounded-3xl shadow-xl mb-12
               mx-auto max-w-4xl -mt-4">
      <div class="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 class="text-3xl font-bold tracking-tight">GovBuilder</h1>

        <div class="flex items-center gap-3">
          <!-- Refresh Button -->
          <button @click="refreshProjects" :disabled="refreshing" class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium
                   bg-white/10 backdrop-blur-sm hover:bg-white/20 
                   border border-white/20 shadow-md hover:shadow-lg
                   active:scale-95 transition-all disabled:opacity-50 ring-focus">
            <svg v-if="!refreshing" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg v-else class="w-4.5 h-4.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4" />
              <path class="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ refreshing ? 'Refreshing...' : 'Refresh' }}
          </button>

          <!-- Theme Toggle -->
          <ThemeToggleButton />
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-6">

      <!-- First-time Welcome -->
      <div v-if="!projectsRoot" class="text-center py-20">
        <div class="bg-surface border border-base rounded-3xl w-32 h-32 mx-auto mb-8 shadow-lg opacity-70" />
        <h2 class="text-3xl font-bold mb-4">Welcome to GovBuilder!</h2>
        <p class="text-[rgb(var(--text-muted))] text-lg mb-10 max-w-md mx-auto">
          Choose the folder that contains all your project folders.
        </p>
        <button @click="projectStore.chooseProjectsRoot()" class="px-10 py-4 rounded-2xl font-semibold text-white text-lg
                 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-hover))]
                 shadow-lg hover:shadow-xl active:scale-98 transition-all ring-focus">
          Select Projects Folder
        </button>
      </div>

      <!-- Normal View -->
      <div v-else>
        <!-- Create New Project Card + Current Folder Path -->
        <div class="bg-surface border border-base rounded-2xl p-7 shadow-base mb-10">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-6">
            <div>
              <h2 class="text-2xl font-bold">Create New Project</h2>

              <!-- FULL PATH — with nice styling & truncation for long paths -->
              <div class="flex items-center gap-2.5 mt-3 text-sm">
                <svg class="w-4.5 h-4.5 text-[rgb(var(--text-muted))]" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" />
                </svg>
                <code class="font-mono text-[rgb(var(--text-muted))] bg-[rgb(var(--bg))] 
                 px-3.5 py-1.5 rounded-lg border border-base
                 max-w-xl truncate block text-xs sm:text-sm" :title="projectsRoot || ''">
          {{ projectsRoot || 'No folder selected' }}
        </code>
              </div>
            </div>

            <button @click="projectStore.chooseProjectsRoot()"
              class="text-sm underline text-primary hover:text-[rgb(var(--primary-hover))] transition">
              Change folder
            </button>
          </div>

          <!-- Input + Create button (unchanged) -->
          <div class="flex gap-4">
            <input v-model="newProjectName" @keyup.enter="createProject" placeholder="Enter project name..." autofocus
              class="flex-1 px-5 py-3 rounded-xl border border-base bg-bg
             placeholder:text-[rgb(var(--text-muted))/0.6]
             focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))/0.5] ring-focus" />
            <button @click="createProject" :disabled="!newProjectName.trim() || creating" class="px-8 py-3 rounded-xl font-semibold text-white
             bg-[rgb(var(--success))] hover:bg-[rgb(var(--success))/0.9]
             shadow-md hover:shadow-lg active:scale-98 transition-all disabled:opacity-50 ring-focus">
              {{ creating ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </div>

        <!-- Project List -->
        <div v-if="projects.length" class="space-y-5">
          <div v-for="proj in projects" :key="proj.path" @click="openProject(proj)" class="group bg-surface border border-base rounded-2xl p-7
                   shadow-base hover:shadow-xl cursor-pointer
                   transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold text-[rgb(var(--text))] group-hover:text-primary transition">
                  {{ proj.name }}
                </h3>
                <p class="text-sm text-[rgb(var(--text-muted))] mt-1 font-mono">
                  {{ proj.path }}
                </p>
              </div>
              <span class="text-primary font-semibold text-lg group-hover:translate-x-2 transition">
                Open →
              </span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-24">
          <div class="bg-surface border-2 border-dashed border-base rounded-3xl w-28 h-28 mx-auto mb-8 opacity-60" />
          <p class="text-2xl font-semibold text-[rgb(var(--text-muted))]/80">No projects found</p>
          <p class="text-[rgb(var(--text-muted))] mt-3">
            Create one above or make sure your project folders are directly inside the selected folder.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '@/stores/projectStore'
import { useRouter } from 'vue-router'
import { onMounted, ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

const projectStore = useProjectStore()
const router = useRouter()
const { projects, projectsRoot } = storeToRefs(projectStore)

const newProjectName = ref('')
const creating = ref(false)
const refreshing = ref(false)

// Bonus: Show only the last folder name (e.g. "GovProjects" instead of full path)
const currentFolderName = computed(() => {
  if (!projectsRoot.value) return 'No folder selected'
  return projectsRoot.value.split(/[\\/]/).pop() || 'Root folder'
})

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
    setTimeout(() => (refreshing.value = false), 600)
  }
}

watch(() => projectsRoot.value, () => {
  if (projectsRoot.value) refreshProjects()
})
</script>