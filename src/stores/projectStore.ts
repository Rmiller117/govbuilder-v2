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
import { 
  syncAllContentTypes, 
  mapApiItemsToStore, 
  mergeSyncedItems,
  createSubtypeLookup,
  fetchContentItems,
  type SyncResult,
  type SyncProgress 
} from '@/utils/apiSyncUtils'

interface ProjectSummary {
  name: string
  path: string
  created?: string
}

interface CurrentProject {
  path: string
  data: Record<string, any>
  stagingUrl?: string
  apiConfigured?: boolean
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<ProjectSummary[]>([])
  const current = ref<CurrentProject | null>(null)
  const projectsRoot = ref<string | null>(null)
  const stagingUrl = ref<string | null>(null)
  const apiConfigured = ref<boolean>(false)

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
        projectBuild: {
          statuses: [],
          licenseStatuses: [],
          accounting: { details: [] },
          inspectionTypes: [],
          inspectionWorkflows: {},
          licenseTypes: [],
          licenseSubTypes: [],
          licenseWorkflows: {},
          workflows: {},
          caseTypes: [],
          subtypes: []
        }
      }
    }

    await writeTextFile(dataFile, JSON.stringify(template, null, 2))

    const summary: ProjectSummary = {
      name: projectName,
      path: projectPath,
      created: template.created,
    }

    projects.value.unshift(summary)
    // set new project. For some reason they were keeping staging URLs from other projects :(
    current.value = { path: projectPath, data: template }
    stagingUrl.value = null // Explicitly clear staging URL for new projects
  }

async function loadProject(path: string) {
  const dataFile = await resolve(path, 'govbuilder.json')
  if (!(await exists(dataFile))) {
    throw new Error('Not a valid GovBuilder project (missing govbuilder.json)')
  }
  const text = await readTextFile(dataFile)
  let data = JSON.parse(text)

  // Migration logic: Check if project uses old structure (arrays directly under govData)
  data = await migrateProjectStructure(data)

  // Only load staging URL if it exists in the project data
  const projectStagingUrl = data.stagingUrl || null
  const projectApiConfigured = data.apiConfigured || false
  current.value = { path, data, stagingUrl: projectStagingUrl, apiConfigured: projectApiConfigured }
  stagingUrl.value = projectStagingUrl
  apiConfigured.value = projectApiConfigured
}

