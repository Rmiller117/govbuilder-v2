// Utility functions for exporting case types to Orchard Core recipe format
import { useCaseTypeStore } from '@/stores/caseTypeStore'
import { useStatusStore } from '@/stores/statusStore'
import { useWorkflowStore } from '@/stores/workflowStore'
import { useCaseSubTypeStore } from '@/stores/caseSubTypeStore'
import { useProjectStore } from '@/stores/projectStore'
import { invoke } from '@tauri-apps/api/core'

export interface CaseTypeStatus {
  ContentItemId: string
  DisplayText: string
  PermitTypeId?: string | null
  FormLetterId?: string | null
  AssignedTeamMembers?: string[] | null
  IsAppendAssignTeamMembers: boolean
  IsTeamMembersNotified: boolean
  TeamEmailSubject?: string | null
  TeamEmailBody?: string | null
  IsApplicantNotified: boolean
  ApplicantEmailSubject?: string | null
  ApplicantEmailBody?: string | null
  HideStatusFromStatusFlowChevrons: boolean
  IsContactsNotified: boolean
  ContactsEmailSubject?: string | null
  ContactsEmailBody?: string | null
  IsOtherTeamMembersNotified: boolean
  OtherTeamMembers?: string[] | null
  OtherTeamMemberSubject?: string | null
  OtherTeamMemberEmail?: string | null
  OtherTeamMemberRecipientEmailBody?: string | null
  IsTasKTeamMembersNotified: boolean
  TaskEmailSubject?: string | null
  TaskEmailBody?: string | null
  TaskTypeId?: string | null
  TaskTypeStatusId?: string | null
  TaskListRecipeId?: string | null
  IsDeleteExistingTask: boolean
  IsUpdateSelectedRecipeTask: boolean
  OtherTeamMemberRecipientEmail?: string | null
  IsNotifyOtherRecipient: boolean
  OtherRecipientEmail?: string | null
  OtherEmailSubject?: string | null
  OtherNotificationEmailBody?: string | null
  AppendTeamMemberRecipientEmail?: string | null
  NumberOfDaysInStatus?: string | null
  ChangeToCaseStatusId?: string | null
  IsIncrementRecipeReviewRound: boolean
  CaseStatusId?: string | null
  IsShowOnFE: boolean
  IsRequestNewVersion: boolean
}

export interface OrchardCoreRecipe {
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
    data: any[]
  }>
}

/**
 * Convert status from app to Orchard Core format
 */
