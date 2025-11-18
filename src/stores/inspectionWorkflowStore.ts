// src/stores/inspectionWorkflowStore.ts
import { computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'

export interface NotificationConfig {
  enabled: boolean
  appendAssignTeamMembers?: boolean
  notifyAssignedTeamMembers?: boolean
  notifyOtherTeamMembers?: boolean
  notifyApplicant?: boolean
  notifyAllContacts?: boolean
  notifyOtherRecipient?: boolean
  doNotSendMailWhenApplicantAndApproverSame?: boolean
  attachPermitTypes?: boolean
  attachFormLetters?: boolean
}

export interface InspectionWorkflow {
  id: string
  name: string
  AcceptedInvite?: NotificationConfig
  Approved?: NotificationConfig
  CancelledByAdmin?: NotificationConfig
  CancelledByUser?: NotificationConfig
  Completed?: NotificationConfig
  DeclinedInvite?: NotificationConfig
  Failed?: NotificationConfig
  InProgress?: NotificationConfig
  NotRequired?: NotificationConfig
  Submitted?: NotificationConfig
}

export function useInspectionWorkflowStore() {
  const projectStore = useProjectStore()

  const workflows = computed<InspectionWorkflow[]>({
    get: () => {
      const gov = projectStore.current?.data.govData ?? {}
      if (!gov.inspectionWorkflows) gov.inspectionWorkflows = []
      if (!Array.isArray(gov.inspectionWorkflows)) gov.inspectionWorkflows = []
      return gov.inspectionWorkflows
    },
    set: (val) => {
      if (!projectStore.current) return
      projectStore.current.data.govData.inspectionWorkflows = val
    },
  })

  const list = computed(() => workflows.value)

  async function save(workflow: InspectionWorkflow) {
    const existing = workflows.value.findIndex(w => w.id === workflow.id)
    const cleaned = {
      ...workflow,
      id: workflow.id || uuidv4(),
      name: workflow.name.trim(),
    }

    if (existing >= 0) {
      workflows.value[existing] = cleaned
    } else {
      workflows.value.push(cleaned)
    }

    await projectStore.saveCurrent()
  }

  async function remove(id: string) {
    if (!confirm('Delete this inspection workflow?')) return
    workflows.value = workflows.value.filter(w => w.id !== id)
    await projectStore.saveCurrent()
  }

  watch(workflows, () => projectStore.saveCurrent(), { deep: true })

  return { list, save, remove }
}