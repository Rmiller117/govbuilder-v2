import { defineStore } from 'pinia'
import { ref } from 'vue'
import { appLocalDataDir, basename, resolve } from '@tauri-apps/api/path'
import { open } from '@tauri-apps/plugin-dialog'
import { create, exists, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'

interface ProjectSummary {
  name: string
  path: string                // full absolute directory path
}

interface CurrentProject {
  path: string
  data: Record<string, any> // we’ll make this stricter later when we know the real JSON shape
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<ProjectSummary[]>([])
  const current = ref<CurrentProject | null>(null)

  async function loadRecentProjects() {
    const appDir = await appLocalDataDir()
    const recentPath = await resolve(appDir, 'recent-projects.json')

    try {
      const text = await readTextFile(recentPath)
      projects.value = JSON.parse(text)
    } catch (e) {
      projects.value = [] // first run or file missing → start empty
    }
  }

  async function saveRecentProjects() {
    const appDir = await appLocalDataDir()
    const recentPath = await resolve(appDir, 'recent-projects.json')
    await writeTextFile(recentPath, JSON.stringify(projects.value, null, 2))
  }

  async function createFromTemplate(projectName: string) {
    if (!projectName.trim()) return

    const selected = await open({
      directory: true,
      title: 'Select folder where the new project will be created',
    })

    if (selected === null) return // user cancelled

    const projectPath = await resolve(selected as string, projectName)

    if (await exists(projectPath)) {
      throw new Error(`A folder named "${projectName}" already exists there. Pick another name or location.`)
    }

    await create(projectPath)

    // ────── YOUR TEMPLATE STARTS HERE ──────
    const template = {
      name: projectName,
      created: new Date().toISOString(),
      govData: {
        title: projectName,
        agencies: [],
        regulations: {},
        metadata: {}
      }
    }
    // ─────────────────────────────────────

    const dataFile = await resolve(projectPath, 'govbuilder.json')
    await writeTextFile(dataFile, JSON.stringify(template, null, 2))

    const summary: ProjectSummary = { name: projectName, path: projectPath }
    projects.value.unshift(summary)         // newest on top
    await saveRecentProjects()

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

    // Auto-add to recent list if it isn’t already there
    if (!projects.value.some(p => p.path === path)) {
      const name = data.name || await basename(path)
      projects.value.unshift({ name, path })
      await saveRecentProjects()
    }
  }

  async function saveCurrent() {
    if (!current.value) return
    const dataFile = await resolve(current.value.path, 'govbuilder.json')
    await writeTextFile(dataFile, JSON.stringify(current.value.data, null, 2))
  }

  return {
    projects,
    current,
    scanProjects: loadRecentProjects, 
    createFromTemplate,
    loadProject,
    saveCurrent
  }
})