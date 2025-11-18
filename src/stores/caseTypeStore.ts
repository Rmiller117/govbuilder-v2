// src/stores/caseTypeStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'

// In your CaseType interface
export interface CaseType {
  id: string
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
      const gov = projectStore.current?.data.govData ?? {}
      if (!Array.isArray(gov.caseTypes)) gov.caseTypes = []
      return gov.caseTypes
    },
    set: (val) => {
      if (!projectStore.current) return
      const gov = projectStore.current.data.govData ?? {}
      gov.caseTypes = val
      projectStore.current.data.govData = gov
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
    if (!confirm('Delete this case type?')) return
    caseTypes.value = caseTypes.value.filter(t => t.id !== id)
    await projectStore.saveCurrent()
  }

  watch(caseTypes, () => projectStore.saveCurrent(), { deep: true })

  return { list, save, remove }
}