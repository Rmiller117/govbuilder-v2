// src/stores/workflowStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'

export interface WorkflowStep {
  id: string
  statusId: string
}

export interface Workflow {
  id: string
  govbuiltContentItemId?: string // Orchard Core ContentItemId for API sync
  name: string
  steps: WorkflowStep[]
}

export function useWorkflowStore() {
  const projectStore = useProjectStore()

const workflows = computed<Record<string, Workflow>>({
    get: () => {
      const gov = projectStore.current?.data.govData ?? {}
      
      // Ensure projectBuild exists
      if (!gov.projectBuild) gov.projectBuild = {}
      
      return gov.projectBuild.workflows ?? {}
    },
    set: (val) => {
      if (!projectStore.current) return
      const gov = projectStore.current.data.govData ?? {}
      
      // Ensure projectBuild exists
      if (!gov.projectBuild) gov.projectBuild = {}
      
      gov.projectBuild.workflows = val
      projectStore.current.data.govData = gov
    }
  })

  const list = computed(() => Object.values(workflows.value))

  async function save(workflow: Workflow) {
    workflows.value = {
      ...workflows.value,
      [workflow.id]: workflow
    }
    await projectStore.saveCurrent()
  }

  async function remove(id: string) {
    const { [id]: _, ...rest } = workflows.value
    workflows.value = rest
    await projectStore.saveCurrent()
  }

  function get(id: string) {
    return workflows.value[id]
  }

  watch(workflows, () => projectStore.saveCurrent(), { deep: true })

  return { list, save, remove, get }
}