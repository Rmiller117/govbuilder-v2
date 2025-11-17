import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  appLocalDataDir,
  resolve,
  documentDir,
} from '@tauri-apps/api/path'
import {
  exists,
  mkdir,
  readDir,
  readTextFile,
  writeTextFile,
} from '@tauri-apps/plugin-fs'
import { open } from '@tauri-apps/plugin-dialog'

interface ProjectSummary {
  name: string
  path: string
  created?: string
}

interface CurrentProject {
  path: string
  data: Record<string, any>
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<ProjectSummary[]>([])
  const current = ref<CurrentProject | null>(null)
  const projectsRoot = ref<string | null>(null)

  // Load saved root folder
  async function loadSettings() {
    const appDir = await appLocalDataDir()
    const settingsPath = await resolve(appDir, 'settings.json')
    if (await exists(settingsPath)) {
      const txt = await readTextFile(settingsPath)
      const settings = JSON.parse(txt)
      projectsRoot.value = settings.projectsRoot || null
    }
  }

  // Save root folder
  async function saveSettings() {
    const appDir = await appLocalDataDir()
    const settingsPath = await resolve(appDir, 'settings.json')
    await writeTextFile(settingsPath, JSON.stringify({ projectsRoot: projectsRoot.value }, null, 2))
  }

  async function setProjectsRoot(path: string) {
    projectsRoot.value = path
    await saveSettings()
    await scanProjects()
  }
async function chooseProjectsRoot() {
  const selected = await open({
    directory: true,
    multiple: false,
    title: 'Select your GovBuilder projects folder',
    defaultPath: await documentDir(),
  })

  if (selected) {
    await setProjectsRoot(selected as string)   // reuse the existing setter
  }
}
  // Scan root folder for valid projects
  async function scanProjects() {
    await loadSettings()
    projects.value = []

    if (!projectsRoot.value) return

    try {
      const entries = await readDir(projectsRoot.value)
      const promises = entries
        .filter(e => e.isDirectory)
        .map(async (dir) => {
          const projPath = await resolve(projectsRoot.value!, dir.name!)
          const configPath = await resolve(projPath, 'govbuilder.json')
          if (await exists(configPath)) {
            const text = await readTextFile(configPath)
            let data
            try { data = JSON.parse(text) } catch { return null }
            return {
              name: data.name || dir.name || 'Untitled',
              path: projPath,
              created: data.created,
            }
          }
          return null
        })

      const found = (await Promise.all(promises)).filter(Boolean) as ProjectSummary[]
      found.sort((a, b) => {
        const ta = new Date(a.created || 0).getTime()
        const tb = new Date(b.created || 0).getTime()
        return tb - ta || a.name.localeCompare(b.name)
      })
      projects.value = found
    } catch (err) {
      console.error('Scan failed:', err)
    }
  }

  // Create a new project inside the root folder
  async function createProject(projectName: string) {
    if (!projectName.trim()) throw new Error('Project name is required')
    if (!projectsRoot.value) throw new Error('Projects folder not set')

    const projectPath = await resolve(projectsRoot.value, projectName)
    if (await exists(projectPath)) {
      throw new Error(`A project named "${projectName}" already exists.`)
    }

    await mkdir(projectPath, { recursive: true })
    const dataFile = await resolve(projectPath, 'govbuilder.json')

    const template = {
      name: projectName,
      created: new Date().toISOString(),
      govData: {
        title: projectName,
        agencies: [],
        regulations: {},
        metadata: {},
        statuses: []
      }
    }

    await writeTextFile(dataFile, JSON.stringify(template, null, 2))

    const summary: ProjectSummary = {
      name: projectName,
      path: projectPath,
      created: template.created,
    }

    projects.value.unshift(summary) // newest on top
    current.value = { path: projectPath, data: template }
  }

  async function loadProject(path: string) {
    const dataFile = await resolve(path, 'govbuilder.json')
    if (!(await exists(dataFile))) {
      throw new Error('Not a valid GovBuilder project (missing govbuilder.json)')
    }
    const text = await readTextFile(dataFile)
    const data = JSON.parse(text)
    current.value = { path, data }
  }

  async function saveCurrent() {
    if (!current.value) return
    const dataFile = await resolve(current.value.path, 'govbuilder.json')
    await writeTextFile(dataFile, JSON.stringify(current.value.data, null, 2))
  }

return {
  projects,
  current,
  projectsRoot,
  scanProjects,
  createProject,
  loadProject,
  saveCurrent,
  setProjectsRoot,     
  chooseProjectsRoot,    
}
})