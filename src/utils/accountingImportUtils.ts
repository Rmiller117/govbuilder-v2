// Utility functions for importing accounting details from CSV and Excel files
import { AccountingDetail } from '@/stores/acountingStore'
import * as XLSX from 'xlsx'

export interface ImportResult {
  success: boolean
  importedCount: number
  message: string
  errors?: string[]
}

/**
 * Parse CSV content into accounting details
 */
function parseCSVContent(csvContent: string): Promise<AccountingDetail[]> {
  return new Promise((resolve, reject) => {
    try {
      const lines = csvContent.trim().split('\n')

      // Skip header row
      const rows = lines.slice(1)

      const details: AccountingDetail[] = []

      for (const line of rows) {
        const values = line.split(',').map(value => value.trim().replace(/^"(.*)"$/, '$1'))

        // Skip empty lines
        if (values.length < 2 || !values[0] || !values[1]) continue

        const detail: AccountingDetail = {
          id: Math.random().toString(36).substr(2, 9),
          title: String(values[0] || ''),
          glKey: String(values[1] || ''),
          tranCode: String(values[2] || ''),
          feeCode: String(values[3] || ''),
          feeAbbreviation: String(values[4] || ''),
          notes: String(values[5] || ''),
          debitAccountNumber: String(values[6] || ''),
          debitAccountTransferNumber: String(values[7] || ''),
          feeDetails: String(values[8] || '')

        }

        details.push(detail)
      }

      resolve(details)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Parse Excel content into accounting details
 */
async function parseExcelContent(arrayBuffer: ArrayBuffer, _fileName: string): Promise<AccountingDetail[]> {
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

      const details: AccountingDetail[] = []

      for (const row of rows) {
        if (row.length < 2 || !row[0] || !row[1]) continue // Skip empty lines

        const detail: AccountingDetail = {
          id: Math.random().toString(36).substr(2, 9),
          title: String(row[0] || ''),
          glKey: String(row[1] || ''),
          tranCode: String(row[2] || ''),
          feeCode: String(row[3] || ''),
          feeAbbreviation: String(row[4] || ''),
          notes: String(row[5] || ''),
          debitAccountNumber: String(row[6] || ''),
          debitAccountTransferNumber: String(row[7] || ''),
          feeDetails: String(row[8] || '')

        }

        details.push(detail)
      }

      resolve(details)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Import accounting details from file content
 */
import { useAccountingStore } from '@/stores/acountingStore'

export async function importAccountingDetailsFromFile(
  content: string | ArrayBuffer,
  fileName: string
): Promise<ImportResult> {
  try {
    let details: AccountingDetail[] = []

    if (fileName.toLowerCase().endsWith('.csv')) {
      const csvContent = typeof content === 'string'
        ? content
        : new TextDecoder('utf-8').decode(content)
      details = await parseCSVContent(csvContent)
    } else {
      details = await parseExcelContent(content as ArrayBuffer, fileName)
    }

    // ⬇️ NEW — Save to accounting store
    const accountingStore = useAccountingStore()
    let savedCount = 0

    for (const detail of details) {
      // Let the store assign the real UUID
      detail.id = ''

      const ok = await accountingStore.save(detail)
      if (ok) savedCount++
    }

    const importResult: ImportResult = {
      success: true,
      importedCount: savedCount,
      message: `Successfully imported ${savedCount} accounting details`
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