function convertStatusToOrchardFormat(
  status: any, 
  statusIds: Array<{ name?: string; id?: string; DisplayText?: string; ContentItemId?: string }>
): CaseTypeStatus {
  const statusTitle = status.title || ''

  const getEmailTemplates = (title: string) => {
    const t = title.toLowerCase()

    if (t.includes('submit')) {
      return {
        teamSubject: "A new {{CaseType}} has been submitted",
        teamBody: "<emailtemplate></emailtemplate>A new {{CaseType}} has been submitted and is ready for intake.",
        applicantSubject: "SUBMITTED: {{CaseType}} - {{Location}}",
        applicantBody: "<emailtemplate></emailtemplate>Your {{CaseType}} {{Number}} has been submitted."
      }
    }

    if (t.includes('approv')) {
      return {
        teamSubject: "{{CaseType}} Approved",
        teamBody: "<emailtemplate></emailtemplate>The {{CaseType}} {{Number}} has been approved.",
        applicantSubject: "APPROVED: {{CaseType}} - {{Location}}",
        applicantBody: "<emailtemplate></emailtemplate>Your {{CaseType}} {{Number}} has been approved."
      }
    }

    if (t.includes('deni') || t.includes('reject')) {
      return {
        teamSubject: "{{CaseType}} Denied",
        teamBody: "<emailtemplate></emailtemplate>The {{CaseType}} {{Number}} has been denied.",
        applicantSubject: "DENIED: {{CaseType}} - {{Location}}",
        applicantBody: "<emailtemplate></emailtemplate>Your {{CaseType}} {{Number}} has been denied."
      }
    }

    return {
      teamSubject: "{{CaseType}} Status Update",
      teamBody: "<emailtemplate></emailtemplate>The {{CaseType}} {{Number}} status has been updated to {{CaseStatus}}.",
      applicantSubject: "{{CaseType}} Status Update",
      applicantBody: "<emailtemplate></emailtemplate>Your {{CaseType}} {{Number}} status has been updated to {{CaseStatus}}."
    }
  }

  const emailTemplates = getEmailTemplates(statusTitle)

  // Find matching status ID from API response
  const apiStatus = statusIds.find(si => si.DisplayText === statusTitle)
  const contentItemId = apiStatus?.ContentItemId || `[js: contentitem('CaseStatus', '${statusTitle}')]`

  return {
    ContentItemId: contentItemId,
    DisplayText: statusTitle,
    PermitTypeId: null,
    FormLetterId: null,
    AssignedTeamMembers: null,
    IsAppendAssignTeamMembers: false,
    IsTeamMembersNotified: status.notifyAssignedTeamMembers || false,
    TeamEmailSubject: status.notifyAssignedTeamMembers ? emailTemplates.teamSubject : null,
    TeamEmailBody: status.notifyAssignedTeamMembers ? emailTemplates.teamBody : null,
    IsApplicantNotified: status.notifyApplicant || false,
    ApplicantEmailSubject: status.notifyApplicant ? emailTemplates.applicantSubject : null,
    ApplicantEmailBody: status.notifyApplicant ? emailTemplates.applicantBody : null,
    HideStatusFromStatusFlowChevrons: status.hideFromStatusFlowChevron || false,
    IsContactsNotified: status.notifyAllContacts || false,
    ContactsEmailSubject: status.notifyAllContacts ? emailTemplates.teamSubject : null,
    ContactsEmailBody: status.notifyAllContacts ? emailTemplates.teamBody : null,
    IsOtherTeamMembersNotified: status.notifyOtherTeamMembers || false,
    OtherTeamMembers: null,
    OtherTeamMemberSubject: status.notifyOtherTeamMembers ? emailTemplates.teamSubject : null,
    OtherTeamMemberEmail: status.notifyOtherTeamMembers ? emailTemplates.teamBody : null,
    OtherTeamMemberRecipientEmailBody: null,
    IsTasKTeamMembersNotified: false,
    TaskEmailSubject: null,
    TaskEmailBody: null,
    TaskTypeId: null,
    TaskTypeStatusId: null,
    TaskListRecipeId: null,
    IsDeleteExistingTask: false,
    IsUpdateSelectedRecipeTask: false,
    OtherTeamMemberRecipientEmail: null,
    IsNotifyOtherRecipient: status.notifyOtherRecipient || false,
    OtherRecipientEmail: null,
    OtherEmailSubject: status.notifyOtherRecipient ? emailTemplates.teamSubject : null,
    OtherNotificationEmailBody: status.notifyOtherRecipient ? emailTemplates.teamBody : null,
    AppendTeamMemberRecipientEmail: null,
    NumberOfDaysInStatus: null,
    ChangeToCaseStatusId: null,
    IsIncrementRecipeReviewRound: false,
    CaseStatusId: null,
    IsShowOnFE: false,
    IsRequestNewVersion: false
  }
}

/**
 * Generate Orchard Core recipe
 */
