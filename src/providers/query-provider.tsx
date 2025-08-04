'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          refetchOnWindowFocus: false,
          retry: (failureCount, error: unknown) => {
            // Don't retry on authentication errors
            if ((error as { status?: number })?.status === 401) return false
            return failureCount < 3
          }
        },
        mutations: {
          retry: (failureCount, error: unknown) => {
            // Don't retry on client errors (4xx)
            const status = (error as { status?: number })?.status
            if (status && status >= 400 && status < 500) return false
            return failureCount < 2
          }
        }
      }
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}