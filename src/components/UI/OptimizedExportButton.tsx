'use client'

import { useState } from 'react'
import { getExportFunction, type ExportFormat } from '@/utils/lazyExports'

interface ExportOption {
  format: ExportFormat
  label: string
  icon: string
}

interface OptimizedExportButtonProps {
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

export default function OptimizedExportButton({ 
  data, 
  filename, 
  title, 
  columns, 
  className = '' 
}: OptimizedExportButtonProps) {
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

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true)
      setIsOpen(false)
      
      const formattedData = formatData()
      const exportFn = getExportFunction(format)
      await exportFn(formattedData, filename)
      
    } catch (error) {
      console.error(`${format} export failed:`, error)
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || data.length === 0}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${isExporting || data.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg'
          }
        `}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && !isExporting && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-700">{title}</p>
                <p className="text-xs text-gray-500">{data.length} records</p>
              </div>
              
              {exportOptions.map((option) => (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-3"
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}