export function generateCaseTypeRecipe(
  _projectName: string,
  _author: string,
  _version: string = "1.0.0"
): OrchardCoreRecipe {
  const caseTypeStore = useCaseTypeStore()
  const statusStore = useStatusStore()
  const workflowStore = useWorkflowStore()
  const caseSubTypeStore = useCaseSubTypeStore()

  const caseTypes = caseTypeStore.list.value
  const statuses = statusStore.list.value
  const subtypes = caseSubTypeStore.list.value

  const dataItems = caseTypes.map(caseType => {
    const workflow = caseType.workflowId ? workflowStore.get(caseType.workflowId) : null
    let workflowStatuses: any[] = []

    if (workflow?.steps) {
      workflowStatuses = workflow.steps
        .map(step => statuses.find((s: any) => s.id === step.statusId))
        .filter(Boolean)
    } else {
      workflowStatuses = statuses
    }

    const caseTypeStatuses = workflowStatuses.map((status: any) => convertStatusToOrchardFormat(status, []))

    const caseSubTypes = caseType.subtypes?.length
      ? caseType.subtypes
          .map(id => {
            const sub = subtypes.find(s => s.id === id)
            return sub ? `contentitem('CaseSubType','${sub.name}')` : null
          })
          .filter(Boolean)
          .join(',')
      : null

    return {
      ContentItemId: "[js: uuid()]",
      ContentItemVersionId: "[js: uuid()]",
      ContentType: "CaseType",
      DisplayText: caseType.title,
      Latest: true,
      Published: true,
      ModifiedUtc: "[js: new Date()]",
      PublishedUtc: "[js: new Date()]",
      CreatedUtc: "[js: new Date()]",
      Owner: "[js: parameters('AdminUserId')]",
      Author: "[js: parameters('AdminUsername')]",
      CaseType: {
        Title: { Text: caseType.title },
        MapPin: { Paths: [""], MediaTexts: [""] },
        UseGlobalCaseAutoNumberSettings: { Value: false },
        AllowFrontEndSearch: { Value: false },
        LockCaseNumber: { Value: false },
        DownloadAdminCommentswithCaseDownload: { Value: false },
        AutoNumberStart: { Text: null },
        DepartmentsforScheduling: { ContentItemIds: null },
        UseAutoNumber: { Value: caseType.autoNumber || true },
        Prefix: { Text: caseType.prefix || null },
        Suffix: { Text: caseType.suffix || null },
        NumberOfDigits: { Text: "4" },
        InspectionType: { Value: true },
        ReadyForBillingStatus: { Text: null },
        DonotallowApprovedUntilBillingStatusSet: { Value: false },
        SetPermitIssueDateonApprovalStatus: { Value: false },
        ApprovedStatus: { ContentItemIds: null },
        PermitExpirationDateXDaysFromPermitIssueDate: { Text: null },
        WhotoEmailApprovedEmail: { Text: "None" },
        StatusToSendPermitExpirationReminder: { ContentItemIds: null },
        ApprovalEmailSubject: { Text: null },
        ReminderDaysFromPermitExpiration: { Text: null },
        ApprovalEmailForApplicant: { Html: null },
        ApprovalEmailForAssignedTeamMember: { Html: null },
        ApprovedPermitType: { ContentItemIds: null },
        DeclinedStatus: { ContentItemIds: null },
        WhotoEmailDeclinedEmail: { Text: "None" },
        DeclinedEmailSubject: { Text: null },
        DeclinedEmailForApplicant: { Html: null },
        DeclinedEmailForAssignedTeamMember: { Html: null },

        CaseTypeStatuses: {
          Text: (function () {
            let json = JSON.stringify(caseTypeStatuses)
            let result = ''
            for (let i = 0; i < json.length; i++) {
              let char = json[i]
              switch (char) {
                case '"': result += '\\' + 'u0022'; break
                case '<': result += '\\' + 'u003C'; break
                case '>': result += '\\' + 'u003E'; break
                case '&': result += '\\' + 'u0026'; break
                default: result += char
              }
            }
            return result
          })()
        },

        IsCaseTypeStatusesOrderedList: { Value: true },
        IsDefaultShowFE: { Value: true },
        CaseSubTypes: { Text: caseSubTypes },

        // ... rest of the fields remain unchanged ...
      },

      TitlePart: {
        Title: caseType.title
      }
    }
  })

  const subtypeDataItems = subtypes.map(subtype => ({
    ContentItemId: "[js: uuid()]",
    ContentItemVersionId: "[js: uuid()]",
    ContentType: "CaseSubType",
    DisplayText: subtype.name,
    Latest: true,
    Published: true,
    ModifiedUtc: "[js: new Date()]",
    PublishedUtc: "[js: new Date()]",
    CreatedUtc: "[js: new Date()]",
    Owner: "[js: parameters('AdminUserId')]",
    Author: "[js: parameters('AdminUsername')]",
    CaseSubType: {
      Title: { Text: subtype.name },
      CaseNumberDetailToAppend: { Text: null },
      TaskRecipe: { Text: null },
      InspectionTypeList: { Text: null },
      IsRequireInspectionsTakePlaceInAboveOrder: { Value: false },
      IsInspectionAllowed: { ContentItemIds: null },
      DepartmentsForScheduling: { ContentItemIds: null },
      InspectionType: { Value: false },
      CaseTypeStatuses: { Text: null },
      IsIncrementRecipeReviewRound: { Value: false }
    },
    TitlePart: {
      Title: subtype.name 
    }
  }))

  return {
    name: "",
    displayName: "",
    description: "",
    author: "",
    website: "",
    version: "",
    issetuprecipe: false,
    categories: [],
    tags: [],
    steps: [
      {
        name: "content",
        data: subtypeDataItems
      },
      {
        name: "content",
        data: dataItems
      }
    ]
  }
}

