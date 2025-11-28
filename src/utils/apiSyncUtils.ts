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

/**
 * Parses JSON string from Orchard Core API response
 * Handles Unicode and octal escape sequences within the JSON
 */
export function parseUnicodeJson(jsonString: string): any {
  console.log('🔧 parseUnicodeJson called with string length:', jsonString.length)
  console.log('First 100 chars:', jsonString.substring(0, 100))
  
  try {
    // More comprehensive escape sequence handling
    let processedString = jsonString
      // Handle octal escape sequences FIRST (before other replacements)
      .replace(/\\([0-7]{1,3})/g, (match, octal) => {
        const charCode = parseInt(octal, 8)
        const char = String.fromCharCode(charCode)
        console.log(`Converting octal ${octal} to char '${char}' (${charCode})`)
        return char
      })
      // Handle common Unicode escapes
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
      // Handle any remaining double backslashes
      .replace(/\\\\/g, '\\')
    
    console.log('After escape sequence replacement, first 100 chars:', processedString.substring(0, 100))
    
    const result = JSON.parse(processedString)
    console.log('✅ JSON.parse successful')
    return result
  } catch (error) {
    console.error('❌ Failed to parse JSON:', error)
    console.log('Error message:', error.message)
    
    // Try to find the problematic position
    if (error.message.includes('position')) {
      const position = parseInt(error.message.match(/position (\d+)/)?.[1] || '0')
      console.log('Error at position:', position)
      const context = jsonString.substring(Math.max(0, position - 30), position + 30)
      console.log('Context:', context)
      console.log('Character at position:', jsonString.charCodeAt(position), jsonString[position])
      
      // Try to identify what escape sequence this might be
      const unicodeMatch = jsonString.substring(position - 10, position + 10).match(/\\u[0-9A-Fa-f]{4}/)
      if (unicodeMatch) {
        console.log('Found Unicode sequence:', unicodeMatch[0])
      }
      
      const octalMatch = jsonString.substring(position - 10, position + 10).match(/\\[0-7]{1,3}/)
      if (octalMatch) {
        console.log('Found octal sequence:', octalMatch[0])
      }
    }
    
    // Fallback: try parsing without any processing
    try {
      console.log('🔄 Trying to parse original string without processing...')
      return JSON.parse(jsonString)
    } catch (fallbackError) {
      console.log('❌ Fallback parsing also failed')
    }
    
    return null
  }
}

/**
 * Test function for Unicode parsing
 */
export function testUnicodeParsing() {
  // Test with actual Unicode escapes from your data
  const testString = '{\\u0022ContentItemId\\u0022:\\u002246ph5xr9mmsfk7w3prcxdmvscn\\u0022,\\u0022CaseType\\u0022:{\\u0022Title\\u0022:{\\u0022Text\\u0022:\\u0022Test Case Type\\u0022},\\u0022Prefix\\u0022:{\\u0022Text\\u0022:\\u0022TEST-{{yy}}\\u0022}}'
  const result = parseUnicodeJson(testString)
  console.log('🧪 Unicode parsing test:', result)
  return result
}

/**
 * Debug function to analyze Unicode sequences in a string
 */
export function debugUnicodeSequences(jsonString: string) {
  console.log('🔍 Analyzing Unicode sequences in string...')
  
  // Find all Unicode sequences
  const unicodeMatches = jsonString.match(/\\u[0-9A-Fa-f]{4}/g)
  if (unicodeMatches) {
    console.log('Found Unicode sequences:', unicodeMatches)
    const uniqueSequences = [...new Set(unicodeMatches)]
    console.log('Unique Unicode sequences:', uniqueSequences)
    
    uniqueSequences.forEach(seq => {
      const charCode = parseInt(seq.substring(2), 16)
      console.log(`${seq} -> "${String.fromCharCode(charCode)}" (${charCode})`)
    })
  } else {
    console.log('No Unicode sequences found')
  }
  
  // Check for problematic escape sequences around position 434
  const position = 434
  const context = jsonString.substring(Math.max(0, position - 20), position + 20)
  console.log('Context around error position:', context)
  
  return unicodeMatches
}

/**
 * Test function for CaseType parsing with real data
 */
