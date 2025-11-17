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
          :disabled="!newProjectName.trim() || creating"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ creating ? 'Creating…' : 'Create' }}
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
/* ------------------------------------------------------------------ */
/*  Imports                                                            */
/* ------------------------------------------------------------------ */
import { useProjectStore } from '@/stores/projectStore'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import { mkdir, writeTextFile } from '@tauri-apps/plugin-fs'
import { documentDir } from '@tauri-apps/api/path'

interface ProjectSummary { name: string; path: string }

/* ------------------------------------------------------------------ */
/*  Pinia & Router                                                    */
/* ------------------------------------------------------------------ */
const projectStore = useProjectStore()
const router = useRouter()

/* ------------------------------------------------------------------ */
/*  Reactive state                                                    */
/* ------------------------------------------------------------------ */
const newProjectName = ref('')
const creating = ref(false)
// `projects` **is read** in the template → keep it
const projects = projectStore.projects

/* ------------------------------------------------------------------ */
/*  Lifecycle                                                         */
/* ------------------------------------------------------------------ */
onMounted(async () => {
  await projectStore.scanProjects()
})

/* ------------------------------------------------------------------ */
/*  Create Project (used by button & @keyup.enter)                     */
/* ------------------------------------------------------------------ */
async function createProject() {
  const name = newProjectName.value.trim()
  if (!name) return

  creating.value = true
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: await documentDir(),
    })
    if (!selected) return

    const projectFolder = `${selected}/${name}`
    const configPath = `${projectFolder}/govbuilder.json`

    // <-- Tauri v2 directory creation -->
    await mkdir(projectFolder, { recursive: true })

    const template = {
      name,
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      sections: [],
    }
    await writeTextFile(configPath, JSON.stringify(template, null, 2))

    // Refresh recent‑projects list
    projectStore.addProject({ name, path: projectFolder })

    newProjectName.value = ''
    router.push('/dashboard')
  } catch (err: any) {
    alert(`Could not create project: ${err.message || err}`)
  } finally {
    creating.value = false
  }
}

/* ------------------------------------------------------------------ */
/*  Open Existing Project (used by each list item)                    */
/* ------------------------------------------------------------------ */
async function openProject(proj: ProjectSummary) {
  try {
    await projectStore.loadProject(proj.path)
    router.push('/dashboard')
  } catch (err: any) {
    alert(`Could not open project: ${err.message || err}`)
  }
}

/* ------------------------------------------------------------------ */
/*  Explicitly mark the functions as used (optional, silences ESLint) */
/* ------------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
void createProject; void openProject; void projects
</script>