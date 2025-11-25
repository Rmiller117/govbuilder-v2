// src/stores/licenseTypeStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'

export interface LicenseType {
  id: string
  title: string
  prefix?: string
  suffix?: string
  autoNumber: boolean
  autoLicense: boolean
  subtypes: string[]
  workflowId?: string
}

export function useLicenseTypeStore() {
  const projectStore = useProjectStore()

  /* ------------------------------------------------------------------ */
  /*  Ensure we have a current project                                  */
  /* ------------------------------------------------------------------ */
  if (!projectStore.current) {
    console.warn('licenseTypeStore used without a loaded project')
  }

  /* ------------------------------------------------------------------ */
  /*  licenseTypes live inside govData.licenseTypes (create array if missing)   */
  /* ------------------------------------------------------------------ */
  const licenseTypes = computed({
    get: () => {
      const gov = projectStore.current?.data.govData ?? {}
      // ← CREATE ARRAY IF MISSING
      if (!Array.isArray(gov.licenseTypes)) gov.licenseTypes = []
      return gov.licenseTypes
    },
    set: (val) => {
      if (!projectStore.current) return
      const gov = projectStore.current.data.govData ?? {}
      gov.licenseTypes = val
      projectStore.current.data.govData = gov
    },
  })

  /* ------------------------------------------------------------------ */
  /*  Public read‑only list                                             */
  /* ------------------------------------------------------------------ */
  const list = computed(() => licenseTypes.value)

  /* ------------------------------------------------------------------ */
  /*  CRUD – all auto‑save to govbuilder.json                           */
  /* ------------------------------------------------------------------ */
  async function save(item: LicenseType) {
    const existing = licenseTypes.value.findIndex(t => t.id === item.id)
    const cleaned = {
      ...item,
      id: item.id || uuidv4(),
      title: item.title.trim(),
    }

    if (existing >= 0) {
      licenseTypes.value[existing] = cleaned
    } else {
      licenseTypes.value.push(cleaned)
    }

    await projectStore.saveCurrent()
    return true
  }

  async function remove(id: string) {
    licenseTypes.value = licenseTypes.value.filter(t => t.id !== id)
    await projectStore.saveCurrent()
  }

  /* ------------------------------------------------------------------ */
  /*  Helper: fresh license type object                                   */
  /* ------------------------------------------------------------------ */
  function createNew() {
    return {
      id: uuidv4(),
      title: '',
      prefix: '',
      suffix: '',
      autoNumber: true,
      autoLicense: false,
      subtypes: [],
      workflowId: undefined
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Fallback auto‑save                                                */
  /* ------------------------------------------------------------------ */
  watch(
    licenseTypes,
    async () => {
      await projectStore.saveCurrent()
    },
    { deep: true }
  )

  return {
    list,
    save,
    remove,
    createNew,
  }
}