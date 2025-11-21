// Utility functions for handling file imports
export function handleFileUpload(
  file: File,
  onContentLoaded: (content: string) => void,
  onError: (error: string) => void
): void {
  if (!file) {
    onError('No file selected')
    return
  }

  // Check file type
  const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  if (!validTypes.includes(file.type)) {
    onError('Please select a CSV or Excel file')
    return
  }

  const reader = new FileReader()

  reader.onload = (e) => {
    const content = e.target?.result as string
    if (content) {
      onContentLoaded(content)
    } else {
      onError('Failed to read file content')
    }
  }

  reader.onerror = () => {
    onError('Error reading file')
  }

  reader.readAsText(file)
}

export function validateInspectionTypeImportData(data: string): boolean {
  // Basic validation - check if it's CSV format with at least 2 columns
  if (!data || typeof data !== 'string') return false

  const lines = data.trim().split('\n')
  if (lines.length < 2) return false // Need header + at least one row

  // Check that we have at least 2 columns in the header
  const header = lines[0]
  const headerColumns = header.split(',').length
  if (headerColumns < 2) return false

  return true
}