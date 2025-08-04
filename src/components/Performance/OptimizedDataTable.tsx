'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { debounce } from '@/utils/performanceSimple'

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: number
  render?: (value: any, row: any) => React.ReactNode
}

interface OptimizedDataTableProps {
  data: any[]
  columns: Column[]
  pageSize?: number
  searchable?: boolean
  sortable?: boolean
  className?: string
}

// Memoized table row component
const TableRow = memo(({ 
  item, 
  columns, 
  index 
}: { 
  item: any, 
  columns: Column[], 
  index: number 
}) => {
  return (
    <tr 
      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
    >
      {columns.map((column) => (
        <td 
          key={column.key}
          className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200"
          style={{ width: column.width }}
        >
          {column.render 
            ? column.render(item[column.key], item)
            : item[column.key]
          }
        </td>
      ))}
    </tr>
  )
})

TableRow.displayName = 'TableRow'

// Memoized table header
const TableHeader = memo(({ 
  columns, 
  sortConfig, 
  onSort 
}: { 
  columns: Column[], 
  sortConfig: { key: string, direction: 'asc' | 'desc' } | null,
  onSort: (key: string) => void 
}) => {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
              column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
            }`}
            style={{ width: column.width }}
            onClick={() => column.sortable && onSort(column.key)}
          >
            <div className="flex items-center space-x-1">
              <span>{column.label}</span>
              {column.sortable && sortConfig?.key === column.key && (
                <span className="text-teal-600">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
})

TableHeader.displayName = 'TableHeader'

export default function OptimizedDataTable({
  data,
  columns,
  pageSize = 50,
  searchable = true,
  sortable = true,
  className = ''
}: OptimizedDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term)
      setCurrentPage(1)
    }, 300),
    []
  )

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = data.filter(item =>
        columns.some(column => {
          const value = item[column.key]
          return value && value.toString().toLowerCase().includes(searchLower)
        })
      )
    }

    // Apply sorting
    if (sortConfig && sortable) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sortConfig, columns, sortable])

  // Memoized pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return processedData.slice(startIndex, startIndex + pageSize)
  }, [processedData, currentPage, pageSize])

  // Sort handler
  const handleSort = useCallback((key: string) => {
    if (!sortable) return
    
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }, [sortable])

  // Calculate pagination info
  const totalPages = Math.ceil(processedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, processedData.length)

  const displayData = paginatedData

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Search bar */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Table container */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader 
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((item, index) => (
              <TableRow
                key={item.id || index}
                item={item}
                columns={columns}
                index={index}
              />
            ))}
          </tbody>
        </table>

        {displayData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No results found' : 'No data available'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex} to {endIndex} of {processedData.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(current => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(current => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}