import { ref, readonly } from 'vue'
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
  path: string
}

const currentProject = ref<Project | null>(null)
const projects = ref<Project[]>([])

export function useProjectStore() {
  async function getAppDir(): Promise<string> {
    const dir = await appLocalDataDir()
    // Ensure no trailing slash
    return dir.endsWith('/') || dir.endsWith('\\') ? dir.slice(0, -1) : dir
  }

  async function scanProjects() {
    try {
      const appDir = await getAppDir()
      const entries = await readDir('', {
        baseDir: BaseDirectory.AppLocalData
      })

      projects.value = entries
        .filter(e => e.isDirectory)
        .map(e => ({
          name: e.name,
          path: `${appDir}/${e.name}` // Safe path
        }))
    } catch (err) {
      console.error('Failed to scan projects:', err)
      projects.value = []
    }
  }

  async function createProject(name: string) {
    if (!name || name.trim() === '') {
      throw new Error('Project name cannot be empty')
    }

    const safeName = name.trim().replace(/[^a-z0-9_-]/gi, '_')
    if (safeName === '') {
      throw new Error('Invalid project name')
    }

    const projectPath = safeName

    try {
      console.log('Creating project:', safeName) // Debug

      // 1. Create folder
      await mkdir(projectPath, {
        baseDir: BaseDirectory.AppLocalData,
        recursive: true
      })

      // 2. project.json
      await writeTextFile(
        `${projectPath}/project.json`,
        JSON.stringify({ name }, null, 2),
        { baseDir: BaseDirectory.AppLocalData }
      )

      // 3. config.json
      await writeTextFile(
        `${projectPath}/config.json`,
        JSON.stringify({ statuses: [], notifications: [] }, null, 2),
        { baseDir: BaseDirectory.AppLocalData }
      )

      currentProject.value = { name, path: projectPath }
      await scanProjects()
      console.log('Project created:', projectPath)
    } catch (err: any) {
      console.error('createProject failed:', err)
      throw new Error(`Failed to create project: ${err.message || err}`)
    }
  }

  // ... rest of functions unchanged (loadProject, saveConfig, etc.)
  async function loadProject(path: string) {
    try {
      const metaText = await readTextFile(`${path}/project.json`, {
        baseDir: BaseDirectory.AppLocalData
      })
      const meta = JSON.parse(metaText)
      currentProject.value = { name: meta.name, path }
    } catch (err: any) {
      throw new Error(`Failed to load project: ${err.message || err}`)
    }
  }

  async function saveConfig(config: any) {
    if (!currentProject.value) return
    await writeTextFile(
      `${currentProject.value.path}/config.json`,
      JSON.stringify(config, null, 2),
      { baseDir: BaseDirectory.AppLocalData }
    )
  }

  async function loadConfig() {
    if (!currentProject.value) return {}
    try {
      const text = await readTextFile(`${currentProject.value.path}/config.json`, {
        baseDir: BaseDirectory.AppLocalData
      })
      return JSON.parse(text)
    } catch {
      return {}
    }
  }

  return {
    currentProject: readonly(currentProject),
    projects: readonly(projects),
    scanProjects,
    createProject,
    loadProject,
    saveConfig,
    loadConfig
  }
}