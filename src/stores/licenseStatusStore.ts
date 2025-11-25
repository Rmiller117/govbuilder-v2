// src/stores/licenseStatusStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'

export function useLicenseStatusStore() {
  const projectStore = useProjectStore()

  /* ------------------------------------------------------------------ */
  /*  Ensure we have a current project                                  */
  /* ------------------------------------------------------------------ */
  if (!projectStore.current) {
    console.warn('licenseStatusStore used without a loaded project')
  }

  /* ------------------------------------------------------------------ */
  /*  licenseStatuses live inside govData.licenseStatuses (create array if missing)   */
  /* ------------------------------------------------------------------ */
  const licenseStatuses = computed({
    get: () => {
      const gov = projectStore.current?.data.govData ?? {}
      // ← CREATE ARRAY IF MISSING
      if (!Array.isArray(gov.licenseStatuses)) gov.licenseStatuses = []
      return gov.licenseStatuses
    },
    set: (val) => {
      if (!projectStore.current) return
      const gov = projectStore.current.data.govData ?? {}
      gov.licenseStatuses = val
      projectStore.current.data.govData = gov
    },
  })

  /* ------------------------------------------------------------------ */
  /*  Public read‑only list                                             */
  /* ------------------------------------------------------------------ */
  const list = computed(() => licenseStatuses.value)

  /* ------------------------------------------------------------------ */
  /*  CRUD – all auto‑save to govbuilder.json                           */
  /* ------------------------------------------------------------------ */
  async function add(item: any) {
    licenseStatuses.value = [...licenseStatuses.value, { ...item, id: item.id || uuidv4() }]
    await projectStore.saveCurrent()   // ← FIX #2
  }

  async function update(id: string, data: Partial<any>) {
    licenseStatuses.value = licenseStatuses.value.map((s: any) =>
      s.id === id ? { ...s, ...data } : s
    )
    await projectStore.saveCurrent()   // ← FIX #2
  }

  async function remove(id: string) {
    licenseStatuses.value = licenseStatuses.value.filter((s: any) => s.id !== id)
    await projectStore.saveCurrent()   // ← FIX #2
  }

  /* ------------------------------------------------------------------ */
  /*  Helper: fresh licenseStatus object                                       */
  /* ------------------------------------------------------------------ */
  function createNew() {
    return {
      id: uuidv4(),
      title: '',
      hideFromStatusFlowChevron: false,
      notifyAssignedTeamMembers: false,
      notifyOtherTeamMembers: false,
      notifyApplicant: false,
      notifyAllContacts: false,
      notifyOtherRecipient: false,
      useDefaultAssignedTeamMembers: false,
      useDefaultOtherTeamMembers: false,
      useDefaultApplicant: false,
      useDefaultAllContacts: false,
      useDefaultOtherRecipient: false,
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Fallback auto‑save                                                */
  /* ------------------------------------------------------------------ */
  watch(
    licenseStatuses,
    async () => {
      await projectStore.saveCurrent()
    },
    { deep: true }
  )

  return {
    list,
    add,
    update,
    remove,
    createNew,
  }
}