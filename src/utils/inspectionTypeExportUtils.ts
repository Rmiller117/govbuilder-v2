// Utility functions for exporting inspection types to Orchard Core recipe format
import { useInspectionTypeStore } from '@/stores/inspectionTypeStore'
import { useProjectStore } from '@/stores/projectStore'
import { invoke } from '@tauri-apps/api/core'

export interface InspectionTypeExport {
  ContentItemId: string
  ContentItemVersionId: string
  ContentType: string
  DisplayText: string
  Latest: boolean
  Published: boolean
  ModifiedUtc: string
  PublishedUtc: string
  CreatedUtc: string
  Owner: string
  Author: string
  InspectionType: {
    Title: string
    ContentItemId: null
    DefaultInspectionTime: number
    NextInspectionTimeinMinutes: null
    TeamMemberIds: null
    AdvancedFormId: null
    ReturnUrl: null
    SelectedTeamMembers: null
    AppointmentStatuses: string
    IsAppointmentStatusesOrderedList: boolean
    IsAutoAcceptRequests: boolean
    IsHealthFoodInspection: boolean
  }
  TitlePart: {}
}

export interface OrchardCoreInspectionTypeRecipe {
  name: string
  displayName: string
  description: string
  author: string
  website: string
  version: string
  issetuprecipe: boolean
  categories: string[]
  tags: string[]
  steps: Array<{
    name: string
    data: InspectionTypeExport[]
  }>
}

