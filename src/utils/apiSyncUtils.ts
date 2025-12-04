// src/utils/apiSyncUtils.ts
import { invoke } from '@tauri-apps/api/core'

export interface ContentItem {
  ContentItemId: string
  DisplayText: string
  Content?: string // Unicode-escaped JSON string from Orchard Core
  ParsedContent?: any // Parsed content object
}

export interface SyncResult {
  contentType: string
  success: boolean
  items: ContentItem[]
  error?: string
}

export interface SyncProgress {
  current: string
  total: number
  completed: number
}

// Content types that can be synced from the API
export const SYNC_CONTENT_TYPES = [
  'CaseStatus',
  'CaseSubType', 
  'InspectionType',
  'LicenseType',
  'LicenseSubType',
  'LicenseStatus',
  'CaseType',
  'AccountingDetails'
] as const

export type SyncContentType = typeof SYNC_CONTENT_TYPES[number]

// Try to parse the Content JSON, seems to work now I think.
export function parseUnicodeJson(jsonString: string): any {
  
  try {
    let processedString = jsonString
      .replace(/\\([0-7]{1,3})/g, (_, octal) => {
        const charCode = parseInt(octal, 8)
        const char = String.fromCharCode(charCode)
        return char
      })
      .replace(/\\u0022/g, '"')   // Quotation marks
      .replace(/\\u003C/g, '<')   // Less than
      .replace(/\\u003E/g, '>')   // Greater than
      .replace(/\\u0026/g, '&')   // Ampersand
      .replace(/\\u005C/g, '\\')  // Backslash
      .replace(/\\u000A/g, '\n')  // Line feed
      .replace(/\\u000D/g, '\r')  // Carriage return
      .replace(/\\u002F/g, '/')   // Forward slash
      .replace(/\\u003D/g, '=')   // Equals
      .replace(/\\u0023/g, '#')   // Hash
      .replace(/\\u0025/g, '%')   // Percent
      .replace(/\\u007B/g, '{')   // Open brace
      .replace(/\\u007D/g, '}')   // Close brace
      .replace(/\\u005B/g, '[')   // Open bracket
      .replace(/\\u005D/g, ']')   // Close bracket
      .replace(/\\\\/g, '\\')
    
    
    const result = JSON.parse(processedString)
    return result
} catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log('Error message:', errorMessage)
    }
    
    // If that fails, just try JSON.parse
    try {
      return JSON.parse(jsonString)
    } catch (fallbackError) {
    }
    
    return null
  }

/**
 * Parses content based on content type
 */
export function parseContentByType(contentType: SyncContentType, item: any): any {
  console.log(`🔧 parseContentByType called for contentType: ${contentType}`)
  
  // If the item has the content type as a property (direct API response), use that
  if (item && typeof item === 'object' && item[contentType]) {
    console.log(`✅ Found direct ${contentType} property`)
    return item[contentType]
  }
  
  // If the item has a Content field that's a string, parse it first
  if (item && item.Content && typeof item.Content === 'string') {
    console.log(`🔧 Found Content field, parsing...`)
    const parsed = parseUnicodeJson(item.Content)
    if (!parsed) {
      console.log('❌ parseUnicodeJson returned null')
      return null
    }
    
    console.log('✅ Successfully parsed Content field')
    console.log('Parsed keys:', Object.keys(parsed))
    
// Extract the content-specific part based on content type
    switch (contentType) {
      case 'CaseType':
        const caseTypeContent = parsed.CaseType || null
        return caseTypeContent
      case 'LicenseType':
        return parsed.LicenseType || null
      case 'InspectionType':
        return parsed.InspectionType || null
      case 'CaseStatus':
        return parsed.CaseStatus || null
      case 'LicenseStatus':
        return parsed.LicenseStatus || null
      case 'CaseSubType':
        return parsed.CaseSubType || null
      case 'LicenseSubType':
        return parsed.LicenseSubType || null
      case 'AccountingDetails':
        return parsed.AccountingDetails || null
      default:
        // in case we somehow query a type we're not wanting
        console.log(`No specific handler for ${contentType}, returning parsed content`)
        return parsed
    }
  }
    return null
}

