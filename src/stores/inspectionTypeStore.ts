// src/stores/inspectionTypeStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'

export interface InspectionType {
  id: string
  govbuiltContentItemId?: string // Orchard Core ContentItemId for API sync
  title: string
  durationHours: number        // e.g. 0.5 = 30 min
  workflowId?: string          // <-- the only email config now!
}

export function useInspectionTypeStore() {
  const projectStore = useProjectStore()

const types = computed<InspectionType[]>({
    get: () => {
      const gov = projectStore.current?.data.govData ?? {}
      
      // Ensure projectBuild exists
      if (!gov.projectBuild) gov.projectBuild = {}
      
      if (!gov.projectBuild.inspectionTypes) gov.projectBuild.inspectionTypes = []
      if (!Array.isArray(gov.projectBuild.inspectionTypes)) gov.projectBuild.inspectionTypes = []
      return gov.projectBuild.inspectionTypes
    },
    set: (val) => {
      if (!projectStore.current) return
      const gov = projectStore.current.data.govData ?? {}
      
      // Ensure projectBuild exists
      if (!gov.projectBuild) gov.projectBuild = {}
      
      gov.projectBuild.inspectionTypes = val
      projectStore.current.data.govData = gov
    },
  })

  const list = computed(() => types.value)

  async function save(type: InspectionType) {
    const existing = types.value.findIndex(t => t.id === type.id)
    const cleaned = {
      ...type,
      id: type.id || uuidv4(),
      title: type.title.trim(),
    }

    if (existing >= 0) {
      types.value[existing] = cleaned
    } else {
      types.value.push(cleaned)
    }

    await projectStore.saveCurrent()
  }

  async function remove(id: string) {
    types.value = types.value.filter(t => t.id !== id)
    await projectStore.saveCurrent()
  }

  watch(types, () => projectStore.saveCurrent(), { deep: true })

  return { list, save, remove }
}