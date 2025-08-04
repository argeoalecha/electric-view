'use client'

import { ReactNode } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'teal' | 'blue' | 'gray'
  className?: string
}

export function LoadingSpinner({ size = 'md', color = 'teal', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  const colorClasses = {
    teal: 'border-teal-600',
    blue: 'border-blue-600',
    gray: 'border-gray-600'
  }

  return (
    <div className={`
      animate-spin rounded-full border-2 border-t-transparent
      ${sizeClasses[size]} ${colorClasses[color]} ${className}
    `} />
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string
  height?: string
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  }

  const style = {
    width: width,
    height: height
  }

  return (
    <div 
      className={`
        animate-pulse bg-gray-200 
        ${variantClasses[variant]} ${className}
      `}
      style={style}
    />
  )
}

interface PageLoadingProps {
  title?: string
  subtitle?: string
}

export function PageLoading({ title = 'Loading...', subtitle }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <LoadingSpinner size="lg" color="teal" className="mx-auto border-teal-300" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">{title}</h2>
        {subtitle && (
          <p className="text-teal-100">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 overflow-hidden">
      {/* Header skeleton */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
      </div>
      
      {/* Rows skeleton */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} className="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface CardSkeletonProps {
  className?: string
}

export function CardSkeleton({ className = '' }: CardSkeletonProps) {
  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton variant="circular" width="40px" height="40px" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

interface StatsSkeletonProps {
  count?: number
}

export function StatsSkeleton({ count = 4 }: StatsSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
          <div className="flex items-center">
            <Skeleton variant="circular" width="40px" height="40px" />
            <div className="ml-4 flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface ChartSkeletonProps {
  className?: string
  height?: string
}

export function ChartSkeleton({ className = '', height = '300px' }: ChartSkeletonProps) {
  return (
    <div className={`bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20 ${className}`}>
      <div className="mb-4">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-end justify-between space-x-2" style={{ height }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex-1 bg-gray-200 rounded-t animate-pulse" 
               style={{ height: `${Math.random() * 80 + 20}%` }} />
        ))}
      </div>
    </div>
  )
}

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className = '' }: FadeInProps) {
  return (
    <div 
      className={`animate-fadeIn ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

interface SlideInProps {
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  className?: string
}

export function SlideIn({ 
  children, 
  direction = 'up', 
  delay = 0, 
  className = '' 
}: SlideInProps) {
  const directionClasses = {
    left: 'animate-slideInLeft',
    right: 'animate-slideInRight', 
    up: 'animate-slideInUp',
    down: 'animate-slideInDown'
  }

  return (
    <div 
      className={`${directionClasses[direction]} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  color?: 'teal' | 'blue' | 'green' | 'yellow' | 'red'
  showLabel?: boolean
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className = '', 
  color = 'teal',
  showLabel = false 
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const colorClasses = {
    teal: 'bg-teal-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{value}</span>
          <span className="text-sm text-gray-500">{max}</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mx-auto mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      )}
      {action && action}
    </div>
  )
}