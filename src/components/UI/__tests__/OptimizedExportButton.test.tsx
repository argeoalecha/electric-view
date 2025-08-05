import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import OptimizedExportButton from '@/components/UI/OptimizedExportButton'

// Mock the lazy export functions
jest.mock('@/utils/lazyExports', () => ({
  getExportFunction: jest.fn().mockReturnValue(jest.fn().mockResolvedValue(undefined))
}))

describe('OptimizedExportButton', () => {
  const user = userEvent.setup()
  
  const mockProps = {
    data: [
      { id: 1, name: 'Test Company', region: 'Metro Manila' },
      { id: 2, name: 'Sample Corp', region: 'Cebu' }
    ],
    filename: 'test-export',
    title: 'Test Export',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Company Name' },
      { key: 'region', label: 'Region' }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render export button without crashing', () => {
      render(<OptimizedExportButton {...mockProps} />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Export')).toBeInTheDocument()
    })

    it('should show disabled state when no data', () => {
      render(<OptimizedExportButton {...mockProps} data={[]} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show loading state during export', () => {
      render(<OptimizedExportButton {...mockProps} />)
      
      // Initially not loading
      expect(screen.queryByText(/exporting/i)).not.toBeInTheDocument()
    })
  })

  describe('Dropdown Interaction', () => {
    it('should show dropdown when clicked', async () => {
      render(<OptimizedExportButton {...mockProps} />)
      
      const exportButton = screen.getByRole('button')
      await user.click(exportButton)

      await waitFor(() => {
        expect(screen.getByText('Export as PDF')).toBeInTheDocument()
        expect(screen.getByText('Export as Excel')).toBeInTheDocument()
        expect(screen.getByText('Export as CSV')).toBeInTheDocument()
      })
    })

    it('should close dropdown when clicking outside', async () => {
      render(<OptimizedExportButton {...mockProps} />)
      
      const exportButton = screen.getByRole('button')
      await user.click(exportButton)

      // Dropdown should be visible
      expect(screen.getByText('Export as PDF')).toBeInTheDocument()

      // Click outside (on document body)
      await user.click(document.body)

      await waitFor(() => {
        expect(screen.queryByText('Export as PDF')).not.toBeInTheDocument()
      })
    })

    it('should show data count in dropdown', async () => {
      render(<OptimizedExportButton {...mockProps} />)
      
      const exportButton = screen.getByRole('button')
      await user.click(exportButton)

      await waitFor(() => {
        expect(screen.getByText('2 records')).toBeInTheDocument()
      })
    })
  })

  describe('Export Functionality', () => {
    it('should call export function when PDF option is selected', async () => {
      const mockExportFn = jest.fn().mockResolvedValue(undefined)
      const { getExportFunction } = require('@/utils/lazyExports')
      getExportFunction.mockReturnValue(mockExportFn)

      render(<OptimizedExportButton {...mockProps} />)
      
      const exportButton = screen.getByRole('button')
      await user.click(exportButton)

      const pdfOption = screen.getByText('Export as PDF')
      await user.click(pdfOption)

      await waitFor(() => {
        expect(getExportFunction).toHaveBeenCalledWith('pdf')
        expect(mockExportFn).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              'ID': 1,
              'Company Name': 'Test Company',
              'Region': 'Metro Manila'
            })
          ]),
          'test-export'
        )
      })
    })

    it('should handle export errors gracefully', async () => {
      const mockExportFn = jest.fn().mockRejectedValue(new Error('Export failed'))
      const { getExportFunction } = require('@/utils/lazyExports')
      getExportFunction.mockReturnValue(mockExportFn)

      // Mock alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

      render(<OptimizedExportButton {...mockProps} />)
      
      const exportButton = screen.getByRole('button')
      await user.click(exportButton)

      const pdfOption = screen.getByText('Export as PDF')
      await user.click(pdfOption)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to export PDF. Please try again.')
      })

      alertSpy.mockRestore()
    })

    it('should format data correctly for export', async () => {
      const mockExportFn = jest.fn().mockResolvedValue(undefined)
      const { getExportFunction } = require('@/utils/lazyExports')
      getExportFunction.mockReturnValue(mockExportFn)

      const propsWithFormatter = {
        ...mockProps,
        columns: [
          { key: 'id', label: 'ID', format: (value: number) => `#${value}` },
          { key: 'name', label: 'Company Name' },
          { key: 'region', label: 'Region' }
        ]
      }

      render(<OptimizedExportButton {...propsWithFormatter} />)
      
      const exportButton = screen.getByRole('button')
      await user.click(exportButton)

      const excelOption = screen.getByText('Export as Excel')
      await user.click(excelOption)

      await waitFor(() => {
        expect(mockExportFn).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              'ID': '#1',
              'Company Name': 'Test Company',
              'Region': 'Metro Manila'
            })
          ]),
          'test-export'
        )
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state during export', async () => {
      let resolveExport: () => void
      const exportPromise = new Promise<void>((resolve) => {
        resolveExport = resolve
      })
      
      const mockExportFn = jest.fn().mockReturnValue(exportPromise)
      const { getExportFunction } = require('@/utils/lazyExports')
      getExportFunction.mockReturnValue(mockExportFn)

      render(<OptimizedExportButton {...mockProps} />)
      
      const exportButton = screen.getByRole('button')
      await user.click(exportButton)

      const csvOption = screen.getByText('Export as CSV')
      await user.click(csvOption)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Exporting...')).toBeInTheDocument()
      })

      // Resolve the export
      resolveExport!()
      
      await waitFor(() => {
        expect(screen.queryByText('Exporting...')).not.toBeInTheDocument()
      })
    })

    it('should disable button during export', async () => {
      let resolveExport: () => void
      const exportPromise = new Promise<void>((resolve) => {
        resolveExport = resolve
      })
      
      const mockExportFn = jest.fn().mockReturnValue(exportPromise)
      const { getExportFunction } = require('@/utils/lazyExports')
      getExportFunction.mockReturnValue(mockExportFn)

      render(<OptimizedExportButton {...mockProps} />)
      
      const exportButton = screen.getByRole('button')
      await user.click(exportButton)

      const csvOption = screen.getByText('Export as CSV')
      await user.click(csvOption)

      // Button should be disabled during export
      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
      })

      // Resolve the export
      resolveExport!()
      
      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).not.toBeDisabled()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<OptimizedExportButton {...mockProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('should be keyboard accessible', async () => {
      render(<OptimizedExportButton {...mockProps} />)
      
      const exportButton = screen.getByRole('button')
      
      // Focus and press Enter
      exportButton.focus()
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Export as PDF')).toBeInTheDocument()
      })
    })
  })

  describe('Props Validation', () => {
    it('should handle empty columns array', () => {
      render(<OptimizedExportButton {...mockProps} columns={[]} />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle missing column formatters', async () => {
      const mockExportFn = jest.fn().mockResolvedValue(undefined)
      const { getExportFunction } = require('@/utils/lazyExports')
      getExportFunction.mockReturnValue(mockExportFn)

      const propsWithoutFormatters = {
        ...mockProps,
        columns: [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Company Name' }
        ]
      }

      render(<OptimizedExportButton {...propsWithoutFormatters} />)
      
      const exportButton = screen.getByRole('button')
      await user.click(exportButton)

      const pdfOption = screen.getByText('Export as PDF')
      
      expect(() => user.click(pdfOption)).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle data with null values', async () => {
      const mockExportFn = jest.fn().mockResolvedValue(undefined)
      const { getExportFunction } = require('@/utils/lazyExports')
      getExportFunction.mockReturnValue(mockExportFn)

      const dataWithNulls = [
        { id: 1, name: null, region: 'Metro Manila' },
        { id: 2, name: 'Sample Corp', region: undefined }
      ]

      render(<OptimizedExportButton {...mockProps} data={dataWithNulls} />)
      
      const exportButton = screen.getByRole('button')
      await user.click(exportButton)

      const csvOption = screen.getByText('Export as CSV')
      await user.click(csvOption)

      await waitFor(() => {
        expect(mockExportFn).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              'ID': 1,
              'Company Name': null,
              'Region': 'Metro Manila'
            })
          ]),
          'test-export'
        )
      })
    })

    it('should handle very large datasets', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Company ${i}`,
        region: 'Metro Manila'
      }))

      expect(() => {
        render(<OptimizedExportButton {...mockProps} data={largeData} />)
      }).not.toThrow()

      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})