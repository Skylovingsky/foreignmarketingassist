'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, Eye, EyeOff, ArrowRight } from 'lucide-react'

interface ValidationError {
  row: number
  field: string
  message: string
}

interface DataPreviewProps {
  data: any[]
  validation?: {
    valid: number
    invalid: number
    errors: ValidationError[]
  }
  onConfirmImport: () => void
}

export default function DataPreview({ data, validation, onConfirmImport }: DataPreviewProps) {
  const [showAll, setShowAll] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const displayedData = showAll ? data : data.slice(0, 50)
  const hasMore = data.length > 50

  const getRowValidation = (rowIndex: number) => {
    if (!validation?.errors) return null
    return validation.errors.filter(err => err.row === rowIndex)
  }

  const hasValidationErrors = validation && validation.invalid > 0

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
  }

  const selectAll = () => {
    if (selectedRows.size === displayedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(displayedData.map((_, index) => index)))
    }
  }

  if (!data || data.length === 0) {
    return null
  }

  const columns = Object.keys(data[0] || {})

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
          <p className="text-sm text-gray-600">
            {data.length} rows found • Showing {displayedData.length} rows
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
            >
              {showAll ? (
                <>
                  <EyeOff className="w-4 h-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Show all
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Validation Summary */}
      {validation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">Valid Rows</p>
              <p className="text-lg font-bold text-green-900">{validation.valid}</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-800">Invalid Rows</p>
              <p className="text-lg font-bold text-red-900">{validation.invalid}</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <Eye className="w-5 h-5 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-800">Total Rows</p>
              <p className="text-lg font-bold text-blue-900">{data.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === displayedData.length && displayedData.length > 0}
                  onChange={selectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedData.map((row, index) => {
              const errors = getRowValidation(index)
              const hasErrors = errors && errors.length > 0
              
              return (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 ${hasErrors ? 'bg-red-50' : ''} ${
                    selectedRows.has(index) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={() => toggleRowSelection(index)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {row[column]?.toString() || '-'}
                      </div>
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {hasErrors ? (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">
                          {errors.length} error{errors.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">Valid</span>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          {selectedRows.size > 0 && (
            <span>{selectedRows.size} rows selected</span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {hasValidationErrors && (
            <p className="text-sm text-red-600">
              ⚠️ Some rows have validation errors. They will be skipped during import.
            </p>
          )}
          
          <button
            onClick={onConfirmImport}
            disabled={validation?.valid === 0}
            className="btn-primary flex items-center"
          >
            Confirm & Import
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}