async function migrateProjectStructure(data: any) {
  const govData = data.govData || {}
  
  // Check if migration is needed (old structure has arrays directly under govData)
  const hasOldStructure = 
    Array.isArray(govData.statuses) ||
    Array.isArray(govData.licenseStatuses) ||
    govData.accounting ||
    Array.isArray(govData.inspectionTypes) ||
    govData.inspectionWorkflows ||
    Array.isArray(govData.licenseTypes) ||
    Array.isArray(govData.licenseSubTypes) ||
    govData.licenseWorkflows ||
    govData.workflows ||
    Array.isArray(govData.caseTypes) ||
    Array.isArray(govData.subtypes)

  if (!hasOldStructure) {
    return data // No migration needed
  }

  console.log('Migrating project structure from old format to new projectBuild format...')

  // Initialize projectBuild if it doesn't exist
  if (!govData.projectBuild) {
    govData.projectBuild = {}
  }

  // Migrate each array/object to projectBuild
  if (Array.isArray(govData.statuses)) {
    govData.projectBuild.statuses = govData.statuses
    delete govData.statuses
  } else if (!govData.projectBuild.statuses) {
    govData.projectBuild.statuses = []
  }

  if (Array.isArray(govData.licenseStatuses)) {
    govData.projectBuild.licenseStatuses = govData.licenseStatuses
    delete govData.licenseStatuses
  } else if (!govData.projectBuild.licenseStatuses) {
    govData.projectBuild.licenseStatuses = []
  }

  if (govData.accounting) {
    govData.projectBuild.accounting = govData.accounting
    delete govData.accounting
  } else if (!govData.projectBuild.accounting) {
    govData.projectBuild.accounting = { details: [] }
  }

  if (Array.isArray(govData.inspectionTypes)) {
    govData.projectBuild.inspectionTypes = govData.inspectionTypes
    delete govData.inspectionTypes
  } else if (!govData.projectBuild.inspectionTypes) {
    govData.projectBuild.inspectionTypes = []
  }

  if (govData.inspectionWorkflows) {
    govData.projectBuild.inspectionWorkflows = govData.inspectionWorkflows
    delete govData.inspectionWorkflows
  } else if (!govData.projectBuild.inspectionWorkflows) {
    govData.projectBuild.inspectionWorkflows = {}
  }

  if (Array.isArray(govData.licenseTypes)) {
    govData.projectBuild.licenseTypes = govData.licenseTypes
    delete govData.licenseTypes
  } else if (!govData.projectBuild.licenseTypes) {
    govData.projectBuild.licenseTypes = []
  }

  if (Array.isArray(govData.licenseSubTypes)) {
    govData.projectBuild.licenseSubTypes = govData.licenseSubTypes
    delete govData.licenseSubTypes
  } else if (!govData.projectBuild.licenseSubTypes) {
    govData.projectBuild.licenseSubTypes = []
  }

  if (govData.licenseWorkflows) {
    govData.projectBuild.licenseWorkflows = govData.licenseWorkflows
    delete govData.licenseWorkflows
  } else if (!govData.projectBuild.licenseWorkflows) {
    govData.projectBuild.licenseWorkflows = {}
  }

  if (govData.workflows) {
    govData.projectBuild.workflows = govData.workflows
    delete govData.workflows
  } else if (!govData.projectBuild.workflows) {
    govData.projectBuild.workflows = {}
  }

  if (Array.isArray(govData.caseTypes)) {
    govData.projectBuild.caseTypes = govData.caseTypes
    delete govData.caseTypes
  } else if (!govData.projectBuild.caseTypes) {
    govData.projectBuild.caseTypes = []
  }

  if (Array.isArray(govData.subtypes)) {
    govData.projectBuild.subtypes = govData.subtypes
    delete govData.subtypes
  } else if (!govData.projectBuild.subtypes) {
    govData.projectBuild.subtypes = []
  }

  // Add govbuiltContentItemId field to all existing items if they don't have it
  const addGovbuiltContentItemId = (items: any[]) => {
    items.forEach(item => {
      if (item && !item.hasOwnProperty('govbuiltContentItemId')) {
        item.govbuiltContentItemId = undefined
      }
    })
  }

  const addGovbuiltContentItemIdToObjects = (objects: Record<string, any>) => {
    Object.values(objects).forEach(obj => {
      if (obj && !obj.hasOwnProperty('govbuiltContentItemId')) {
        obj.govbuiltContentItemId = undefined
      }
    })
  }

  // Add field to all arrays
  if (govData.projectBuild.statuses) addGovbuiltContentItemId(govData.projectBuild.statuses)
  if (govData.projectBuild.licenseStatuses) addGovbuiltContentItemId(govData.projectBuild.licenseStatuses)
  if (govData.projectBuild.inspectionTypes) addGovbuiltContentItemId(govData.projectBuild.inspectionTypes)
  if (govData.projectBuild.licenseTypes) addGovbuiltContentItemId(govData.projectBuild.licenseTypes)
  if (govData.projectBuild.licenseSubTypes) addGovbuiltContentItemId(govData.projectBuild.licenseSubTypes)
  if (govData.projectBuild.caseTypes) addGovbuiltContentItemId(govData.projectBuild.caseTypes)
  if (govData.projectBuild.subtypes) addGovbuiltContentItemId(govData.projectBuild.subtypes)

  // Add field to accounting details
  if (govData.projectBuild.accounting && govData.projectBuild.accounting.details) {
    addGovbuiltContentItemId(govData.projectBuild.accounting.details)
  }

  // Add field to workflow objects
  if (govData.projectBuild.workflows) addGovbuiltContentItemIdToObjects(govData.projectBuild.workflows)
  if (govData.projectBuild.inspectionWorkflows) addGovbuiltContentItemIdToObjects(govData.projectBuild.inspectionWorkflows)
  if (govData.projectBuild.licenseWorkflows) addGovbuiltContentItemIdToObjects(govData.projectBuild.licenseWorkflows)

  // Update the data object
  data.govData = govData

  console.log('Project structure migration completed.')
  return data
}

