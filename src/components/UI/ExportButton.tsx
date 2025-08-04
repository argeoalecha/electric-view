'use client'

import { useState } from 'react'
import { getExportFunction, type ExportFormat } from '@/utils/lazyExports'

interface ExportOption {
  format: ExportFormat
  label: string
  icon: string
}

interface ExportButtonProps {
  data: any[]
  filename: string
  title: string
  columns: Array<{
    key: string
    label: string
    format?: (value: any) => string
  }>
  className?: string
}

export default function ExportButton({ 
  data, 
  filename, 
  title, 
  columns, 
  className = '' 
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportOptions: ExportOption[] = [
    { format: 'pdf', label: 'Export as PDF', icon: '📄' },
    { format: 'excel', label: 'Export as Excel', icon: '📊' },
    { format: 'csv', label: 'Export as CSV', icon: '📝' }
  ]

  const formatData = () => {
    return data.map(item => {
      const formattedItem: Record<string, any> = {}
      columns.forEach(col => {
        const value = item[col.key]
        formattedItem[col.label] = col.format ? col.format(value) : value
      })
      return formattedItem
    })
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(18)
    doc.setTextColor(40, 40, 40)
    doc.text(title, 14, 20)
    
    // Add timestamp
    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text(`Generated on: ${new Date().toLocaleString('en-PH', { 
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 14, 30)

    // Prepare table data
    const tableColumns = columns.map(col => col.label)
    const tableRows = data.map(item => 
      columns.map(col => {
        const value = item[col.key]
        return col.format ? col.format(value) : String(value || '')
      })
    )

    // Add table
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [20, 184, 166], // Teal color
        textColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      }
    })

    // Add footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Philippine CRM - Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      )
    }

    doc.save(`${filename}.pdf`)
  }

  const exportToExcel = () => {
    const formattedData = formatData()
    const ws = XLSX.utils.json_to_sheet(formattedData)
    
    // Set column widths
    const colWidths = columns.map(col => ({ wch: 15 }))
    ws['!cols'] = colWidths

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')

    // Add metadata
    wb.Props = {
      Title: title,
      Subject: 'Philippine CRM Export',
      Author: 'Philippine CRM',
      CreatedDate: new Date()
    }

    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  const exportToCSV = () => {
    const formattedData = formatData()
    const ws = XLSX.utils.json_to_sheet(formattedData)
    const csv = XLSX.utils.sheet_to_csv(ws)

    // Add BOM for proper UTF-8 encoding
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
    
    URL.revokeObjectURL(link.href)
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true)
    
    try {
      switch (format) {
        case 'pdf':
          exportToPDF()
          break
        case 'excel':
          exportToExcel()
          break
        case 'csv':
          exportToCSV()
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || data.length === 0}
        className={`
          flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg
          hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isExporting ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
            <span className="text-sm">Exporting...</span>
          </>
        ) : (
          <>
            <DownloadIcon className="w-4 h-4" />
            <span className="text-sm">Export</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && !isExporting && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-2">
            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
              Export {data.length} items
            </div>
            {exportOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}