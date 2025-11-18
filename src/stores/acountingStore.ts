// src/stores/accountingStore.ts  (exactly the same logic, just renamed type)
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'

export interface AccountingDetail {
  id: string
  title: string          // required
  glKey: string          // required
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
      if (!gov.accounting) gov.accounting = { details: [] }
      if (!Array.isArray(gov.accounting.details)) gov.accounting.details = []
      return gov.accounting.details
    },
    set: (val) => {
      if (!projectStore.current) return
      projectStore.current.data.govData.accounting = { details: val }
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
    if (!confirm('Delete this accounting detail?')) return
    details.value = details.value.filter(d => d.id !== id)
    await projectStore.saveCurrent()
  }

  watch(details, () => projectStore.saveCurrent(), { deep: true })

  return { list, save, remove }
}