// Hardcoded appointment statuses from the example
const APPOINTMENT_STATUSES = "[{\"ContentItemId\":\"48a28zntgn8yh2pcxk2c61gdc7\",\"DisplayText\":\"Accepted Invite\",\"PermitTypeId\":\"\",\"FormLetterId\":\"\",\"AssignedTeamMembers\":[],\"IsAppendAssignTeamMembers\":false,\"IsTeamMembersNotified\":false,\"TeamEmailSubject\":\"\",\"TeamEmailBody\":\"\",\"IsApplicantNotified\":false,\"ApplicantEmailSubject\":\"\",\"ApplicantEmailBody\":\"\",\"HideStatusFromStatusFlowChevrons\":false,\"IsContactsNotified\":false,\"ContactsEmailSubject\":\"\",\"ContactsEmailBody\":\"\",\"IsAttachPermit\":false,\"IsAttachFormLetter\":false,\"IsMasterStatusLabel\":false,\"IsOtherTeamMembersNotified\":false,\"OtherTeamMemberEmail\":\"\",\"OtherTeamMemberSubject\":\"\",\"OtherTeamMembers\":[],\"IsApproverAndApplicantAreSame\":false,\"OtherTeamMemberRecipientEmail\":\"\",\"IsNotifyOtherRecipient\":false,\"OtherRecipientEmail\":\"\",\"OtherEmailSubject\":\"\",\"OtherNotificationEmailBody\":\"\",\"AppendTeamMemberRecipientEmail\":\"\"},{\"ContentItemId\":\"41pt8bp9xvys03bckr90x9j5nn\",\"DisplayText\":\"Approved\",\"PermitTypeId\":\"\",\"FormLetterId\":\"\",\"AssignedTeamMembers\":[],\"IsAppendAssignTeamMembers\":false,\"IsTeamMembersNotified\":false,\"TeamEmailSubject\":\"\",\"TeamEmailBody\":\"\",\"IsApplicantNotified\":false,\"ApplicantEmailSubject\":\"\",\"ApplicantEmailBody\":\"\",\"HideStatusFromStatusFlowChevrons\":false,\"IsContactsNotified\":false,\"ContactsEmailSubject\":\"\",\"ContactsEmailBody\":\"\",\"IsAttachPermit\":false,\"IsAttachFormLetter\":false,\"IsMasterStatusLabel\":false,\"IsOtherTeamMembersNotified\":false,\"OtherTeamMemberEmail\":\"\",\"OtherTeamMemberSubject\":\"\",\"OtherTeamMembers\":[],\"IsApproverAndApplicantAreSame\":false,\"OtherTeamMemberRecipientEmail\":\"\",\"IsNotifyOtherRecipient\":false,\"OtherRecipientEmail\":\"\",\"OtherEmailSubject\":\"\",\"OtherNotificationEmailBody\":\"\",\"AppendTeamMemberRecipientEmail\":\"\"},{\"ContentItemId\":\"44vsx7fdqeftwz89fa9hymc0dz\",\"DisplayText\":\"Cancelled By Admin\",\"PermitTypeId\":\"\",\"FormLetterId\":\"\",\"AssignedTeamMembers\":[],\"IsAppendAssignTeamMembers\":false,\"IsTeamMembersNotified\":false,\"TeamEmailSubject\":\"\",\"TeamEmailBody\":\"\",\"IsApplicantNotified\":false,\"ApplicantEmailSubject\":\"\",\"ApplicantEmailBody\":\"\",\"HideStatusFromStatusFlowChevrons\":false,\"IsContactsNotified\":false,\"ContactsEmailSubject\":\"\",\"ContactsEmailBody\":\"\",\"IsAttachPermit\":false,\"IsAttachFormLetter\":false,\"IsMasterStatusLabel\":false,\"IsOtherTeamMembersNotified\":false,\"OtherTeamMemberEmail\":\"\",\"OtherTeamMemberSubject\":\"\",\"OtherTeamMembers\":[],\"IsApproverAndApplicantAreSame\":false,\"OtherTeamMemberRecipientEmail\":\"\",\"IsNotifyOtherRecipient\":false,\"OtherRecipientEmail\":\"\",\"OtherEmailSubject\":\"\",\"OtherNotificationEmailBody\":\"\",\"AppendTeamMemberRecipientEmail\":\"\"},{\"ContentItemId\":\"48d2tkztqkzdz6vmpr1h0psb5z\",\"DisplayText\":\"Cancelled By User\",\"PermitTypeId\":\"\",\"FormLetterId\":\"\",\"AssignedTeamMembers\":[],\"IsAppendAssignTeamMembers\":false,\"IsTeamMembersNotified\":false,\"TeamEmailSubject\":\"\",\"TeamEmailBody\":\"\",\"IsApplicantNotified\":false,\"ApplicantEmailSubject\":\"\",\"ApplicantEmailBody\":\"\",\"HideStatusFromStatusFlowChevrons\":false,\"IsContactsNotified\":false,\"ContactsEmailSubject\":\"\",\"ContactsEmailBody\":\"\",\"IsAttachPermit\":false,\"IsAttachFormLetter\":false,\"IsMasterStatusLabel\":false,\"IsOtherTeamMembersNotified\":false,\"OtherTeamMemberEmail\":\"\",\"OtherTeamMemberSubject\":\"\",\"OtherTeamMembers\":[],\"IsApproverAndApplicantAreSame\":false,\"OtherTeamMemberRecipientEmail\":\"\",\"IsNotifyOtherRecipient\":false,\"OtherRecipientEmail\":\"\",\"OtherEmailSubject\":\"\",\"OtherNotificationEmailBody\":\"\",\"AppendTeamMemberRecipientEmail\":\"\"},{\"ContentItemId\":\"4xkd682emhnjgyqew8ks57wbw4\",\"DisplayText\":\"Completed\",\"PermitTypeId\":\"\",\"FormLetterId\":\"\",\"AssignedTeamMembers\":[],\"IsAppendAssignTeamMembers\":false,\"IsTeamMembersNotified\":false,\"TeamEmailSubject\":\"\",\"TeamEmailBody\":\"\",\"IsApplicantNotified\":false,\"ApplicantEmailSubject\":\"\",\"ApplicantEmailBody\":\"\",\"HideStatusFromStatusFlowChevrons\":false,\"IsContactsNotified\":false,\"ContactsEmailSubject\":\"\",\"ContactsEmailBody\":\"\",\"IsAttachPermit\":false,\"IsAttachFormLetter\":false,\"IsMasterStatusLabel\":false,\"IsOtherTeamMembersNotified\":false,\"OtherTeamMemberEmail\":\"\",\"OtherTeamMemberSubject\":\"\",\"OtherTeamMembers\":[],\"IsApproverAndApplicantAreSame\":false,\"OtherTeamMemberRecipientEmail\":\"\",\"IsNotifyOtherRecipient\":false,\"OtherRecipientEmail\":\"\",\"OtherEmailSubject\":\"\",\"OtherNotificationEmailBody\":\"\",\"AppendTeamMemberRecipientEmail\":\"\"},{\"ContentItemId\":\"463kzne59cppvt6kjdyyb51bw7\",\"DisplayText\":\"Declined Invite\",\"PermitTypeId\":\"\",\"FormLetterId\":\"\",\"AssignedTeamMembers\":[],\"IsAppendAssignTeamMembers\":false,\"IsTeamMembersNotified\":false,\"TeamEmailSubject\":\"\",\"TeamEmailBody\":\"\",\"IsApplicantNotified\":false,\"ApplicantEmailSubject\":\"\",\"ApplicantEmailBody\":\"\",\"HideStatusFromStatusFlowChevrons\":false,\"IsContactsNotified\":false,\"ContactsEmailSubject\":\"\",\"ContactsEmailBody\":\"\",\"IsAttachPermit\":false,\"IsAttachFormLetter\":false,\"IsMasterStatusLabel\":false,\"IsOtherTeamMembersNotified\":false,\"OtherTeamMemberEmail\":\"\",\"OtherTeamMemberSubject\":\"\",\"OtherTeamMembers\":[],\"IsApproverAndApplicantAreSame\":false,\"OtherTeamMemberRecipientEmail\":\"\",\"IsNotifyOtherRecipient\":false,\"OtherRecipientEmail\":\"\",\"OtherEmailSubject\":\"\",\"OtherNotificationEmailBody\":\"\",\"AppendTeamMemberRecipientEmail\":\"\"},{\"ContentItemId\":\"43sctnx7qvngqyqrkwq6xw815p\",\"DisplayText\":\"Failed\",\"PermitTypeId\":\"\",\"FormLetterId\":\"\",\"AssignedTeamMembers\":[],\"IsAppendAssignTeamMembers\":false,\"IsTeamMembersNotified\":false,\"TeamEmailSubject\":\"\",\"TeamEmailBody\":\"\",\"IsApplicantNotified\":false,\"ApplicantEmailSubject\":\"\",\"ApplicantEmailBody\":\"\",\"HideStatusFromStatusFlowChevrons\":false,\"IsContactsNotified\":false,\"ContactsEmailSubject\":\"\",\"ContactsEmailBody\":\"\",\"IsAttachPermit\":false,\"IsAttachFormLetter\":false,\"IsMasterStatusLabel\":false,\"IsOtherTeamMembersNotified\":false,\"OtherTeamMemberEmail\":\"\",\"OtherTeamMemberSubject\":\"\",\"OtherTeamMembers\":[],\"IsApproverAndApplicantAreSame\":false,\"OtherTeamMemberRecipientEmail\":\"\",\"IsNotifyOtherRecipient\":false,\"OtherRecipientEmail\":\"\",\"OtherEmailSubject\":\"\",\"OtherNotificationEmailBody\":\"\",\"AppendTeamMemberRecipientEmail\":\"\"},{\"ContentItemId\":\"4was9m28f4xpb6qka3z9hz16w8\",\"DisplayText\":\"In Progress\",\"PermitTypeId\":\"\",\"FormLetterId\":\"\",\"AssignedTeamMembers\":[],\"IsAppendAssignTeamMembers\":false,\"IsTeamMembersNotified\":false,\"TeamEmailSubject\":\"\",\"TeamEmailBody\":\"\",\"IsApplicantNotified\":false,\"ApplicantEmailSubject\":\"\",\"ApplicantEmailBody\":\"\",\"HideStatusFromStatusFlowChevrons\":false,\"IsContactsNotified\":false,\"ContactsEmailSubject\":\"\",\"ContactsEmailBody\":\"\",\"IsAttachPermit\":false,\"IsAttachFormLetter\":false,\"IsMasterStatusLabel\":false,\"IsOtherTeamMembersNotified\":false,\"OtherTeamMemberEmail\":\"\",\"OtherTeamMemberSubject\":\"\",\"OtherTeamMembers\":[],\"IsApproverAndApplicantAreSame\":false,\"OtherTeamMemberRecipientEmail\":\"\",\"IsNotifyOtherRecipient\":false,\"OtherRecipientEmail\":\"\",\"OtherEmailSubject\":\"\",\"OtherNotificationEmailBody\":\"\",\"AppendTeamMemberRecipientEmail\":\"\"},{\"ContentItemId\":\"4bpd5medqb36p77m0s3m0wrtc9\",\"DisplayText\":\"Not Required\",\"PermitTypeId\":\"\",\"FormLetterId\":\"\",\"AssignedTeamMembers\":[],\"IsAppendAssignTeamMembers\":false,\"IsTeamMembersNotified\":false,\"TeamEmailSubject\":\"\",\"TeamEmailBody\":\"\",\"IsApplicantNotified\":false,\"ApplicantEmailSubject\":\"\",\"ApplicantEmailBody\":\"\",\"HideStatusFromStatusFlowChevrons\":false,\"IsContactsNotified\":false,\"ContactsEmailSubject\":\"\",\"ContactsEmailBody\":\"\",\"IsAttachPermit\":false,\"IsAttachFormLetter\":false,\"IsMasterStatusLabel\":false,\"IsOtherTeamMembersNotified\":false,\"OtherTeamMemberEmail\":\"\",\"OtherTeamMemberSubject\":\"\",\"OtherTeamMembers\":[],\"IsApproverAndApplicantAreSame\":false,\"OtherTeamMemberRecipientEmail\":\"\",\"IsNotifyOtherRecipient\":false,\"OtherRecipientEmail\":\"\",\"OtherEmailSubject\":\"\",\"OtherNotificationEmailBody\":\"\",\"AppendTeamMemberRecipientEmail\":\"\"},{\"ContentItemId\":\"4m3dmtm4h112avn0bmw2tamwdx\",\"DisplayText\":\"Submitted\",\"PermitTypeId\":\"\",\"FormLetterId\":\"\",\"AssignedTeamMembers\":[],\"IsAppendAssignTeamMembers\":false,\"IsTeamMembersNotified\":false,\"TeamEmailSubject\":\"\",\"TeamEmailBody\":\"\",\"IsApplicantNotified\":false,\"ApplicantEmailSubject\":\"\",\"ApplicantEmailBody\":\"\",\"HideStatusFromStatusFlowChevrons\":false,\"IsContactsNotified\":false,\"ContactsEmailSubject\":\"\",\"ContactsEmailBody\":\"\",\"IsAttachPermit\":false,\"IsAttachFormLetter\":false,\"IsMasterStatusLabel\":false,\"IsOtherTeamMembersNotified\":false,\"OtherTeamMemberEmail\":\"\",\"OtherTeamMemberSubject\":\"\",\"OtherTeamMembers\":[],\"IsApproverAndApplicantAreSame\":false,\"OtherTeamMemberRecipientEmail\":\"\",\"IsNotifyOtherRecipient\":false,\"OtherRecipientEmail\":\"\",\"OtherEmailSubject\":\"\",\"OtherNotificationEmailBody\":\"\",\"AppendTeamMemberRecipientEmail\":\"\"}]"

