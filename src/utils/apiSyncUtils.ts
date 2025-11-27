// src/utils/apiSyncUtils.ts
import { invoke } from '@tauri-apps/api/core'

export interface ContentItem {
  ContentItemId: string
  DisplayText: string
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
    
    // Validate response format
    if (!Array.isArray(data)) {
      console.warn(`⚠️ Invalid response format for ${contentType}: expected array, got`, typeof data)
      throw new Error('Invalid response format: expected array')
    }
    
    // Filter and validate items
    const validItems = data.filter((item: any) => 
      item && 
      typeof item.ContentItemId === 'string' && 
      typeof item.DisplayText === 'string'
    )
    
    console.log(`✅ Valid items for ${contentType}:`, validItems.length, 'out of', data.length)
    
    if (validItems.length > 0) {
      console.log(`📝 Sample item for ${contentType}:`, validItems[0])
    }
    
    return validItems
  } catch (tauriError) {
    console.error(`💥 Tauri failed to fetch ${contentType}:`, tauriError)
    console.log('🔍 Tauri Error type:', typeof tauriError)
    console.log('🔍 Tauri Error message:', (tauriError as Error)?.message || 'No message')
    
    // Fallback to browser fetch for debugging
    console.log('🔄 Trying fallback to browser fetch...')
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array')
      }
      
      const validItems = data.filter((item: any) => 
        item && 
        typeof item.ContentItemId === 'string' && 
        typeof item.DisplayText === 'string'
      )
      
      console.log(`✅ Browser fetch fallback worked for ${contentType}:`, validItems.length, 'items')
      return validItems
    } catch (browserError) {
      console.error(`💥 Browser fetch also failed for ${contentType}:`, browserError)
      throw new Error(`Both Tauri and browser fetch failed: ${(tauriError as Error)?.message} | ${(browserError as Error)?.message}`)
    }
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
      { ContentItemId: 'mock-case-type-1', DisplayText: 'Permit Application' },
      { ContentItemId: 'mock-case-type-2', DisplayText: 'Code Enforcement' }
    ],
    'AccountingDetails': [
      { ContentItemId: 'mock-accounting-1', DisplayText: 'Application Fee' },
      { ContentItemId: 'mock-accounting-2', DisplayText: 'Permit Fee' }
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
  items: ContentItem[]
): any[] {
  switch (contentType) {
    case 'CaseStatus':
      return items.map(item => ({
        id: crypto.randomUUID(), // Generate local ID
        govbuiltContentItemId: item.ContentItemId,
        title: item.DisplayText,
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
      }))
    
    case 'LicenseStatus':
      return items.map(item => ({
        id: crypto.randomUUID(),
        govbuiltContentItemId: item.ContentItemId,
        title: item.DisplayText,
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
      }))
    
    case 'CaseType':
      return items.map(item => ({
        id: crypto.randomUUID(),
        govbuiltContentItemId: item.ContentItemId,
        title: item.DisplayText,
        prefix: '',
        suffix: '',
        autoNumber: true,
        autoLicense: false,
        subtypes: [],
        workflowId: undefined,
      }))
    
    case 'LicenseType':
      return items.map(item => ({
        id: crypto.randomUUID(),
        govbuiltContentItemId: item.ContentItemId,
        title: item.DisplayText,
        prefix: '',
        suffix: '',
        autoNumber: true,
        autoLicense: false,
        subtypes: [],
        workflowId: undefined,
      }))
    
    case 'InspectionType':
      return items.map(item => ({
        id: crypto.randomUUID(),
        govbuiltContentItemId: item.ContentItemId,
        title: item.DisplayText,
        durationHours: 1,
        workflowId: undefined,
      }))
    
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
      return items.map(item => ({
        id: crypto.randomUUID(),
        govbuiltContentItemId: item.ContentItemId,
        title: item.DisplayText,
        glKey: '',
        tranCode: '',
        feeCode: '',
        feeAbbreviation: '',
        notes: '',
        debitAccountNumber: '',
        debitAccountTransferNumber: '',
        feeDetails: '',
      }))
    
    default:
      throw new Error(`Unknown content type: ${contentType}`)
  }
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

// Make test functions available globally
if (typeof window !== 'undefined') {
  (window as any).testApiConnection = testApiConnection
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

      let data
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