async function saveCurrent() {
  if (!current.value) return

  const dataFile = await resolve(current.value.path, 'govbuilder.json')
  const updatedData = {
    ...current.value.data,
    stagingUrl: stagingUrl.value,
    apiConfigured: apiConfigured.value
  }
  await writeTextFile(dataFile, JSON.stringify(updatedData, null, 2))
  if (current.value) {
    current.value.stagingUrl = stagingUrl.value || undefined
  }
}

async function updateStagingUrl(url: string) {
  stagingUrl.value = url
  if (current.value) {
    current.value.stagingUrl = url
  }
  await saveCurrent()
}

async function updateApiConfigured(configured: boolean) {
  apiConfigured.value = configured
  if (current.value) {
    current.value.apiConfigured = configured
  }
  await saveCurrent()
}

async function syncContentFromApi(onProgress?: (progress: SyncProgress) => void): Promise<SyncResult[]> {
  if (!stagingUrl.value) {
    throw new Error('Staging URL is not configured')
  }
  
  if (!current.value) {
    throw new Error('No project is currently loaded')
  }

  try {
    // Sync all content types from API
    const results = await syncAllContentTypes(stagingUrl.value, onProgress)
    
    console.log('Sync results:', results)
    console.log('🔍 DEBUG: All content types in results:', results.map(r => r.contentType))
    
    // CRITICAL FIX: Ensure CaseSubType data is available for mapping
    let caseSubTypeResult = results.find(r => r.contentType === 'CaseSubType')
    console.log('🔍 DEBUG: CaseSubType result found:', !!caseSubTypeResult, caseSubTypeResult?.success, caseSubTypeResult?.items?.length || 0)
    if (!caseSubTypeResult || !caseSubTypeResult.success || caseSubTypeResult.items.length === 0) {
      console.log('🚨 CaseSubType missing or empty, forcing manual fetch...')
      try {
        const manualSubTypes = await fetchContentItems(stagingUrl.value, 'CaseSubType')
        console.log(`🚨 Manual fetch got ${manualSubTypes.length} CaseSubType items`)
        
        // Add or replace CaseSubType result
        const existingIndex = results.findIndex(r => r.contentType === 'CaseSubType')
        const manualResult: SyncResult = {
          contentType: 'CaseSubType',
          success: true,
          items: manualSubTypes
        }
        
        if (existingIndex >= 0) {
          results[existingIndex] = manualResult
        } else {
          results.push(manualResult)
        }
        
        // Update caseSubTypeResult for lookup creation
        caseSubTypeResult = manualResult
      } catch (error) {
        console.error('🚨 Manual CaseSubType fetch failed:', error)
        console.error('🚨 This means CaseSubType content type may not exist in the API')
      }
    }
    
    // Build subtype ID mapping from CaseSubType results FIRST
    let subtypeLookup: Map<string, string> = new Map()
    let subtypeIdMap: Map<string, string> = new Map() // Maps govbuiltContentItemId -> local UUID
    
    const finalCaseSubTypeResult = results.find(r => r.contentType === 'CaseSubType')
    if (finalCaseSubTypeResult?.success && finalCaseSubTypeResult.items.length > 0) {
      const mappedSubtypes = mapApiItemsToStore('CaseSubType' as any, finalCaseSubTypeResult.items, current.value.data)
      
      // Create both lookups
      subtypeLookup = createSubtypeLookup(mappedSubtypes)
      
      // Create ID mapping: govbuiltContentItemId -> local UUID
      mappedSubtypes.forEach(subtype => {
        if (subtype.govbuiltContentItemId && subtype.id) {
          subtypeIdMap.set(subtype.govbuiltContentItemId, subtype.id)
        }
      })
    } else {
      console.log('🚨 DEBUG: No CaseSubType results found or empty!')
    }
    
    // Process successful syncs
    for (const result of results) {
      if (!result.success) {
        console.warn(`Failed to sync ${result.contentType}:`, result.error)
        continue
      }
      
      console.log(`Processing ${result.contentType} with ${result.items.length} items`)
      
// Map API items to store format - CRITICAL FIX: Pass both lookups for CaseType
       console.log(`🔍 DEBUG: Mapping ${result.contentType} with lookup size: ${subtypeLookup.size}, ID map size: ${subtypeIdMap.size}`)
       const mappedItems = mapApiItemsToStore(result.contentType as any, result.items, current.value.data, subtypeLookup, subtypeIdMap)
      
      console.log(`Mapped ${result.contentType}:`, mappedItems.length, 'items')
      
      // Get current project data
      const govData = current.value.data.govData || {}
      if (!govData.projectBuild) govData.projectBuild = {}
      
      // Merge with existing data based on content type
      switch (result.contentType) {
        case 'CaseStatus':
          if (!Array.isArray(govData.projectBuild.statuses)) govData.projectBuild.statuses = []
          const beforeStatuses = govData.projectBuild.statuses.length
          govData.projectBuild.statuses = mergeSyncedItems(govData.projectBuild.statuses, mappedItems)
          console.log(`CaseStatus: ${beforeStatuses} -> ${govData.projectBuild.statuses.length} items`)
          break
          
        case 'LicenseStatus':
          if (!Array.isArray(govData.projectBuild.licenseStatuses)) govData.projectBuild.licenseStatuses = []
          govData.projectBuild.licenseStatuses = mergeSyncedItems(govData.projectBuild.licenseStatuses, mappedItems)
          break
          
        case 'CaseType':
          if (!Array.isArray(govData.projectBuild.caseTypes)) govData.projectBuild.caseTypes = []
          govData.projectBuild.caseTypes = mergeSyncedItems(govData.projectBuild.caseTypes, mappedItems)
          

          break
          
        case 'LicenseType':
          if (!Array.isArray(govData.projectBuild.licenseTypes)) govData.projectBuild.licenseTypes = []
          govData.projectBuild.licenseTypes = mergeSyncedItems(govData.projectBuild.licenseTypes, mappedItems)
          break
          
        case 'InspectionType':
          if (!Array.isArray(govData.projectBuild.inspectionTypes)) govData.projectBuild.inspectionTypes = []
          govData.projectBuild.inspectionTypes = mergeSyncedItems(govData.projectBuild.inspectionTypes, mappedItems)
          break
          
        case 'CaseSubType':
          if (!Array.isArray(govData.projectBuild.subtypes)) govData.projectBuild.subtypes = []
          govData.projectBuild.subtypes = mergeSyncedItems(govData.projectBuild.subtypes, mappedItems)
          break
          
        case 'LicenseSubType':
          if (!Array.isArray(govData.projectBuild.licenseSubTypes)) govData.projectBuild.licenseSubTypes = []
          govData.projectBuild.licenseSubTypes = mergeSyncedItems(govData.projectBuild.licenseSubTypes, mappedItems)
          break
          
        case 'AccountingDetails':
          if (!govData.projectBuild.accounting) govData.projectBuild.accounting = { details: [] }
          if (!Array.isArray(govData.projectBuild.accounting.details)) govData.projectBuild.accounting.details = []
          govData.projectBuild.accounting.details = mergeSyncedItems(govData.projectBuild.accounting.details, mappedItems)
          break
      }
    }
    
    // Save updated project data
    await saveCurrent()
    
    console.log('Project data saved successfully')
    
    return results
  } catch (error) {
    console.error('API sync failed:', error)
    throw error
  }
}

  return {
    projects,
    current,
    projectsRoot,
    stagingUrl,
    apiConfigured,
    scanProjects,
    createProject,
    loadProject,
    saveCurrent,
    setProjectsRoot,
    chooseProjectsRoot,
    updateStagingUrl,
    updateApiConfigured,
    syncContentFromApi,
  }
})
