'use client'

import { useState, useRef } from 'react'
import { Upload, File, AlertCircle, Loader2 } from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  isUploading: boolean
  acceptedTypes?: string
}

export default function FileUpload({ onFileUpload, isUploading, acceptedTypes = '.xlsx,.xls,.csv' }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]

    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return false
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload an Excel (.xlsx, .xls) or CSV file')
      return false
    }

    setError(null)
    return true
  }

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center">
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
          )}
          
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isUploading ? 'Processing file...' : 'Drag & drop your Excel file here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or{' '}
              <button
                onClick={openFileDialog}
                disabled={isUploading}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-gray-400">
              Supports: Excel (.xlsx, .xls) and CSV files up to 10MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center p-4 bg-red-50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}