// Type definitions for parsed content structures
export interface CaseTypeContent {
  Title: { Text: string }
  Prefix: { Text: string | null }
  Suffix: { Text: string | null }
  UseAutoNumber: { Value: boolean }
  AutoLicense: { Value: boolean }
  CaseSubTypes: { Text: string | null } // Comma-separated IDs
  InspectionType: { Value: boolean }
  NumberOfDigits: { Text: string | null }
  // Add other CaseType fields as needed
}

export interface InspectionTypeContent {
  Title: { Text: string }
  DurationHours?: { Value: number }
  WorkflowId?: { ContentItemIds: string[] }
  // Add other InspectionType fields as needed
}

export interface AccountingDetailsContent {
  Title: { Text: string }
  GLKey?: { Text: string | null }
  TranCode?: { Text: string | null }
  FeeCode?: { Text: string | null }
  FeeAbbreviation?: { Text: string | null }
  Notes?: { Text: string | null }
  DebitAccountNumber?: { Text: string | null }
  DebitAccountTransferNumber?: { Text: string | null }
  FeeDetails?: { Text: string | null }
  // Add other AccountingDetails fields as needed
}

export interface StatusContent {
  Title: { Text: string }
  Color?: { Text: string | null }
  HideFromStatusFlowChevrons?: { Value: boolean }
  IsTeamMembersNotified?: { Value: boolean }
  IsApplicantNotified?: { Value: boolean }
  IsContactsNotified?: { Value: boolean }
  IsOtherTeamMembersNotified?: { Value: boolean }
  IsNotifyOtherRecipient?: { Value: boolean }
  TeamEmailSubject?: { Text: string | null }
  TeamEmailBody?: { Text: string | null }
  ApplicantEmailSubject?: { Text: string | null }
  ApplicantEmailBody?: { Text: string | null }
  // Add other status fields as needed
}

/**
 * Fetches content items from the GovBuilder API for a specific content type
 */
export async function fetchContentItems(
  stagingUrl: string,
  contentType: SyncContentType
): Promise<ContentItem[]> {
  
  const parameters = JSON.stringify({ contentType })
  const encodedParameters = encodeURIComponent(parameters)
  
  const apiUrl = `${stagingUrl.replace(/\/$/, '')}/api/queries/GetAllContentItemsByContentType?parameters=${encodedParameters}`
  
  
  try {
    // Tauri api fetch, avoids CORS issues
    const responseText = await invoke('fetch_api', { url: apiUrl })
    
    
    if (!responseText) {
      throw new Error('No response from server')
    }

    let data: any
    try {
      data = JSON.parse(responseText as string)
      console.log('Successfully parsed JSON:', data)
    } catch (parseError) {
      console.log('JSON parse error:', parseError)
      console.log('Response text:', responseText)
      console.log('Response type:', typeof responseText)
      throw new Error(`Invalid JSON response from API. Expected array but got: ${typeof responseText}`)
    }
    
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if (data.data && Array.isArray(data.data)) {
        data = data.data
        console.log('Extracted data from response.data property:', data)
      } else if (data.items && Array.isArray(data.items)) {
        data = data.items
        console.log('Extracted data from response.items property:', data)
      }
    }
    
    if (!Array.isArray(data)) {
      console.warn(`⚠️ Invalid response format for ${contentType}: expected array, got`, typeof data)
      throw new Error('Invalid response format: expected array')
    }
    
    const validItems = data.filter((item: any) => 
      item && 
      typeof item.ContentItemId === 'string' && 
      typeof item.DisplayText === 'string'
    ).map((item: any): ContentItem => {
      const contentItem: ContentItem = {
        ContentItemId: item.ContentItemId,
        DisplayText: item.DisplayText
      }

      try {
        
        contentItem.ParsedContent = parseContentByType(contentType, item)

} catch (error) {
        if (error instanceof Error) {
          console.error('Error stack:', error.stack)
        }
      }

      return contentItem
    })
        
    if (validItems.length > 0) {
      if (validItems[0].ParsedContent) {
        console.log(`📋 Sample parsed content:`, validItems[0].ParsedContent)
      }
    }
    
    return validItems
  } catch (tauriError) {
    
    throw new Error(`API request failed: ${(tauriError as Error)?.message || 'Unknown error'}`)
  }
}

