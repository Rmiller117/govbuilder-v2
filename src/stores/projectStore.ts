// src/stores/projectStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  appLocalDataDir,
  basename,
  resolve,
  documentDir,
} from '@tauri-apps/api/path'
import { open } from '@tauri-apps/plugin-dialog'
import {
  create,      // ← for files only (we don't use this anymore)
  exists,
  mkdir,       // ← NEW: for directories
  readTextFile,
  writeTextFile,
} from '@tauri-apps/plugin-fs'

interface ProjectSummary {
  name: string
  path: string // full absolute directory path
}
interface CurrentProject {
  path: string
  data: Record<string, any>
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<ProjectSummary[]>([])
  const current = ref<CurrentProject | null>(null)

  /* --------------------------------------------------------------
   *  Recent-projects persistence (app-local data folder)
   * ------------------------------------------------------------ */
  async function loadRecentProjects() {
    const appDir = await appLocalDataDir()
    const recentPath = await resolve(appDir, 'recent-projects.json')
    try {
      const txt = await readTextFile(recentPath)
      projects.value = JSON.parse(txt)
    } catch {
      projects.value = [] // first run or corrupted file
    }
  }

  async function saveRecentProjects() {
    const appDir = await appLocalDataDir()
    const recentPath = await resolve(appDir, 'recent-projects.json')
    await writeTextFile(recentPath, JSON.stringify(projects.value, null, 2))
  }

  /* --------------------------------------------------------------
   *  Create a brand-new project (dialog → folder → JSON)
   * ------------------------------------------------------------ */
  async function createFromTemplate(projectName: string) {
    if (!projectName.trim()) return

    // 1. Let the user pick the *parent* folder (defaults to Documents)
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select folder where the new project will be created',
      defaultPath: await documentDir(),
    })
    if (!selected) return // cancelled

    // 2. Build absolute paths
    const projectPath = await resolve(selected as string, projectName)
    const dataFile = await resolve(projectPath, 'govbuilder.json')

    // 3. Guard: folder must not exist yet
    if (await exists(projectPath)) {
      throw new Error(
        `A folder named "${projectName}" already exists there. Pick another name or location.`
      )
    }

   async function createFromTemplate(projectName: string) {
  if (!projectName.trim()) return

  const selected = await open({
    directory: true,
    multiple: false,
    title: 'Select folder where the new project will be created',
    defaultPath: await documentDir(),
  })
  if (!selected) return

  const projectPath = await resolve(selected as string, projectName)
  const dataFile = await resolve(projectPath, 'govbuilder.json')

  // Prevent overwrite
  if (await exists(projectPath)) {
    throw new Error(
      `A folder named "${projectName}" already exists there. Pick another name or location.`
    )
  }

  // ← THIS IS THE CRITICAL LINE (Tauri v2 way) ←
  await mkdir(projectPath, { recursive: true })
  // ───────────────────────────────────────────

  const template = {
    name: projectName,
    created: new Date().toISOString(),
govData: {
  title: projectName,
  agencies: [],
  regulations: {},
  metadata: {},
  statuses: []   // ← ADD THIS
}
  }

  await writeTextFile(dataFile, JSON.stringify(template, null, 2))

  const summary: ProjectSummary = { name: projectName, path: projectPath }
  projects.value.unshift(summary)
  await saveRecentProjects()
  current.value = { path: projectPath, data: template }
}

    // 5. Write the starter JSON template
    const template = {
      name: projectName,
      created: new Date().toISOString(),
      govData: {
        title: projectName,
        agencies: [],
        regulations: {},
        metadata: {},
      },
    }
    await writeTextFile(dataFile, JSON.stringify(template, null, 2))

    // 6. Update recent-list & current project
    const summary: ProjectSummary = { name: projectName, path: projectPath }
    projects.value.unshift(summary) // newest on top
    await saveRecentProjects()
    current.value = { path: projectPath, data: template }
  }

  /* --------------------------------------------------------------
   *  Load an existing project (adds to recent list if missing)
   * ------------------------------------------------------------ */
  async function loadProject(path: string) {
    const dataFile = await resolve(path, 'govbuilder.json')
    if (!(await exists(dataFile))) {
      throw new Error('Not a valid GovBuilder project (missing govbuilder.json)')
    }

    const text = await readTextFile(dataFile)
    const data = JSON.parse(text)

    current.value = { path, data }

    // Auto-add to recent list if it isn’t there already
    if (!projects.value.some((p) => p.path === path)) {
      const name = data.name || (await basename(path))
      projects.value.unshift({ name, path })
      await saveRecentProjects()
    }
  }

  /* --------------------------------------------------------------
   *  Save the currently loaded project
   * ------------------------------------------------------------ */
  async function saveCurrent() {
    if (!current.value) return
    const dataFile = await resolve(current.value.path, 'govbuilder.json')
    await writeTextFile(dataFile, JSON.stringify(current.value.data, null, 2))
  }

  /* --------------------------------------------------------------
   *  Helper used by Home.vue to refresh the list on mount
   * ------------------------------------------------------------ */
  async function scanProjects() {
    await loadRecentProjects()
  }

  /* --------------------------------------------------------------
   *  Helper used by Home.vue to add a project *without* a dialog
   * ------------------------------------------------------------ */
  function addProject(summary: ProjectSummary) {
    // avoid duplicates
    if (projects.value.some((p) => p.path === summary.path)) return
    projects.value.unshift(summary)
    saveRecentProjects()
  }

  return {
    projects,
    current,
    scanProjects,
    createFromTemplate,
    loadProject,
    saveCurrent,
    addProject, // <-- new, used by Home.vue after manual folder creation
  }
})