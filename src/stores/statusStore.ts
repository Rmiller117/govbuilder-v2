// src/stores/statusStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'   // npm i uuid

export function useStatusStore() {
  const projectStore = useProjectStore()

  /* ------------------------------------------------------------------ */
  /*  Ensure we have a current project                                  */
  /* ------------------------------------------------------------------ */
  if (!projectStore.current) {
    console.warn('statusStore used without a loaded project')
  }

  /* ------------------------------------------------------------------ */
  /*  statuses live inside govData.statuses (create array if missing)   */
  /* ------------------------------------------------------------------ */
  const statuses = computed({
    get: () => {
      const gov = projectStore.current?.data.govData ?? {}
      // ← CREATE ARRAY IF MISSING
      if (!Array.isArray(gov.statuses)) gov.statuses = []
      return gov.statuses
    },
    set: (val) => {
      if (!projectStore.current) return
      const gov = projectStore.current.data.govData ?? {}
      gov.statuses = val
      projectStore.current.data.govData = gov
    },
  })

  /* ------------------------------------------------------------------ */
  /*  Public read‑only list                                             */
  /* ------------------------------------------------------------------ */
  const list = computed(() => statuses.value)

  /* ------------------------------------------------------------------ */
  /*  CRUD – all auto‑save to govbuilder.json                           */
  /* ------------------------------------------------------------------ */
  async function add(item: any) {
    statuses.value = [...statuses.value, { ...item, id: item.id || uuidv4() }]
    await projectStore.saveCurrent()   // ← FIX #2
  }

  async function update(id: string, data: Partial<any>) {
    statuses.value = statuses.value.map((s: any) =>
      s.id === id ? { ...s, ...data } : s
    )
    await projectStore.saveCurrent()   // ← FIX #2
  }

  async function remove(id: string) {
    statuses.value = statuses.value.filter((s: any) => s.id !== id)
    await projectStore.saveCurrent()   // ← FIX #2
  }

  /* ------------------------------------------------------------------ */
  /*  Helper: fresh status object                                       */
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
    statuses,
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