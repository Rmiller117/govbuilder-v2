// src/utils/fileImport.ts
import { AccountingDetail } from '@/stores/acountingStore'
import { parse } from 'csv-parse'
import * as XLSX from 'xlsx'

export interface ImportResult {
  success: boolean
  message: string
  importedCount: number
  errors?: string[]
}

/**
 * Parse CSV content into accounting details
 */
export async function parseCSVContent(content: string): Promise<{ details: AccountingDetail[], errors: string[] }> {
  const errors: string[] = []
  const details: AccountingDetail[] = []

  try {
    // Parse CSV content
    const records: any[] = await new Promise((resolve, reject) => {
      parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err: any, output: any[] | PromiseLike<any[]>) => {
        if (err) reject(err)
        else resolve(output)
      })
    })

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      
      // Validate required fields
      if (!record.title || !record.glKey) {
        errors.push(`Row ${i + 1}: Missing required fields (title or glKey)`)
        continue
      }

      const detail: AccountingDetail = {
        id: '',
        title: record.title.trim(),
        glKey: record.glKey.trim(),
        tranCode: record.tranCode?.trim() || undefined,
        feeCode: record.feeCode?.trim() || undefined,
        feeAbbreviation: record.feeAbbreviation?.trim() || undefined,
        notes: record.notes?.trim() || undefined,
        debitAccountNumber: record.debitAccountNumber?.trim() || undefined,
        debitAccountTransferNumber: record.debitAccountTransferNumber?.trim() || undefined,
        feeDetails: record.feeDetails?.trim() || undefined
      }

      details.push(detail)
    }
  } catch (error) {
    errors.push(`Error parsing CSV: ${(error as Error).message}`)
  }

  return { details, errors }
}

/**
 * Parse Excel content into accounting details
 */
export async function parseExcelContent(content: ArrayBuffer): Promise<{ details: AccountingDetail[], errors: string[] }> {
  const errors: string[] = []
  const details: AccountingDetail[] = []

  try {
    // Read workbook from buffer
    const workbook = XLSX.read(content, { type: 'array' })
    
    // Get first worksheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const records: any[] = XLSX.utils.sheet_to_json(worksheet)
    
    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      
      // Validate required fields
      if (!record.title || !record.glKey) {
        errors.push(`Row ${i + 1}: Missing required fields (title or glKey)`)
        continue
      }

      const detail: AccountingDetail = {
        id: '',
        title: record.title.trim(),
        glKey: record.glKey.trim(),
        tranCode: record.tranCode?.trim() || undefined,
        feeCode: record.feeCode?.trim() || undefined,
        feeAbbreviation: record.feeAbbreviation?.trim() || undefined,
        notes: record.notes?.trim() || undefined,
        debitAccountNumber: record.debitAccountNumber?.trim() || undefined,
        debitAccountTransferNumber: record.debitAccountTransferNumber?.trim() || undefined,
        feeDetails: record.feeDetails?.trim() || undefined
      }

      details.push(detail)
    }
  } catch (error) {
    errors.push(`Error parsing Excel: ${(error as Error).message}`)
  }

  return { details, errors }
}

/**
 * Import accounting details from a file
 */
export async function importAccountingDetailsFromFile(fileContent: string | ArrayBuffer, fileName: string): Promise<ImportResult> {
  const errors: string[] = []
  let importedCount = 0

  try {
    if (fileName.toLowerCase().endsWith('.csv')) {
      const { details, errors: parseErrors } = await parseCSVContent(fileContent as string)
      errors.push(...parseErrors)
      importedCount = details.length
      return { success: errors.length === 0, message: `Imported ${importedCount} accounting details from CSV`, importedCount, errors }
    } else if (fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls')) {
      const { details, errors: parseErrors } = await parseExcelContent(fileContent as ArrayBuffer)
      errors.push(...parseErrors)
      importedCount = details.length
      return { success: errors.length === 0, message: `Imported ${importedCount} accounting details from Excel`, importedCount, errors }
    } else {
      return { 
        success: false, 
        message: 'Unsupported file type. Please use CSV or Excel files (.csv, .xlsx, .xls)', 
        importedCount: 0,
        errors: ['Unsupported file type']
      }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Error importing accounting details: ${(error as Error).message}`, 
      importedCount: 0,
      errors: [(error as Error).message]
    }
  }
}