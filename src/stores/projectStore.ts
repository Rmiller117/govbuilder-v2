// src/stores/projectStore.ts
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

  async function loadSettings() {
    const appDir = await appLocalDataDir()
    const settingsPath = await resolve(appDir, 'settings.json')
    if (await exists(settingsPath)) {
      const txt = await readTextFile(settingsPath)
      const settings = JSON.parse(txt)
      projectsRoot.value = settings.projectsRoot || null
    }
  }

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
      await setProjectsRoot(selected as string)
    }
  }

  async function scanProjects() {
    await loadSettings()
    projects.value = [] // Clear old list

    if (!projectsRoot.value) return

    try {
      const entries = await readDir(projectsRoot.value)
      const validProjects: ProjectSummary[] = []

      for (const entry of entries) {
        if (!entry.isDirectory) continue
        const projPath = await resolve(projectsRoot.value!, entry.name!)
        const configPath = await resolve(projPath, 'govbuilder.json')

        if (await exists(configPath)) {
          try {
            const text = await readTextFile(configPath)
            const data = JSON.parse(text)
            validProjects.push({
              name: data.name || entry.name!,
              path: projPath,
              created: data.created
            })
          } catch (err) {
            console.warn('Invalid project:', projPath)
          }
        }
      }

      validProjects.sort((a, b) =>
        (b.created ? new Date(b.created).getTime() : 0) -
        (a.created ? new Date(a.created).getTime() : 0)
      )

      projects.value = validProjects
    } catch (err) {
      console.error('Scan failed:', err)
      projects.value = []
    }
  }

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

    projects.value.unshift(summary)
    current.value = { path: projectPath, data: template }
  }

async function loadProject(path: string) {
  const dataFile = await resolve(path, 'govbuilder.json')
  if (!(await exists(dataFile))) {
    throw new Error('Not a valid GovBuilder project (missing govbuilder.json)')
  }
  const text = await readTextFile(dataFile)
  const data = JSON.parse(text)

  console.log('Loading project:', data) // Add this line for debugging

  current.value = { path, data }
}

async function saveCurrent() {
  if (!current.value) return

  console.log('Data to be saved:', current.value.data) // Add this line for debugging

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
