// Utility functions for exporting accounting details to Orchard Core recipe format
import { useAccountingStore } from '@/stores/acountingStore'
import { useProjectStore } from '@/stores/projectStore'
import { invoke } from '@tauri-apps/api/core'

export interface AccountingDetailExport {
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
  AccountingDetails: {
    GLKey: { Text: string | null }
    TranCode: { Text: string | null }
    FeeAbbreviation: { Text: string | null }
    Notes: { Text: string | null }
    FeeCode: { Text: string | null }
    DebitAccountNumber: { Text: string | null }
    DebitAccountTransferNumber: { Text: string | null }
    FeeDetails: { Text: string | null }
  }
  TitlePart: { Title: string }
}

export interface OrchardCoreAccountingRecipe {
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
    data: AccountingDetailExport[]
  }>
}

/**
 * Build Orchard Core recipe JSON string for accounting details
 */
function buildGovBuiltImportString(list: any[]): string {
  const indent = (level: number) => '  '.repeat(level)

  const itemToString = (detail: any) => {
    // use JSON.stringify for values to ensure safe escaping
    const title = JSON.stringify(detail.title || null)
    const glKey = JSON.stringify(detail.glKey || null)
    const tranCode = JSON.stringify(detail.tranCode || null)
    const feeAbbreviation = JSON.stringify(detail.feeAbbreviation || null)
    const notes = JSON.stringify(detail.notes || null)
    const feeCode = JSON.stringify(detail.feeCode || null)
    const debitAccountNumber = JSON.stringify(detail.debitAccountNumber || null)
    const debitAccountTransferNumber = JSON.stringify(detail.debitAccountTransferNumber || null)
    const feeDetails = JSON.stringify(detail.feeDetails || null)

    // Build object text in EXACT desired order (keys ordered as written)
    return [
      '{',
      `${indent(3)}"ContentItemId": "[js: uuid()]",`,
      `${indent(3)}"ContentItemVersionId": "[js: uuid()]",`,
      `${indent(3)}"ContentType": "AccountingDetails",`,
      `${indent(3)}"DisplayText": ${title},`,
      `${indent(3)}"Latest": true,`,
      `${indent(3)}"Published": true,`,
      `${indent(3)}"ModifiedUtc": "[js: new Date()]",`,
      `${indent(3)}"PublishedUtc": "[js: new Date()]",`,
      `${indent(3)}"CreatedUtc": "[js: new Date()]",`,
      `${indent(3)}"Owner": "[js: parameters('AdminUserId')]",`,
      `${indent(3)}"Author": "[js: parameters('AdminUsername')]",`,
      `${indent(3)}"AccountingDetails": {`,
      `${indent(4)}"GLKey": { "Text": ${glKey} },`,
      `${indent(4)}"TranCode": { "Text": ${tranCode} },`,
      `${indent(4)}"FeeAbbreviation": { "Text": ${feeAbbreviation} },`,
      `${indent(4)}"Notes": { "Text": ${notes} },`,
      `${indent(4)}"FeeCode": { "Text": ${feeCode} },`,
      `${indent(4)}"DebitAccountNumber": { "Text": ${debitAccountNumber} },`,
      `${indent(4)}"DebitAccountTransferNumber": { "Text": ${debitAccountTransferNumber} },`,
      `${indent(4)}"FeeDetails": { "Text": ${feeDetails} }`,
      `${indent(3)}} ,`,
      `${indent(3)}"TitlePart": { "Title": ${title} }`,
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
 * Export accounting details to Import Files folder in project directory
 */
export async function exportAccountingDetailsToFile(
  projectName: string = "GovBuilder Project"
): Promise<{ success: boolean; error?: string }> {
  try {
    const accountingStore = useAccountingStore()
    const projectStore = useProjectStore()
    const list = accountingStore.list.value

    if (!list || list.length === 0) {
      return {
        success: false,
        error: 'No accounting details to export'
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
    const fullPath = `${currentProjectPath}/Import Files/AccountingDetails.json`

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