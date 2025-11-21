// Utility functions for importing inspection types from CSV and Excel files
import { InspectionType } from '@/stores/inspectionTypeStore'
import * as XLSX from 'xlsx'

export interface ImportResult {
  success: boolean
  importedCount: number
  message: string
  errors?: string[]
}

/**
 * Parse CSV content into inspection types
 */
function parseCSVContent(csvContent: string): Promise<InspectionType[]> {
  return new Promise((resolve, reject) => {
    try {
      const lines = csvContent.trim().split('\n')

      // Skip header row
      const rows = lines.slice(1)

      const types: InspectionType[] = []

      for (const line of rows) {
        const values = line.split(',').map(value => value.trim().replace(/^\"(.*)\"$/, '$1'))

        // Skip empty lines
        if (values.length < 2 || !values[0] || !values[1]) continue

        // Parse duration - handle cases where it might be missing or invalid
        let durationHours = 0
        if (values[1]) {
          const parsedDuration = parseFloat(values[1])
          if (!isNaN(parsedDuration) && parsedDuration >= 0) {
            durationHours = parsedDuration
          }
        }

        const type: InspectionType = {
          id: '',
          title: String(values[0] || ''),
          durationHours: durationHours
        }

        types.push(type)
      }

      resolve(types)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Parse Excel content into inspection types
 */
async function parseExcelContent(arrayBuffer: ArrayBuffer, _fileName: string): Promise<InspectionType[]> {
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

      const types: InspectionType[] = []

      for (const row of rows) {
        if (row.length < 2 || !row[0] || !row[1]) continue // Skip empty lines

        // Parse duration - handle cases where it might be missing or invalid
        let durationHours = 0
        if (row[1]) {
          const parsedDuration = parseFloat(row[1])
          if (!isNaN(parsedDuration) && parsedDuration >= 0) {
            durationHours = parsedDuration
          }
        }

        const type: InspectionType = {
          id: '',
          title: String(row[0] || ''),
          durationHours: durationHours
        }

        types.push(type)
      }

      resolve(types)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Import inspection types from file content
 */
import { useInspectionTypeStore } from '@/stores/inspectionTypeStore'

export async function importInspectionTypesFromFile(
  content: string | ArrayBuffer,
  fileName: string
): Promise<ImportResult> {
  try {
    let types: InspectionType[] = []

    if (fileName.toLowerCase().endsWith('.csv')) {
      const csvContent = typeof content === 'string'
        ? content
        : new TextDecoder('utf-8').decode(content)
      types = await parseCSVContent(csvContent)
    } else {
      types = await parseExcelContent(content as ArrayBuffer, fileName)
    }

    // Save to inspection type store
    const inspectionTypeStore = useInspectionTypeStore()
    let savedCount = 0

    for (const type of types) {
      // Let the store handle saving - it will assign ID and validate
      await inspectionTypeStore.save(type)
      // Since save() returns void, we just increment counter regardless
      savedCount++
    }

    const importResult: ImportResult = {
      success: true,
      importedCount: savedCount,
      message: `Successfully imported ${savedCount} inspection types`
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