// Lazy loading utility for heavy export libraries
export const lazyPDFExport = async (data: any[], filename: string) => {
  try {
    // Dynamic import of jsPDF and autoTable
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ])

    const doc = new jsPDF()
    
    // Add header
    doc.setFontSize(16)
    doc.text('Philippine CRM Export', 14, 15)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}`, 14, 25)
    
    // Create table
    autoTable(doc, {
      head: [Object.keys(data[0] || {})],
      body: data.map(item => Object.values(item)),
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 118, 110] }, // Teal color
    })
    
    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.error('PDF export failed:', error)
    throw new Error('Failed to export PDF')
  }
}

export const lazyExcelExport = async (data: any[], filename: string) => {
  try {
    // Dynamic import of XLSX library
    const XLSX = await import('xlsx')
    
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    
    // Add metadata
    worksheet['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: 20 }))
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  } catch (error) {
    console.error('Excel export failed:', error)
    throw new Error('Failed to export Excel')
  }
}

export const lazyCSVExport = async (data: any[], filename: string) => {
  try {
    const XLSX = await import('xlsx')
    
    const worksheet = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    
    // Add BOM for proper UTF-8 encoding
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('CSV export failed:', error)
    throw new Error('Failed to export CSV')
  }
}

// Export type definitions
export type ExportFormat = 'pdf' | 'excel' | 'csv'
export type ExportFunction = (data: any[], filename: string) => Promise<void>

export const getExportFunction = (format: ExportFormat): ExportFunction => {
  switch (format) {
    case 'pdf':
      return lazyPDFExport
    case 'excel':
      return lazyExcelExport
    case 'csv':
      return lazyCSVExport
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}