/**
 * Default Orchard Core statuses that should be skipped during generation
 */
const DEFAULT_CASE_STATUSES = [
  "received Notarization",
  "Waiting on Notary", 
  "Suspended",
  "Completed",
  "Submitted",
  "On Hold",
  "In Progress",
  "Denied",
  "Approved"
]

/**
 * Generate case statuses recipe for Step 2
 */
export async function generateCaseStatusRecipe(
  _projectName: string,
  _author: string,
  version: string = "1.0.0"
): Promise<{ success: boolean; error?: string }> {
  try {
    const statusStore = useStatusStore()
    const projectStore = useProjectStore()
    const statuses = statusStore.list.value

    if (!statuses || statuses.length === 0) {
      return {
        success: false,
        error: 'No case statuses to export'
      }
    }

    if (!projectStore.current?.path) {
      return {
        success: false,
        error: 'No project selected. Please select a project first.'
      }
    }

    const fullPath = `${projectStore.current.path}/Import Files/CaseStatuses.json`

    // Filter out default statuses
    const customStatuses = statuses.filter((status: any) => !DEFAULT_CASE_STATUSES.includes(status.title))
    
    if (customStatuses.length === 0) {
      return {
        success: false,
        error: 'No custom case statuses to export. All statuses match default Orchard Core statuses.'
      }
    }

    const statusDataItems = customStatuses.map((status: any) => ({
      ContentItemId: "[js: uuid()]",
      ContentItemVersionId: "[js: uuid()]",
      ContentType: "CaseStatus",
      DisplayText: status.title,
      Latest: true,
      Published: true,
      ModifiedUtc: "[js: new Date()]",
      PublishedUtc: "[js: new Date()]",
      CreatedUtc: "[js: new Date()]",
      Owner: "[js: parameters('AdminUserId')]",
      Author: "[js: parameters('AdminUsername')]",
      CaseStatus: {
        Color: { Text: status.color || "#0078d4" } // Default blue color if not specified
      },
      TitlePart: {
        Title: status.title 
      }
    }))

    const recipe = {
      name: `case-statuses`,
      displayName: `Case Statuses`,
      description: `Custom case statuses (excluding default Orchard Core statuses)`,
      author: "Case Export Wizard",
      website: "",
      version: version,
      issetuprecipe: false,
      categories: ["case"],
      tags: ["case", "statuses"],
      steps: [
        {
          name: "content",
          data: statusDataItems
        }
      ]
    }

    let jsonString = JSON.stringify(recipe, null, 2)

    await invoke('generate_import_file_raw', {
      json: jsonString,
      path: fullPath
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || 'Unknown error during status export'
    }
  }
}

/**
 * Query case status IDs from Orchard Core API for Step 7
 */
export async function queryCaseStatusIdsFromAPI(): Promise<{ 
  success: boolean; 
  error?: string; 
  data?: Array<{ name?: string; id?: string; DisplayText?: string; ContentItemId?: string }> 
}> {
  try {
    const projectStore = useProjectStore()
    const statusStore = useStatusStore()
    const statuses = statusStore.list.value

    if (!statuses || statuses.length === 0) {
      return {
        success: false,
        error: 'No case statuses found to query'
      }
    }

    if (!projectStore.stagingUrl) {
      return {
        success: false,
        error: 'No staging URL configured. Please add a staging URL to your project settings.'
      }
    }

    // Remove trailing slash to avoid double slashes
    const baseUrl = projectStore.stagingUrl?.replace(/\/$/, '') || ''
    const apiUrl = `${baseUrl}/api/queries/GetAllCaseStatusIds`

    // Use Tauri backend to bypass CORS entirely
    const responseText = await invoke('fetch_api', { url: apiUrl })
    
    if (!responseText) {
      throw new Error('No response from server')
    }

    let data
    try {
      data = JSON.parse(responseText as string)
      console.log('Successfully parsed JSON:', data)
    } catch (parseError) {
      console.log('JSON parse error:', parseError)
      console.log('Response text:', responseText)
      console.log('Response type:', typeof responseText)
      throw new Error(`Invalid JSON response from API. Expected array but got: ${typeof responseText}`)
    }
    
    // Extract data if response has different structure
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if (data.data && Array.isArray(data.data)) {
        data = data.data
        console.log('Extracted data from response.data property:', data)
      } else if (data.items && Array.isArray(data.items)) {
        data = data.items
        console.log('Extracted data from response.items property:', data)
      }
    }
    
    // Validate the response structure
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from API')
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || 'Failed to query status IDs'
    }
  }
}

