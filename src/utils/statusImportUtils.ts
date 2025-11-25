// Utility functions for importing statuses from CSV and Excel files
import * as XLSX from 'xlsx'

export interface Status {
  id?: string
  title: string
  hideFromStatusFlowChevron: boolean
  notifyAssignedTeamMembers: boolean
  notifyOtherTeamMembers: boolean
  notifyApplicant: boolean
  notifyAllContacts: boolean
  notifyOtherRecipient: boolean
  emailBodyAssignedTeamMembers?: string
  emailBodyOtherTeamMembers?: string
  emailBodyApplicant?: string
  emailBodyAllContacts?: string
  emailBodyOtherRecipient?: string
}

export interface ImportResult {
  success: boolean
  importedCount: number
  message: string
  errors?: string[]
}

/**
 * Parse CSV content into statuses
 */
function parseCSVContent(csvContent: string): Promise<Status[]> {
  return new Promise((resolve, reject) => {
    try {
      const lines = csvContent.trim().split('\n')

      // Skip header row
      const rows = lines.slice(1)

      const statuses: Status[] = []

      for (const line of rows) {
        const values = line.split(',').map(value => value.trim().replace(/^"(.*)"$/, '$1'))

        // Skip empty lines
        if (values.length < 2 || !values[0]) continue

        const status: Status = {
          title: String(values[0] || ''),
          hideFromStatusFlowChevron: values[1]?.toLowerCase() === 'true',
          notifyAssignedTeamMembers: values[2]?.toLowerCase() === 'true',
          notifyOtherTeamMembers: values[3]?.toLowerCase() === 'true',
          notifyApplicant: values[4]?.toLowerCase() === 'true',
          notifyAllContacts: values[5]?.toLowerCase() === 'true',
          notifyOtherRecipient: values[6]?.toLowerCase() === 'true',
          emailBodyAssignedTeamMembers: values[7] || undefined,
          emailBodyOtherTeamMembers: values[8] || undefined,
          emailBodyApplicant: values[9] || undefined,
          emailBodyAllContacts: values[10] || undefined,
          emailBodyOtherRecipient: values[11] || undefined
        }

        statuses.push(status)
      }

      resolve(statuses)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Parse Excel content into statuses
 */
async function parseExcelContent(arrayBuffer: ArrayBuffer, _fileName: string): Promise<Status[]> {
  return new Promise((resolve, reject) => {
    try {
      // Convert array buffer to workbook
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      // Skip header row and process data
      const rows = jsonData.slice(1) as string[][]

      const statuses: Status[] = []

      for (const row of rows) {
        if (row.length < 2 || !row[0]) continue // Skip empty lines

        const status: Status = {
          title: String(row[0] || ''),
          hideFromStatusFlowChevron: row[1]?.toString().toLowerCase() === 'true',
          notifyAssignedTeamMembers: row[2]?.toString().toLowerCase() === 'true',
          notifyOtherTeamMembers: row[3]?.toString().toLowerCase() === 'true',
          notifyApplicant: row[4]?.toString().toLowerCase() === 'true',
          notifyAllContacts: row[5]?.toString().toLowerCase() === 'true',
          notifyOtherRecipient: row[6]?.toString().toLowerCase() === 'true',
          emailBodyAssignedTeamMembers: row[7] || undefined,
          emailBodyOtherTeamMembers: row[8] || undefined,
          emailBodyApplicant: row[9] || undefined,
          emailBodyAllContacts: row[10] || undefined,
          emailBodyOtherRecipient: row[11] || undefined
        }

        statuses.push(status)
      }

      resolve(statuses)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Import statuses from file content
 */
import { useStatusStore } from '@/stores/statusStore'

export async function importStatusesFromFile(
  content: string | ArrayBuffer,
  fileName: string
): Promise<ImportResult> {
  try {
    let statuses: Status[] = []

    if (fileName.toLowerCase().endsWith('.csv')) {
      const csvContent = typeof content === 'string'
        ? content
        : new TextDecoder('utf-8').decode(content)
      statuses = await parseCSVContent(csvContent)
    } else {
      statuses = await parseExcelContent(content as ArrayBuffer, fileName)
    }

    // Save to status store
    const statusStore = useStatusStore()
    let savedCount = 0

    for (const status of statuses) {
      // Let the store assign the real UUID
      delete status.id

      await statusStore.add(status)
      savedCount++
    }

    const importResult: ImportResult = {
      success: true,
      importedCount: savedCount,
      message: `Successfully imported ${savedCount} statuses`
    }

    return importResult

  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error during import'
    return {
      success: false,
      importedCount: 0,
      message: `Import failed: ${errorMessage}`,
      errors: [errorMessage]
    }
  }
}