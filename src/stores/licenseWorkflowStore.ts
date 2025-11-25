// src/stores/licenseWorkflowStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'

export interface LicenseWorkflowStep {
  id: string
  statusId: string
}

export interface LicenseWorkflow {
  id: string
  name: string
  steps: LicenseWorkflowStep[]
}

export function useLicenseWorkflowStore() {
  const projectStore = useProjectStore()

  const licenseWorkflows = computed<Record<string, LicenseWorkflow>>({
    get: () => projectStore.current?.data.govData.licenseWorkflows ?? {},
    set: (val) => {
      if (!projectStore.current) return
      projectStore.current.data.govData.licenseWorkflows = val
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