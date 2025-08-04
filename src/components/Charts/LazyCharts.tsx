'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load chart components with loading fallbacks
export const LazyBarChart = dynamic(
  () => import('./BarChart').then(mod => ({ default: mod.BarChart })),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    ),
    ssr: false
  }
)

export const LazyPieChart = dynamic(
  () => import('./PieChart').then(mod => ({ default: mod.PieChart })),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    ),
    ssr: false
  }
)

export const LazyAreaChart = dynamic(
  () => import('./AreaChart').then(mod => ({ default: mod.AreaChart })),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    ),
    ssr: false
  }
)

export const LazyLineChart = dynamic(
  () => import('./LineChart').then(mod => ({ default: mod.LineChart })),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    ),
    ssr: false
  }
)

// Wrapper component with Suspense
export function ChartContainer({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    }>
      {children}
    </Suspense>
  )
}