// syncs all currently handled content types
export async function syncAllContentTypes(
  stagingUrl: string,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult[]> {
  console.log('🚀 syncAllContentTypes called with staging URL:', stagingUrl)
  console.log('🚀 Content types to sync:', SYNC_CONTENT_TYPES)
  
  const results: SyncResult[] = []
  
  for (let i = 0; i < SYNC_CONTENT_TYPES.length; i++) {
    const contentType = SYNC_CONTENT_TYPES[i]
    
    console.log(`🔄 Starting sync for ${contentType} (${i + 1}/${SYNC_CONTENT_TYPES.length})`)
    
    // Update progress
    onProgress?.({
      current: contentType,
      total: SYNC_CONTENT_TYPES.length,
      completed: i
    })
    
    try {
      const items = await fetchContentItems(stagingUrl, contentType)
      console.log(`✅ Successfully fetched ${items.length} items for ${contentType}`)
      results.push({
        contentType,
        success: true,
        items
      })
      
      // DEBUG: Log all content type results for debugging
      const syncResult = {
        contentType,
        success: true,
        items
      }
      console.log(`🔍 DEBUG: ${contentType} result:`, {
        success: syncResult.success,
        itemCount: syncResult.items.length,
        hasItems: syncResult.items.length > 0
      })
      
    } catch (error) {
      console.error(`❌ API failed for ${contentType}:`, error)
      
      // CRITICAL FIX: For CaseSubType, create empty result to prevent undefined errors
      if (contentType === 'CaseSubType') {
        console.error(`🚨 CRITICAL: CaseSubType sync failed - this will cause subtype mapping to fail!`)
      }
      
      results.push({
        contentType,
        success: false,
        items: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  // Final progress update
  onProgress?.({
    current: 'Complete',
    total: SYNC_CONTENT_TYPES.length,
    completed: SYNC_CONTENT_TYPES.length
  })
  
  return results
}


// Maps API content items to store-specific format

export function mapApiItemsToStore(
  contentType: SyncContentType,
  items: ContentItem[],
  _currentProjectData?: any,
  _subtypeLookup?: Map<string, string>,
  subtypeIdMap?: Map<string, string>,
  mappedSubtypes?: any[]
): any[] {
  switch (contentType) {
    case 'CaseStatus':
      return items.map(item => {
        const content = item.ParsedContent as StatusContent | null
        return {
          id: crypto.randomUUID(), // Generate local ID
          govbuiltContentItemId: item.ContentItemId,
          title: item.DisplayText,
          hideFromStatusFlowChevron: content?.HideFromStatusFlowChevrons?.Value ?? false,
          notifyAssignedTeamMembers: content?.IsTeamMembersNotified?.Value ?? false,
          notifyOtherTeamMembers: content?.IsOtherTeamMembersNotified?.Value ?? false,
          notifyApplicant: content?.IsApplicantNotified?.Value ?? false,
          notifyAllContacts: content?.IsContactsNotified?.Value ?? false,
          notifyOtherRecipient: content?.IsNotifyOtherRecipient?.Value ?? false,
          useDefaultAssignedTeamMembers: false,
          useDefaultOtherTeamMembers: false,
          useDefaultApplicant: false,
          useDefaultAllContacts: false,
          useDefaultOtherRecipient: false,
        }
      })
    
    case 'LicenseStatus':
      return items.map(item => {
        const content = item.ParsedContent as StatusContent | null
        return {
          id: crypto.randomUUID(),
          govbuiltContentItemId: item.ContentItemId,
          title: item.DisplayText,
          hideFromStatusFlowChevron: content?.HideFromStatusFlowChevrons?.Value ?? false,
          notifyAssignedTeamMembers: content?.IsTeamMembersNotified?.Value ?? false,
          notifyOtherTeamMembers: content?.IsOtherTeamMembersNotified?.Value ?? false,
          notifyApplicant: content?.IsApplicantNotified?.Value ?? false,
          notifyAllContacts: content?.IsContactsNotified?.Value ?? false,
          notifyOtherRecipient: content?.IsNotifyOtherRecipient?.Value ?? false,
          useDefaultAssignedTeamMembers: false,
          useDefaultOtherTeamMembers: false,
          useDefaultApplicant: false,
          useDefaultAllContacts: false,
          useDefaultOtherRecipient: false,
        }
      })
    
case 'CaseType':
      return items.map(item => {
        const content = item.ParsedContent as CaseTypeContent | null
        let subtypes: string[] = []
        
        // Check for both possible field names
        const subtypeField = content?.CaseSubTypes
        const subtypeText = subtypeField?.Text
        
        if (subtypeText) {
          console.log(`🔧 CaseType "${item.DisplayText}" has subtype text: "${subtypeText}"`)
          
          const rawIds = subtypeText.split(',').map(id => id.trim()).filter(id => id)
          console.log(`🔧 Raw subtype IDs to map:`, rawIds)
          
          subtypes = rawIds.map(id => {
            console.log(`  🔍 Looking up ID: "${id}"`)
            
            // Try to find the local UUID for this govbuiltContentItemId
            let localUuid = subtypeIdMap?.get(id)
            
            if (localUuid) {
              console.log(`  ✅ Found local UUID: ${id} -> ${localUuid}`)
              return localUuid
            } else {
              console.log(`  ❌ No local UUID found for ${id}`)
              
              // Fallback: Try to find subtype by govbuiltContentItemId directly
              const subtypeByGovbuiltId = mappedSubtypes?.find(sub => sub.govbuiltContentItemId === id)
              if (subtypeByGovbuiltId) {
                console.log(`  ✅ Found by govbuiltContentItemId: ${id} -> ${subtypeByGovbuiltId.id}`)
                return subtypeByGovbuiltId.id
              }
              
              // Final fallback: Skip this subtype to avoid broken references
              console.log(`  ⚠️ Skipping unmapped subtype ID: ${id}`)
              return null
            }
          }).filter(id => id !== null) as string[]
          
        } else {
          console.log(`🔧 CaseType "${item.DisplayText}" has no subtype text`)
        }
        
        return {
          id: crypto.randomUUID(),
          govbuiltContentItemId: item.ContentItemId,
          title: item.DisplayText,
          prefix: content?.Prefix?.Text || '',
          suffix: content?.Suffix?.Text || '',
          autoNumber: content?.UseAutoNumber?.Value ?? true,
          autoLicense: content?.AutoLicense?.Value ?? false,
          subtypes,
          workflowId: undefined,
        }
      })
    
    case 'LicenseType':
      return items.map(item => {
        const content = item.ParsedContent as CaseTypeContent | null // LicenseType has similar structure
        return {
          id: crypto.randomUUID(),
          govbuiltContentItemId: item.ContentItemId,
          title: item.DisplayText,
          prefix: content?.Prefix?.Text || '',
          suffix: content?.Suffix?.Text || '',
          autoNumber: content?.UseAutoNumber?.Value ?? true,
          autoLicense: content?.AutoLicense?.Value ?? false,
          subtypes: content?.CaseSubTypes?.Text 
            ? content.CaseSubTypes.Text.split(',').filter(id => id.trim())
            : [],
          workflowId: undefined,
        }
      })
    
    case 'InspectionType':
      return items.map(item => {
        const content = item.ParsedContent as InspectionTypeContent | null
        return {
          id: crypto.randomUUID(),
          govbuiltContentItemId: item.ContentItemId,
          title: item.DisplayText,
          durationHours: content?.DurationHours?.Value ?? 1,
          workflowId: content?.WorkflowId?.ContentItemIds?.[0] || undefined,
        }
      })
    
    case 'CaseSubType':
      return items.map(item => ({
        id: crypto.randomUUID(),
        govbuiltContentItemId: item.ContentItemId,
        name: item.DisplayText,
      }))
    
    case 'LicenseSubType':
      return items.map(item => ({
        id: crypto.randomUUID(),
        govbuiltContentItemId: item.ContentItemId,
        name: item.DisplayText,
      }))
    
    case 'AccountingDetails':
      return items.map(item => {
        const content = item.ParsedContent as AccountingDetailsContent | null
        return {
          id: crypto.randomUUID(),
          govbuiltContentItemId: item.ContentItemId,
          title: item.DisplayText,
          glKey: content?.GLKey?.Text || '',
          tranCode: content?.TranCode?.Text || '',
          feeCode: content?.FeeCode?.Text || '',
          feeAbbreviation: content?.FeeAbbreviation?.Text || '',
          notes: content?.Notes?.Text || '',
          debitAccountNumber: content?.DebitAccountNumber?.Text || '',
          debitAccountTransferNumber: content?.DebitAccountTransferNumber?.Text || '',
          feeDetails: content?.FeeDetails?.Text || '',
        }
      })
    
    default:
      throw new Error(`Unknown content type: ${contentType}`)
  }
}

/**
 * Helper function to convert GovBuilt ContentItemIds to subtype names
 * This should be called with the already-synced subtypes data
 */
export function convertContentItemIdsToNames(contentItemIds: string, subtypes: any[]): string[] {
  if (!contentItemIds || !subtypes) {
    console.log(`🔧 convertContentItemIdsToNames: missing data - contentItemIds: ${!!contentItemIds}, subtypes: ${!!subtypes}`)
    return []
  }
  
  console.log(`🔧 convertContentItemIdsToNames called with: "${contentItemIds}" and ${subtypes.length} subtypes`)
  
  const subtypeMap = new Map<string, string>()
  subtypes.forEach((subtype: any) => {
    subtypeMap.set(subtype.govbuiltContentItemId, subtype.name)
  })
  
  const result = contentItemIds
    .split(',')
    .map(id => id.trim())
    .filter(id => id)
    .map(id => {
      const mappedName = subtypeMap.get(id) || `Unknown (${id})`
      console.log(`  Mapping fallback ${id} -> ${mappedName}`)
      return mappedName
    })
  
  console.log(`🔧 convertContentItemIdsToNames result:`, result)
  return result
}

/**
 * Creates a lookup map from ContentItemId to subtype name from synced items
 */
export function createSubtypeLookup(subtypeItems: any[]): Map<string, string> {
  const lookup = new Map<string, string>()
  
  console.log(`🔧 Creating subtype lookup from ${subtypeItems.length} items:`)
  subtypeItems.forEach((item) => {
    console.log(`  Subtype item:`, {
      id: item.id,
      govbuiltContentItemId: item.govbuiltContentItemId,
      name: item.name
    })
    
    if (item.govbuiltContentItemId && item.name) {
      lookup.set(item.govbuiltContentItemId, item.name)
      console.log(`  ✅ Added to lookup: ${item.govbuiltContentItemId} -> ${item.name}`)
    } else {
      console.log(`  ❌ Skipped item - missing govbuiltContentItemId or name`)
    }
  })
  
  console.log(`🔧 Final lookup contains ${lookup.size} entries`)
  console.log(`🔧 All lookup keys:`, Array.from(lookup.keys()))
  console.log(`🔧 All lookup values:`, Array.from(lookup.entries()))
  return lookup
}

/**
 * Merges synced items with existing items, avoiding duplicates
 */
export function mergeSyncedItems(
  existingItems: any[],
  syncedItems: any[]
): any[] {
  const merged = [...existingItems]
  
  for (const syncedItem of syncedItems) {
    // Check if item already exists (by govbuiltContentItemId)
    const existingIndex = merged.findIndex(
      item => item.govbuiltContentItemId === syncedItem.govbuiltContentItemId
    )
    
    if (existingIndex >= 0) {
      // Update existing item
      merged[existingIndex] = {
        ...merged[existingIndex],
        ...syncedItem,
        id: merged[existingIndex].id // Preserve existing local ID
      }
    } else {
      // Add new item
      merged.push(syncedItem)
    }
  }
  
  return merged
}

/**
 * Test function to manually check API connectivity
 * Call this from browser console: window.testApiConnection('https://your-staging-url.com')
 */
export async function testApiConnection(stagingUrl: string) {
  
  try {
    const result = await fetchContentItems(stagingUrl, 'CaseStatus')
    return result
  } catch (error) {
    return null
  }
}