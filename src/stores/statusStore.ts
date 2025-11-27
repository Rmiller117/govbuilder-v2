// src/stores/statusStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'   // npm i uuid

export function useStatusStore() {
  const projectStore = useProjectStore()

  if (!projectStore.current) {
    console.warn('statusStore used without a loaded project')
  }
// Set up the status array in our overall project store (Idk what I'm doing, I'm used to databases lol)
  const statuses = computed({
    get: () => {
      const gov = projectStore.current?.data.govData ?? {}
      
      // Ensure projectBuild exists
      if (!gov.projectBuild) gov.projectBuild = {}
      
      if (!Array.isArray(gov.projectBuild.statuses)) gov.projectBuild.statuses = []
      return gov.projectBuild.statuses
    },
    set: (val) => {
      if (!projectStore.current) return
      const gov = projectStore.current.data.govData ?? {}
      
      // Ensure projectBuild exists
      if (!gov.projectBuild) gov.projectBuild = {}
      
      gov.projectBuild.statuses = val
      projectStore.current.data.govData = gov
    },
  })

// Read-Only list we can use to view them on the statuses page and the workflow modal and stuff
  const list = computed(() => statuses.value)

 
  async function add(item: any) {
    statuses.value = [...statuses.value, { ...item, id: item.id || uuidv4() }]
    await projectStore.saveCurrent()   
  }

  async function update(id: string, data: Partial<any>) {
    statuses.value = statuses.value.map((s: any) =>
      s.id === id ? { ...s, ...data } : s
    )
    await projectStore.saveCurrent() 
  }

  async function remove(id: string) {
    statuses.value = statuses.value.filter((s: any) => s.id !== id)
    await projectStore.saveCurrent() 
  }

// Creates a new status in the array and assigns our own uuid
  function createNew() {
    return {
      id: uuidv4(), // Not a Govbuilt ID, although I should create a field for them now that sync exists
      govbuiltContentItemId: undefined, // Orchard Core ContentItemId for API sync
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

// Backup auto-save function. Idk if we even need this.
  watch(
    statuses,
    async () => {
      await projectStore.saveCurrent()
    },
    { deep: true }
  )
// Exports!
  return {
    list,
    add,
    update,
    remove,
    createNew,
  }
}