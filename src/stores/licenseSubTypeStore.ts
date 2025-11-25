// src/stores/licenseSubTypeStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'

export interface LicenseSubType {
  id: string
  name: string
}

export function useLicenseSubTypeStore() {
  const projectStore = useProjectStore()

  /* ------------------------------------------------------------------ */
  /*  Ensure we have a current project                                  */
  /* ------------------------------------------------------------------ */
  if (!projectStore.current) {
    console.warn('licenseSubTypeStore used without a loaded project')
  }

  /* ------------------------------------------------------------------ */
  /*  licenseSubTypes live inside govData.licenseSubTypes (create array if missing)   */
  /* ------------------------------------------------------------------ */
  const licenseSubTypes = computed({
    get: () => {
      const gov = projectStore.current?.data.govData ?? {}
      // ← CREATE ARRAY IF MISSING
      if (!Array.isArray(gov.licenseSubTypes)) gov.licenseSubTypes = []
      return gov.licenseSubTypes
    },
    set: (val) => {
      if (!projectStore.current) return
      const gov = projectStore.current.data.govData ?? {}
      gov.licenseSubTypes = val
      projectStore.current.data.govData = gov
    },
  })

  /* ------------------------------------------------------------------ */
  /*  Public read‑only list                                             */
  /* ------------------------------------------------------------------ */
  const list = computed(() => licenseSubTypes.value)

  /* ------------------------------------------------------------------ */
  /*  CRUD – all auto‑save to govbuilder.json                           */
  /* ------------------------------------------------------------------ */
  async function add(name: string) {
    const newSubType: LicenseSubType = {
      id: uuidv4(),
      name: name.trim()
    }
    licenseSubTypes.value = [...licenseSubTypes.value, newSubType]
    await projectStore.saveCurrent()
  }

  async function remove(id: string) {
    licenseSubTypes.value = licenseSubTypes.value.filter(s => s.id !== id)
    await projectStore.saveCurrent()
  }

  /* ------------------------------------------------------------------ */
  /*  Fallback auto‑save                                                */
  /* ------------------------------------------------------------------ */
  watch(
    licenseSubTypes,
    async () => {
      await projectStore.saveCurrent()
    },
    { deep: true }
  )

  return {
    list,
    add,
    remove,
  }
}