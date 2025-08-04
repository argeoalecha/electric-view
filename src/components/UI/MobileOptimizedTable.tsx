'use client'

import { ReactNode } from 'react'

interface MobileTableProps {
  headers: string[]
  children: ReactNode
  className?: string
}

interface MobileCardProps {
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function MobileOptimizedTable({ headers, children, className = '' }: MobileTableProps) {
  return (
    <div className={className}>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {children}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {children}
      </div>
    </div>
  )
}

export function MobileCard({ children, onClick, className = '' }: MobileCardProps) {
  return (
    <div 
      className={`
        bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/20 p-4
        ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface MobileFieldProps {
  label: string
  value: ReactNode
  className?: string
}

export function MobileField({ label, value, className = '' }: MobileFieldProps) {
  return (
    <div className={`flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0 ${className}`}>
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  )
}

interface MobileActionButtonsProps {
  actions: Array<{
    label: string
    onClick: () => void
    color?: 'primary' | 'secondary' | 'success' | 'danger'
  }>
}

export function MobileActionButtons({ actions }: MobileActionButtonsProps) {
  const getButtonClasses = (color: string = 'primary') => {
    const colors = {
      primary: 'bg-teal-600 text-white hover:bg-teal-700',
      secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
      success: 'bg-green-600 text-white hover:bg-green-700',
      danger: 'bg-red-600 text-white hover:bg-red-700'
    }
    return colors[color as keyof typeof colors] || colors.primary
  }

  return (
    <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`
            flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
            ${getButtonClasses(action.color)}
          `}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}