/**
 * Build Orchard Core recipe JSON string for inspection types
 */
function buildGovBuiltImportString(list: any[]): string {
  const indent = (level: number) => '  '.repeat(level)

  const itemToString = (type: any) => {
    // use JSON.stringify for values to ensure safe escaping
    const title = JSON.stringify(type.title || null)
    const defaultInspectionTime = Math.round((type.durationHours || 0) * 60) // Convert hours to minutes

    // Build object text in EXACT desired order (keys ordered as written)
    return [
      '{',
      `${indent(3)}"ContentItemId": "[js: uuid()]",`,
      `${indent(3)}"ContentItemVersionId": "[js: uuid()]",`,
      `${indent(3)}"ContentType": "InspectionType",`,
      `${indent(3)}"DisplayText": ${title},`,
      `${indent(3)}"Latest": true,`,
      `${indent(3)}"Published": true,`,
      `${indent(3)}"ModifiedUtc": "[js: new Date()]",`,
      `${indent(3)}"PublishedUtc": "[js: new Date()]",`,
      `${indent(3)}"CreatedUtc": "[js: new Date()]",`,
      `${indent(3)}"Owner": "[js: parameters('AdminUserId')]",`,
      `${indent(3)}"Author": "[js: parameters('AdminUsername')]",`,
      `${indent(3)}"InspectionType": {`,
      `${indent(4)}"Title": ${title},`,
      `${indent(4)}"ContentItemId": null,`,
      `${indent(4)}"DefaultInspectionTime": ${defaultInspectionTime},`,
      `${indent(4)}"NextInspectionTimeinMinutes": null,`,
      `${indent(4)}"TeamMemberIds": null,`,
      `${indent(4)}"AdvancedFormId": null,`,
      `${indent(4)}"ReturnUrl": null,`,
      `${indent(4)}"SelectedTeamMembers": null,`,
      `${indent(4)}"AppointmentStatuses": ${JSON.stringify(APPOINTMENT_STATUSES)},`,
      `${indent(4)}"IsAppointmentStatusesOrderedList": false,`,
      `${indent(4)}"IsAutoAcceptRequests": false,`,
      `${indent(4)}"IsHealthFoodInspection": false`,
      `${indent(3)}},`,
      `${indent(3)}"TitlePart": {}`,
      `${indent(2)}}`
    ].join('\n')
  }

  const items = list.map(itemToString).join(',\n')

  // full document in the exact order you defined earlier
  const doc = [
    '{',
    `${indent(1)}"name": "",`,
    `${indent(1)}"displayName": "",`,
    `${indent(1)}"description": "",`,
    `${indent(1)}"author": "",`,
    `${indent(1)}"website": "",`,
    `${indent(1)}"version": "",`,
    `${indent(1)}"issetuprecipe": false,`,
    `${indent(1)}"categories": [],`,
    `${indent(1)}"tags": [],`,
    `${indent(1)}"steps": [`,
    `${indent(2)}{`,
    `${indent(3)}"name": "content",`,
    `${indent(3)}"data": [`,
    items ? items : `${indent(4)}{}`,
    `\n${indent(3)}]`,
    `${indent(2)}}`,
    `${indent(1)}]`,
    '}'
  ].join('\n')

  return doc
}

/**
 * Export inspection types to Import Files folder in project directory
 */
export async function exportInspectionTypesToFile(
  _projectName: string = "GovBuilder Project"
): Promise<{ success: boolean; error?: string }> {
  try {
    const inspectionTypeStore = useInspectionTypeStore()
    const projectStore = useProjectStore()
    const list = inspectionTypeStore.list.value

    if (!list || list.length === 0) {
      return {
        success: false,
        error: 'No inspection types to export'
      }
    }

    // Get project path
    if (!projectStore.current?.path) {
      return {
        success: false,
        error: 'No project selected. Please select a project first.'
      }
    }

    const currentProjectPath = projectStore.current.path
    const fullPath = `${currentProjectPath}/Import Files/InspectionTypes.json`

    // Build exact-ordered JSON string
    const jsonString = buildGovBuiltImportString(list)

    // Call Tauri command that writes raw JSON string to file
    await invoke('generate_import_file_raw', {
      json: jsonString,
      path: fullPath
    })

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || 'Unknown error during export'
    }
  }
}