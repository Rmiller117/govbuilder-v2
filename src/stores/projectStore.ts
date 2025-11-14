import { ref, readonly, watch, computed } from 'vue'
import {
  mkdir,
  readDir,
  readTextFile,
  writeTextFile,
  BaseDirectory
} from '@tauri-apps/plugin-fs'
import { appLocalDataDir } from '@tauri-apps/api/path'

export interface Project {
  name: string
  path: string   // folder name inside AppLocalData
}

const currentProject = ref<Project | null>(null)
const currentConfig = ref<any>({})   // this is your editable config.json
const projects = ref<Project[]>([])

export function useProjectStore() {
  async function getAppDir(): Promise<string> {
    const dir = await appLocalDataDir()
    return dir.endsWith('/') || dir.endsWith('\\') ? dir.slice(0, -1) : dir
  }

  async function scanProjects() {
    try {
      const entries = await readDir('', { baseDir: BaseDirectory.AppLocalData })
      const appDir = await getAppDir()
      projects.value = entries
        .filter(e => e.isDirectory)
        .map(e => ({
          name: e.name!,
          path: e.name!
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    } catch (err) {
      console.error('Failed to scan projects:', err)
      projects.value = []
    }
  }

  async function createProject(name: string) {
    if (!name?.trim()) throw new Error('Project name cannot be empty')

    const safeName = name.trim().replace(/[^a-z0-9_-]/gi, '_')
    if (!safeName) throw new Error('Invalid project name')

    try {
      // Create folder + default files
      await mkdir(safeName, { baseDir: BaseDirectory.AppLocalData, recursive: true })
      await writeTextFile(`${safeName}/project.json`, JSON.stringify({ name: safeName }, null, 2), { baseDir: BaseDirectory.AppLocalData })
      await writeTextFile(`${safeName}/config.json`, JSON.stringify({ statuses: [], notifications: [] }, null, 2), { baseDir: BaseDirectory.AppLocalData })

      // Set as current
      currentProject.value = { name: safeName, path: safeName }
      currentConfig.value = { statuses: [], notifications: [] }

      await scanProjects()
    } catch (err: any) {
      console.error('createProject failed:', err)
      throw new Error(`Failed to create project: ${err.message || err}`)
    }
  }

  async function loadProject(folder: string) {
    try {
      const metaText = await readTextFile(`${folder}/project.json`, { baseDir: BaseDirectory.AppLocalData })
      const meta = JSON.parse(metaText)
      currentProject.value = { name: meta.name ?? folder, path: folder }

      // Load config.json into reactive ref
      const configText = await readTextFile(`${folder}/config.json`, { baseDir: BaseDirectory.AppLocalData })
      currentConfig.value = JSON.parse(configText)
    } catch (err: any) {
      console.error('loadProject failed:', err)
      throw err
    }
  }

  async function saveConfig() {
    if (!currentProject.value) return
    await writeTextFile(
      `${currentProject.value.path}/config.json`,
      JSON.stringify(currentConfig.value, null, 2),
      { baseDir: BaseDirectory.AppLocalData }
    )
  }

  // Auto-save whenever currentConfig changes
  watch(currentConfig, () => {
    if (currentProject.value) saveConfig()
  }, { deep: true })

  const currentProjectName = computed(() => currentProject.value?.name ?? null)

  return {
    // reactive state
    currentProject: readonly(currentProject),
    currentProjectName,
    currentConfig,
    projects: readonly(projects),

    // actions
    scanProjects,
    createProject,
    loadProject,
    saveConfig
  }
}