export function testCaseTypeParsing() {
  // Test with direct content structure (what we expect from API)
  const testItemDirect = {
    "ContentItemId": "46ph5xr9mmsfk7w3prcxdmvscn",
    "ContentType": "CaseType",
    "DisplayText": "Test Case Type",
    "CaseType": {
      "Title": {"Text": "Test Case Type"},
      "Prefix": {"Text": "TEST-{{yy}}"},
      "Suffix": {"Text": null},
      "UseAutoNumber": {"Value": true},
      "AutoLicense": {"Value": false},
      "CaseSubTypes": {"Text": "4bfvr4xwk8mhkr6kw5383eq1wa"},
      "InspectionType": {"Value": true},
      "NumberOfDigits": {"Text": "4"}
    }
  }

  console.log('🧪 Testing CaseType parsing with direct content structure')
  
  // Test parseContentByType with direct structure
  const parsedContentDirect = parseContentByType('CaseType', testItemDirect)
  console.log('✅ Parsed content (direct):', parsedContentDirect)
  
  // Test mapping
  const contentItemDirect: ContentItem = {
    ContentItemId: testItemDirect.ContentItemId,
    DisplayText: testItemDirect.DisplayText,
    ParsedContent: parsedContentDirect
  }
  
  const mappedItemsDirect = mapApiItemsToStore('CaseType', [contentItemDirect])
  console.log('🔄 Mapped item (direct):', mappedItemsDirect[0])
  
  return mappedItemsDirect[0]
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
        console.log('🔧 Extracting CaseType from parsed content')
        return parsed.CaseType || null
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
        console.log(`🔧 No specific handler for ${contentType}, returning parsed content`)
        return parsed
    }
  }
  
  console.log('❌ No Content field or direct property found')
  console.log('Item available properties:', item ? Object.keys(item) : 'item is null/undefined')
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
  console.log('🚀 NEW VERSION: fetchContentItems called with Tauri backend')
  console.log(`🔍 Fetching ${contentType} from staging URL: ${stagingUrl}`)
  
  // Encode parameters as JSON for Orchard Core queries API
  const parameters = JSON.stringify({ contentType })
  const encodedParameters = encodeURIComponent(parameters)
  
  // Use the correct Orchard Core queries API format
  const apiUrl = `${stagingUrl.replace(/\/$/, '')}/api/queries/GetAllContentItemsByContentType?parameters=${encodedParameters}`
  
  console.log(`🌐 Fetching from: ${apiUrl}`)
  
  try {
    console.log('🔧 About to call Tauri invoke with URL:', apiUrl)
    
    // Use Tauri backend to bypass CORS entirely (same as case export wizard)
    const responseText = await invoke('fetch_api', { url: apiUrl })
    
    console.log('📨 Tauri invoke response received, length:', (responseText as string)?.length || 0)
    
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
    
    // Validate response format
    if (!Array.isArray(data)) {
      console.warn(`⚠️ Invalid response format for ${contentType}: expected array, got`, typeof data)
      throw new Error('Invalid response format: expected array')
    }
    
    // Filter and validate items, and parse Content field
    const validItems = data.filter((item: any) => 
      item && 
      typeof item.ContentItemId === 'string' && 
      typeof item.DisplayText === 'string'
    ).map((item: any): ContentItem => {
      const contentItem: ContentItem = {
        ContentItemId: item.ContentItemId,
        DisplayText: item.DisplayText
      }

      // Parse content from the API response item
      try {
        // Debug: log the full item structure
        console.log(`🔍 Processing item: ${item.DisplayText}`)
        console.log('Item keys:', Object.keys(item))
        console.log('Has Content field:', 'Content' in item)
        console.log('Has CaseType field:', 'CaseType' in item)
        
        if (item.Content) {
          console.log('Content type:', typeof item.Content)
          console.log('Content length:', item.Content.length)
          console.log('Content (first 200 chars):', typeof item.Content === 'string' ? item.Content.substring(0, 200) : item.Content)
        }
        
        contentItem.ParsedContent = parseContentByType(contentType, item)
        
        if (contentItem.ParsedContent) {
          console.log(`✅ Parsed content for ${item.DisplayText}:`, contentItem.ParsedContent)
        } else {
          console.warn(`⚠️ Failed to parse content for ${item.DisplayText}`)
        }
      } catch (error) {
        console.error(`💥 Error parsing content for ${item.DisplayText}:`, error)
        console.error('Error stack:', error.stack)
      }

      return contentItem
    })
    
    console.log(`✅ Valid items for ${contentType}:`, validItems.length, 'out of', data.length)
    
    if (validItems.length > 0) {
      console.log(`📝 Sample item for ${contentType}:`, validItems[0])
      if (validItems[0].ParsedContent) {
        console.log(`📋 Sample parsed content:`, validItems[0].ParsedContent)
      }
    }
    
    return validItems
  } catch (tauriError) {
    console.error(`💥 Tauri failed to fetch ${contentType}:`, tauriError)
    console.log('🔍 Tauri Error type:', typeof tauriError)
    console.log('🔍 Tauri Error message:', (tauriError as Error)?.message || 'No message')
    
    throw new Error(`API request failed: ${(tauriError as Error)?.message || 'Unknown error'}`)
  }
}

