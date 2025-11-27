// src/stores/licenseWorkflowStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'

export interface LicenseWorkflowStep {
  id: string
  statusId: string
}

export interface LicenseWorkflow {
  id: string
  govbuiltContentItemId?: string // Orchard Core ContentItemId for API sync
  name: string
  steps: LicenseWorkflowStep[]
}

export function useLicenseWorkflowStore() {
  const projectStore = useProjectStore()

const licenseWorkflows = computed<Record<string, LicenseWorkflow>>({
    get: () => {
      const gov = projectStore.current?.data.govData ?? {}
      
      // Ensure projectBuild exists
      if (!gov.projectBuild) gov.projectBuild = {}
      
      return gov.projectBuild.licenseWorkflows ?? {}
    },
    set: (val) => {
      if (!projectStore.current) return
      const gov = projectStore.current.data.govData ?? {}
      
      // Ensure projectBuild exists
      if (!gov.projectBuild) gov.projectBuild = {}
      
      gov.projectBuild.licenseWorkflows = val
      projectStore.current.data.govData = gov
    }
  })

  const list = computed(() => Object.values(licenseWorkflows.value))

  async function save(workflow: LicenseWorkflow) {
    licenseWorkflows.value = {
      ...licenseWorkflows.value,
      [workflow.id]: workflow
    }
    await projectStore.saveCurrent()
  }

  async function remove(id: string) {
    const { [id]: _, ...rest } = licenseWorkflows.value
    licenseWorkflows.value = rest
    await projectStore.saveCurrent()
  }

  function get(id: string) {
    return licenseWorkflows.value[id]
  }

  watch(licenseWorkflows, () => projectStore.saveCurrent(), { deep: true })

  return { list, save, remove, get }
}