// src/stores/caseTypeStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'

// In your CaseType interface
export interface CaseType {
  id: string
  govbuiltContentItemId?: string // Orchard Core ContentItemId for API sync
  title: string
  prefix?: string
  suffix?: string
  autoNumber: boolean
  autoLicense: boolean
  subtypes: string[]
  workflowId?: string  
}

export function useCaseTypeStore() {
  const projectStore = useProjectStore()

  if (!projectStore.current) {
    console.warn('caseTypeStore used without a loaded project')
  }

const caseTypes = computed<CaseType[]>({
    get: () => {
      if (!projectStore.current?.data.govData?.projectBuild) {
        return []
      }
      if (!Array.isArray(projectStore.current.data.govData.projectBuild.caseTypes)) {
        projectStore.current.data.govData.projectBuild.caseTypes = []
      }
      return projectStore.current.data.govData.projectBuild.caseTypes
    },
    set: (val) => {
      if (!projectStore.current) return
      if (!projectStore.current.data.govData) {
        projectStore.current.data.govData = {}
      }
      if (!projectStore.current.data.govData.projectBuild) {
        projectStore.current.data.govData.projectBuild = {}
      }
      projectStore.current.data.govData.projectBuild.caseTypes = val
    },
  })

  const list = computed(() => caseTypes.value)

  async function save(type: CaseType) {
    const existing = caseTypes.value.findIndex(t => t.id === type.id)
    if (existing >= 0) {
      caseTypes.value[existing] = { ...type }
    } else {
      caseTypes.value.push({ ...type, id: type.id || uuidv4() })
    }
    await projectStore.saveCurrent()
  }

  async function remove(id: string) {
    caseTypes.value = caseTypes.value.filter(t => t.id !== id)
    await projectStore.saveCurrent()
  }

  watch(caseTypes, () => projectStore.saveCurrent(), { deep: true })

  return { list, save, remove }
}