/**
 * Generate case subtypes recipe for Step 1
 */
export async function generateCaseSubtypeRecipe(
  _projectName: string,
  _author: string,
  _version: string = "1.0.0"
): Promise<{ success: boolean; error?: string }> {
  try {
    const caseSubTypeStore = useCaseSubTypeStore()
    const projectStore = useProjectStore()
    const subtypes = caseSubTypeStore.list.value

    if (!subtypes || subtypes.length === 0) {
      return {
        success: false,
        error: 'No case subtypes to export'
      }
    }

    if (!projectStore.current?.path) {
      return {
        success: false,
        error: 'No project selected. Please select a project first.'
      }
    }

    const fullPath = `${projectStore.current.path}/Import Files/CaseSubTypes.json`

    const subtypeDataItems = subtypes.map(subtype => ({
      ContentItemId: "[js: uuid()]",
      ContentItemVersionId: "[js: uuid()]",
      ContentType: "CaseSubType",
      DisplayText: subtype.name,
      Latest: true,
      Published: true,
      ModifiedUtc: "[js: new Date()]",
      PublishedUtc: "[js: new Date()]",
      CreatedUtc: "[js: new Date()]",
      Owner: "[js: parameters('AdminUserId')]",
      Author: "[js: parameters('AdminUsername')]",
      CaseSubType: {
        Title: { Text: subtype.name },
        CaseNumberDetailToAppend: { Text: null },
        TaskRecipe: { Text: null },
        InspectionTypeList: { Text: null },
        IsRequireInspectionsTakePlaceInAboveOrder: { Value: false },
        IsInspectionAllowed: { ContentItemIds: null },
        DepartmentsForScheduling: { ContentItemIds: null },
        InspectionType: { Value: false },
        CaseTypeStatuses: { Text: null },
        IsIncrementRecipeReviewRound: { Value: false }
      },
      TitlePart: {
        Title: subtype.name 
      }
    }))

    const recipe = {
      name: `case-subtypes`,
      displayName: `Case Subtypes`,
      description: `Case subtypes`,
      author: "Case Export Wizard",
      website: "",
      version: "1.0.0",
      issetuprecipe: false,
      categories: ["case"],
      tags: ["case", "subtypes"],
      steps: [
        {
          name: "content",
          data: subtypeDataItems
        }
      ]
    }

    let jsonString = JSON.stringify(recipe, null, 2)

    await invoke('generate_import_file_raw', {
      json: jsonString,
      path: fullPath
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || 'Unknown error during subtype export'
    }
  }
}

/**
 * Query case subtype IDs from Orchard Core API for Step 3
 */
export async function queryCaseSubtypeIdsFromAPI(): Promise<{ 
  success: boolean; 
  error?: string; 
  data?: Array<{ name?: string; id?: string; DisplayText?: string; ContentItemId?: string }> 
}> {
  try {
    const projectStore = useProjectStore()
    const caseSubTypeStore = useCaseSubTypeStore()
    const subtypes = caseSubTypeStore.list.value

    if (!subtypes || subtypes.length === 0) {
      return {
        success: false,
        error: 'No case subtypes found to query'
      }
    }

    if (!projectStore.stagingUrl) {
      return {
        success: false,
        error: 'No staging URL configured. Please add a staging URL to your project settings.'
      }
    }

    // Remove trailing slash to avoid double slashes
    const baseUrl = projectStore.stagingUrl?.replace(/\/$/, '') || ''
    const apiUrl = `${baseUrl}/api/queries/GetAllCaseSubTypeIds`

    // Use Tauri backend to bypass CORS entirely
    const responseText = await invoke('fetch_api', { url: apiUrl })
    
    if (!responseText) {
      throw new Error('No response from server')
    }

    let data
    try {
      data = JSON.parse(responseText as string)
      console.log('Successfully parsed JSON:', data)
    } catch (parseError) {
      console.log('JSON parse error:', parseError)
      console.log('Response text:', responseText)
      console.log('Response type:', typeof responseText)
      throw new Error(`Invalid JSON response from API. Expected array but got: ${typeof responseText}`)
    }
    
    // Extract data if response has different structure
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if (data.data && Array.isArray(data.data)) {
        data = data.data
        console.log('Extracted data from response.data property:', data)
      } else if (data.items && Array.isArray(data.items)) {
        data = data.items
        console.log('Extracted data from response.items property:', data)
      }
    }
    
    // Validate the response structure
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from API')
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || 'Failed to query subtype IDs'
    }
  }
}

