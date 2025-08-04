'use client'

import { useState } from 'react'

interface SearchFilter {
  id: string
  label: string
  type: 'text' | 'select' | 'date' | 'number' | 'multiselect'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

interface AdvancedSearchProps {
  filters: SearchFilter[]
  onSearch: (filters: Record<string, any>) => void
  onReset: () => void
  savedFilters?: Array<{ name: string; filters: Record<string, any> }>
  onSaveFilter?: (name: string, filters: Record<string, any>) => void
}

export default function AdvancedSearch({ 
  filters, 
  onSearch, 
  onReset, 
  savedFilters = [],
  onSaveFilter 
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})
  const [saveFilterName, setSaveFilterName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...filterValues, [filterId]: value }
    setFilterValues(newFilters)
    onSearch(newFilters)
  }

  const handleReset = () => {
    setFilterValues({})
    onReset()
  }

  const handleSaveFilter = () => {
    if (saveFilterName.trim() && onSaveFilter) {
      onSaveFilter(saveFilterName.trim(), filterValues)
      setSaveFilterName('')
      setShowSaveDialog(false)
    }
  }

  const loadSavedFilter = (savedFilter: Record<string, any>) => {
    setFilterValues(savedFilter)
    onSearch(savedFilter)
  }

  const activeFilterCount = Object.values(filterValues).filter(value => 
    value !== undefined && value !== null && value !== ''
  ).length

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-4 mb-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <SearchIcon className="w-5 h-5" />
            <span className="font-medium">Advanced Search</span>
            {activeFilterCount > 0 && (
              <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
                {activeFilterCount} active
              </span>
            )}
            <ChevronIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {savedFilters.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const saved = savedFilters.find(f => f.name === e.target.value)
                  if (saved) loadSavedFilter(saved.filters)
                }
              }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="">Load Saved Filter</option>
              {savedFilters.map((saved, index) => (
                <option key={index} value={saved.name}>{saved.name}</option>
              ))}
            </select>
          )}
          
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Reset
          </button>
          
          {onSaveFilter && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="text-sm text-teal-600 hover:text-teal-800 transition-colors"
            >
              Save Filter
            </button>
          )}
        </div>
      </div>

      {/* Expanded Search Form */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filters.map((filter) => (
            <div key={filter.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              
              {filter.type === 'text' && (
                <input
                  type="text"
                  placeholder={filter.placeholder}
                  value={filterValues[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                />
              )}

              {filter.type === 'select' && (
                <select
                  value={filterValues[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="">All</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {filter.type === 'date' && (
                <input
                  type="date"
                  value={filterValues[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                />
              )}

              {filter.type === 'number' && (
                <input
                  type="number"
                  placeholder={filter.placeholder}
                  value={filterValues[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                />
              )}

              {filter.type === 'multiselect' && (
                <select
                  multiple
                  value={filterValues[filter.id] || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value)
                    handleFilterChange(filter.id, values)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                  size={3}
                >
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Filter name..."
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
            />
            <button
              onClick={handleSaveFilter}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}