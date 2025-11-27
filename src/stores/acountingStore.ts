// src/stores/accountingStore.ts  (exactly the same logic, just renamed type)
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'

export interface AccountingDetail {
  id: string
  govbuiltContentItemId?: string // Orchard Core ContentItemId for API sync
  title: string         
  glKey: string          
  tranCode?: string
  feeCode?: string
  feeAbbreviation?: string
  notes?: string
  debitAccountNumber?: string
  debitAccountTransferNumber?: string
  feeDetails?: string
}

export function useAccountingStore() {
  const projectStore = useProjectStore()

const details = computed<AccountingDetail[]>({
    get: () => {
      const gov = projectStore.current?.data.govData ?? {}
      
      // Ensure projectBuild exists
      if (!gov.projectBuild) gov.projectBuild = {}
      
      if (!gov.projectBuild.accounting) gov.projectBuild.accounting = { details: [] }
      if (!Array.isArray(gov.projectBuild.accounting.details)) gov.projectBuild.accounting.details = []
      return gov.projectBuild.accounting.details
    },
    set: (val) => {
      if (!projectStore.current) return
      const gov = projectStore.current.data.govData ?? {}
      
      // Ensure projectBuild exists
      if (!gov.projectBuild) gov.projectBuild = {}
      
      gov.projectBuild.accounting = { details: val }
      projectStore.current.data.govData = gov
    },
  })

  const list = computed(() => details.value)

  async function save(detail: AccountingDetail) {
    const trimmedTitle = detail.title?.trim()
    const trimmedGlKey = detail.glKey?.trim()
    if (!trimmedTitle || !trimmedGlKey) {
      alert('Title and GL Key are required')
      return false
    }

    const existing = details.value.findIndex(d => d.id === detail.id)
    const cleaned: AccountingDetail = {
      ...detail,
      id: detail.id || uuidv4(),
      title: trimmedTitle,
      glKey: trimmedGlKey,
    }

    if (existing >= 0) {
      details.value[existing] = cleaned
    } else {
      details.value.push(cleaned)
    }

    await projectStore.saveCurrent()
    return true
  }

  async function remove(id: string) {
    details.value = details.value.filter(d => d.id !== id)
    await projectStore.saveCurrent()
  }

  watch(details, () => projectStore.saveCurrent(), { deep: true })

  return { list, save, remove }
}