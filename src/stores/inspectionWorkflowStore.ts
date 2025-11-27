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
  notifyAssignedTeamMembersTemplate?: string
  notifyOtherTeamMembersTemplate?: string
  notifyApplicantTemplate?: string
  notifyAllContactsTemplate?: string
  notifyOtherRecipientTemplate?: string
}

export interface InspectionWorkflow {
  id: string
  govbuiltContentItemId?: string // Orchard Core ContentItemId for API sync
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
      
      // Ensure projectBuild exists
      if (!gov.projectBuild) gov.projectBuild = {}
      
      if (!gov.projectBuild.inspectionWorkflows) gov.projectBuild.inspectionWorkflows = []
      if (!Array.isArray(gov.projectBuild.inspectionWorkflows)) gov.projectBuild.inspectionWorkflows = []
      return gov.projectBuild.inspectionWorkflows
    },
    set: (val) => {
      if (!projectStore.current) return
      const gov = projectStore.current.data.govData ?? {}
      
      // Ensure projectBuild exists
      if (!gov.projectBuild) gov.projectBuild = {}
      
      gov.projectBuild.inspectionWorkflows = val
      projectStore.current.data.govData = gov
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
    workflows.value = workflows.value.filter(w => w.id !== id)
    await projectStore.saveCurrent()
  }

  watch(workflows, () => {
  console.log('Workflows changed:', workflows.value) // Add this line for debugging
  projectStore.saveCurrent()
}, { deep: true })

  return { list, save, remove }
}