/**
 * Generate case types recipe with subtype IDs for Step 4
 */
export async function generateCaseTypeRecipeWithIds(
  _projectName: string,
  _author: string,
  subtypeIds: Array<{ name?: string; id?: string; DisplayText?: string; ContentItemId?: string }>,
  statusIds: Array<{ name?: string; id?: string; DisplayText?: string; ContentItemId?: string }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const caseTypeStore = useCaseTypeStore()
    const statusStore = useStatusStore()
    const workflowStore = useWorkflowStore()
    const caseSubTypeStore = useCaseSubTypeStore()
    const projectStore = useProjectStore()

    const caseTypes = caseTypeStore.list.value
    const statuses = statusStore.list.value
    const subtypes = caseSubTypeStore.list.value

    if (!caseTypes || caseTypes.length === 0) {
      return {
        success: false,
        error: 'No case types to export'
      }
    }

    if (!projectStore.current?.path) {
      return {
        success: false,
        error: 'No project selected. Please select a project first.'
      }
    }

    const fullPath = `${projectStore.current.path}/Import Files/CaseTypes.json`

    const dataItems = caseTypes.map(caseType => {
      const workflow = caseType.workflowId ? workflowStore.get(caseType.workflowId) : null
      let workflowStatuses: any[] = []

      if (workflow?.steps) {
        workflowStatuses = workflow.steps
          .map(step => statuses.find((s: any) => s.id === step.statusId))
          .filter(Boolean)
      } else {
        workflowStatuses = statuses
      }

      const caseTypeStatuses: CaseTypeStatus[] = []
      for (const status of workflowStatuses) {
        caseTypeStatuses.push(convertStatusToOrchardFormat(status, statusIds))
      }

      // Use the provided ContentItemIds from API, mapped by our local subtype names
      const caseSubTypes = caseType.subtypes?.length
        ? (() => {
            const missingSubtypes: string[] = []
            const mappedIds = caseType.subtypes
              .map(id => {
                const sub = subtypes.find(s => s.id === id)
                if (!sub) return null
                
                const apiSubtype = subtypeIds.find(si => si.DisplayText === sub.name)
                if (!apiSubtype) {
                  missingSubtypes.push(sub.name)
                  return null
                }
                
                return apiSubtype.ContentItemId
              })
              .filter(Boolean) as string[]
            
            if (missingSubtypes.length > 0) {
              throw new Error(
                `The following subtypes are not found on the Orchard Core site: ${missingSubtypes.join(', ')}. ` +
                `Please ensure all subtypes exist on the site before generating case types.`
              )
            }
            
            return mappedIds.join(',')
          })()
        : null

      // Validate that all custom statuses exist on the site (skip default statuses)
      const customStatuses = statuses.filter((status: any) => !DEFAULT_CASE_STATUSES.includes(status.title))
      const missingStatuses: string[] = []
      
      customStatuses.forEach((status: any) => {
        const apiStatus = statusIds.find(si => si.DisplayText === status.title)
        if (!apiStatus) {
          missingStatuses.push(status.title)
        }
      })

      if (missingStatuses.length > 0) {
        throw new Error(
          `The following custom statuses are not found on the Orchard Core site: ${missingStatuses.join(', ')}. ` +
          `Please ensure all custom statuses exist on the site before generating case types. ` +
          `Note: Default Orchard Core statuses (${DEFAULT_CASE_STATUSES.join(', ')}) are skipped.`
        )
      }

      return {
        ContentItemId: "[js: uuid()]",
        ContentItemVersionId: "[js: uuid()]",
        ContentType: "CaseType",
        DisplayText: caseType.title,
        Latest: true,
        Published: true,
        ModifiedUtc: "[js: new Date()]",
        PublishedUtc: "[js: new Date()]",
        CreatedUtc: "[js: new Date()]",
        Owner: "[js: parameters('AdminUserId')]",
        Author: "[js: parameters('AdminUsername')]",
        CaseType: {
          Title: { Text: caseType.title },
          MapPin: { Paths: [""], MediaTexts: [""] },
          UseGlobalCaseAutoNumberSettings: { Value: false },
          AllowFrontEndSearch: { Value: false },
          LockCaseNumber: { Value: false },
          DownloadAdminCommentswithCaseDownload: { Value: false },
          AutoNumberStart: { Text: null },
          DepartmentsforScheduling: { ContentItemIds: null },
          UseAutoNumber: { Value: caseType.autoNumber || true },
          Prefix: { Text: caseType.prefix || null },
          Suffix: { Text: caseType.suffix || null },
          NumberOfDigits: { Text: "4" },
          InspectionType: { Value: true },
          ReadyForBillingStatus: { Text: null },
          DonotallowApprovedUntilBillingStatusSet: { Value: false },
          SetPermitIssueDateonApprovalStatus: { Value: false },
          ApprovedStatus: { ContentItemIds: null },
          PermitExpirationDateXDaysFromPermitIssueDate: { Text: null },
          WhotoEmailApprovedEmail: { Text: "None" },
          StatusToSendPermitExpirationReminder: { ContentItemIds: null },
          ApprovalEmailSubject: { Text: null },
          ReminderDaysFromPermitExpiration: { Text: null },
          ApprovalEmailForApplicant: { Html: null },
          ApprovalEmailForAssignedTeamMember: { Html: null },
          ApprovedPermitType: { ContentItemIds: null },
          DeclinedStatus: { ContentItemIds: null },
          WhotoEmailDeclinedEmail: { Text: "None" },
          DeclinedEmailSubject: { Text: null },
          DeclinedEmailForApplicant: { Html: null },
          DeclinedEmailForAssignedTeamMember: { Html: null },

          CaseTypeStatuses: {
            Text: (function () {
              let json = JSON.stringify(caseTypeStatuses)
              let result = ''
              for (let i = 0; i < json.length; i++) {
                let char = json[i]
                switch (char) {
                  case '"': result += '\\' + 'u0022'; break
                  case '<': result += '\\' + 'u003C'; break
                  case '>': result += '\\' + 'u003E'; break
                  case '&': result += '\\' + 'u0026'; break
                  default: result += char
                }
              }
              return result
            })()
          },

          IsCaseTypeStatusesOrderedList: { Value: true },
          IsDefaultShowFE: { Value: true },
          CaseSubTypes: { Text: caseSubTypes },
        },

        TitlePart: {
          Title: caseType.title
        }
      }
    })

    const recipe = {
      name: `case-types`,
      displayName: `Case Types`,
      description: `Case types`,
      author: "Case Export Wizard",
      website: "",
      version: "1.0.0",
      issetuprecipe: false,
      categories: ["case"],
      tags: ["case", "types"],
      steps: [
        {
          name: "content",
          data: dataItems
        }
      ]
    }

    let jsonString = JSON.stringify(recipe, null, 2)

    // Fix Unicode sequences in CaseTypeStatuses and email fields
    jsonString = jsonString.replace(/\\\\u0022/g, '\\u0022')
      .replace(/\\\\u003C/g, '\\u003C')
      .replace(/\\\\u003E/g, '\\u003E')
      .replace(/\\\\u0026/g, '\\u0026')

    await invoke('generate_import_file_raw', {
      json: jsonString,
      path: fullPath
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || 'Unknown error during case type export'
    }
  }
}