/**
 * Mock data for testing when API is not available
 */
export function getMockData(contentType: SyncContentType): ContentItem[] {
  const mockData: Record<SyncContentType, ContentItem[]> = {
    'CaseStatus': [
      { ContentItemId: 'mock-case-status-1', DisplayText: 'Draft' },
      { ContentItemId: 'mock-case-status-2', DisplayText: 'Under Review' },
      { ContentItemId: 'mock-case-status-3', DisplayText: 'Approved' }
    ],
    'CaseSubType': [
      { ContentItemId: 'mock-case-subtype-1', DisplayText: 'Building Permit' },
      { ContentItemId: 'mock-case-subtype-2', DisplayText: 'Zoning Variance' }
    ],
    'InspectionType': [
      { ContentItemId: 'mock-inspection-1', DisplayText: 'Foundation Inspection' },
      { ContentItemId: 'mock-inspection-2', DisplayText: 'Electrical Inspection' }
    ],
    'LicenseType': [
      { ContentItemId: 'mock-license-1', DisplayText: 'Business License' },
      { ContentItemId: 'mock-license-2', DisplayText: 'Contractor License' }
    ],
    'LicenseSubType': [
      { ContentItemId: 'mock-license-sub-1', DisplayText: 'General Contractor' },
      { ContentItemId: 'mock-license-sub-2', DisplayText: 'Electrical Contractor' }
    ],
    'LicenseStatus': [
      { ContentItemId: 'mock-license-status-1', DisplayText: 'Applied' },
      { ContentItemId: 'mock-license-status-2', DisplayText: 'Issued' }
    ],
    'CaseType': [
      { 
        ContentItemId: 'mock-case-type-1', 
        DisplayText: 'Permit Application',
        Content: JSON.stringify({
          CaseType: {
            Title: { Text: 'Permit Application' },
            Prefix: { Text: 'PA-' },
            Suffix: { Text: '-2025' },
            UseAutoNumber: { Value: true },
            AutoLicense: { Value: false },
            CaseSubTypes: { Text: 'subtype1,subtype2' }
          }
        }).replace(/"/g, '\\u0022')
      },
      { 
        ContentItemId: 'mock-case-type-2', 
        DisplayText: 'Code Enforcement',
        Content: JSON.stringify({
          CaseType: {
            Title: { Text: 'Code Enforcement' },
            Prefix: { Text: 'CE-' },
            Suffix: { Text: null },
            UseAutoNumber: { Value: false },
            AutoLicense: { Value: true },
            CaseSubTypes: { Text: null }
          }
        }).replace(/"/g, '\\u0022')
      }
    ],
    'AccountingDetails': [
      { 
        ContentItemId: 'mock-accounting-1', 
        DisplayText: 'Application Fee',
        Content: JSON.stringify({
          AccountingDetails: {
            Title: { Text: 'Application Fee' },
            GLKey: { Text: '1001' },
            TranCode: { Text: 'APP' },
            FeeCode: { Text: 'FEE001' },
            FeeAbbreviation: { Text: 'APPFEE' }
          }
        }).replace(/"/g, '\\u0022')
      },
      { 
        ContentItemId: 'mock-accounting-2', 
        DisplayText: 'Permit Fee',
        Content: JSON.stringify({
          AccountingDetails: {
            Title: { Text: 'Permit Fee' },
            GLKey: { Text: '1002' },
            TranCode: { Text: 'PER' },
            FeeCode: { Text: 'FEE002' },
            FeeAbbreviation: { Text: 'PERFEE' }
          }
        }).replace(/"/g, '\\u0022')
      }
    ]
  }
  
  return mockData[contentType] || []
}

/**
 * Syncs all content types from the API
 */
export async function syncAllContentTypes(
  stagingUrl: string,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult[]> {
  const results: SyncResult[] = []
  
  for (let i = 0; i < SYNC_CONTENT_TYPES.length; i++) {
    const contentType = SYNC_CONTENT_TYPES[i]
    
    // Update progress
    onProgress?.({
      current: contentType,
      total: SYNC_CONTENT_TYPES.length,
      completed: i
    })
    
    try {
      const items = await fetchContentItems(stagingUrl, contentType)
      results.push({
        contentType,
        success: true,
        items
      })
    } catch (error) {
      console.error(`API failed for ${contentType}:`, error)
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

/**
 * Maps API content items to store-specific format
 */
export function mapApiItemsToStore(
  contentType: SyncContentType,
  items: ContentItem[],
  currentProjectData?: any
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
        const subtypes = content?.CaseSubTypes?.Text 
          ? convertContentItemIdsToNames(content.CaseSubTypes.Text, currentProjectData?.projectBuild?.subtypes || [])
          : []
        
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
  if (!contentItemIds || !subtypes) return []
  
  const subtypeMap = new Map()
  subtypes.forEach(subtype => {
    subtypeMap.set(subtype.govbuiltContentItemId, subtype.name)
  })
  
  return contentItemIds
    .split(',')
    .map(id => id.trim())
    .filter(id => id)
    .map(id => subtypeMap.get(id) || `Unknown (${id})`)
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
  console.log('Testing API connection to:', stagingUrl)
  
  try {
    const result = await fetchContentItems(stagingUrl, 'CaseStatus')
    console.log('✅ API connection successful!', result)
    return result
  } catch (error) {
    console.error('❌ API connection failed:', error)
    return null
  }
}

/**
 * Test function to check content parsing
 */
export async function testContentParsing(stagingUrl: string, contentType: SyncContentType = 'CaseType') {
  console.log(`🧪 Testing content parsing for ${contentType} at ${stagingUrl}`)
  
  try {
    const items = await fetchContentItems(stagingUrl, contentType)
    console.log(`📊 Fetched ${items.length} items`)
    
    if (items.length > 0) {
      const firstItem = items[0]
      console.log(`📝 First item:`, firstItem)
      
      if (firstItem.Content) {
        console.log(`🔤 Raw Content:`, firstItem.Content)
      }
      
      if (firstItem.ParsedContent) {
        console.log(`✅ Parsed Content:`, firstItem.ParsedContent)
      }
      
      // Test mapping
      const mappedItems = mapApiItemsToStore(contentType, items)
      console.log(`🔄 Mapped items:`, mappedItems[0])
    }
    
    return items
  } catch (error) {
    console.error(`❌ Content parsing test failed:`, error)
    return null
  }
}

// Make test functions available globally
if (typeof window !== 'undefined') {
  (window as any).testApiConnection = testApiConnection
  ;(window as any).testContentParsing = testContentParsing
  ;(window as any).testUnicodeParsing = testUnicodeParsing
  ;(window as any).testCaseTypeParsing = testCaseTypeParsing
  ;(window as any).debugUnicodeSequences = debugUnicodeSequences
  ;(window as any).testAllEndpoints = async function(stagingUrl: string, contentType: string = 'CaseStatus') {
    console.log('🧪 Testing API endpoint for', contentType, 'at', stagingUrl)
    
    // Encode parameters as JSON for Orchard Core queries API
    const parameters = JSON.stringify({ contentType })
    const encodedParameters = encodeURIComponent(parameters)
    
    const apiUrl = `${stagingUrl.replace(/\/$/, '')}/api/queries/GetAllContentItemsByContentType?parameters=${encodedParameters}`
    
    try {
      console.log(`🌐 Testing: ${apiUrl}`)
      
      // Use Tauri backend to bypass CORS (same as case export wizard)
      const responseText = await invoke('fetch_api', { url: apiUrl })
      
      if (!responseText) {
        console.log('❌ No response from server')
        return
      }

    let data: any
    try {
      data = JSON.parse(responseText as string)
        console.log('📊 Data:', data)
        console.log(`📏 Type:`, typeof data, Array.isArray(data) ? 'array' : 'not array')
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError)
        console.log('Response text:', responseText)
        return
      }
      
      if (Array.isArray(data)) {
        const validItems = data.filter((item: any) => 
          item && 
          typeof item.ContentItemId === 'string' && 
          typeof item.DisplayText === 'string'
        )
        console.log(`✅ Valid items:`, validItems.length, 'out of', data.length)
        if (validItems.length > 0) {
          console.log(`📝 Sample:`, validItems[0])
        }
      }
    } catch (error) {
      console.log(`❌ Error:`, error)
    }
  }
}