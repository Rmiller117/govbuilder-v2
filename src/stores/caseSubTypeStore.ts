// src/stores/caseSubTypeStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'

export interface Subtype {
  id: string
  name: string
}

export function useCaseSubTypeStore() {
  const projectStore = useProjectStore()

  if (!projectStore.current) {
    console.warn('caseSubTypeStore used without a loaded project')
  }

  const subtypes = computed<Subtype[]>({
    get: () => {
      const gov = projectStore.current?.data.govData ?? {}
      if (!Array.isArray(gov.subtypes)) gov.subtypes = []
      return gov.subtypes
    },
    set: (val) => {
      if (!projectStore.current) return
      const gov = projectStore.current.data.govData ?? {}
      gov.subtypes = val
      projectStore.current.data.govData = gov
    },
  })

  const list = computed(() => subtypes.value)

  async function add(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (subtypes.value.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) return

    subtypes.value = [
      ...subtypes.value,
      { id: uuidv4(), name: trimmed }
    ]
    await projectStore.saveCurrent()
  }

  async function remove(id: string) {
    if (!confirm('Delete this subtype?')) return
    subtypes.value = subtypes.value.filter(s => s.id !== id)
    await projectStore.saveCurrent()
  }

  watch(subtypes, () => projectStore.saveCurrent(), { deep: true })

  return { list, add, remove }
}