/**
 * Export case types to JSON file (legacy function)
 */
export async function exportCaseTypesToFile(
  projectName: string,
  author: string,
  version: string = "1.0.0"
): Promise<{ success: boolean; error?: string }> {
  try {
    const caseTypeStore = useCaseTypeStore()
    const projectStore = useProjectStore()
    const caseTypes = caseTypeStore.list.value

    if (!caseTypes || caseTypes.length === 0) {
      return {
        success: false,
        error: 'No case types to export'
      }
    }

    if (!projectStore.current?.path) {
      return {
        success: false,
        error: 'No project selected. Please select a project first.'
      }
    }

    const fullPath = `${projectStore.current.path}/Import Files/CaseTypes.json`
    const recipe = generateCaseTypeRecipe(projectName, author, version)

    // First stringify normally
    let jsonString = JSON.stringify(recipe, null, 2)

    // Then manually fix Unicode sequences in CaseTypeStatuses and email fields
    jsonString = jsonString.replace(/\\\\u0022/g, '\\u0022')
      .replace(/\\\\u003C/g, '\\u003C')
      .replace(/\\\\u003E/g, '\\u003E')
      .replace(/\\\\u0026/g, '\\u0026')

    await invoke('generate_import_file_raw', {
      json: jsonString,
      path: fullPath
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || 'Unknown error during export'
    }
  }
}