// src/stores/inspectionTypeStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'

export interface InspectionType {
  id: string
  title: string
  durationHours: number        // e.g. 0.5 = 30 min
  workflowId?: string          // <-- the only email config now!
}

export function useInspectionTypeStore() {
  const projectStore = useProjectStore()

  const types = computed<InspectionType[]>({
    get: () => {
      const gov = projectStore.current?.data.govData ?? {}
      if (!gov.inspectionTypes) gov.inspectionTypes = []
      if (!Array.isArray(gov.inspectionTypes)) gov.inspectionTypes = []
      return gov.inspectionTypes
    },
    set: (val) => {
      if (!projectStore.current) return
      projectStore.current.data.govData.inspectionTypes = val
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
    if (!confirm('Delete this inspection type?')) return
    types.value = types.value.filter(t => t.id !== id)
    await projectStore.saveCurrent()
  }

  watch(types, () => projectStore.saveCurrent(), { deep: true })

  return { list, save, remove }
}