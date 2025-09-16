'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Users, BarChart3 } from 'lucide-react'
import FileUpload from '@/components/upload/FileUpload'
import DataPreview from '@/components/upload/DataPreview'
import Navigation from '@/components/layout/Navigation'
import { uploadFile, apiCall, API_CONFIG } from '@/lib/api-config'

interface UploadedFile {
  name: string
  size: number
  data: any[]
}

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const router = useRouter()

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    
    try {
      const result = await uploadFile(file)
      
      if (result.success) {
        setUploadedFile({
          name: file.name,
          size: file.size,
          data: result.data?.customers || []
        })
        setValidationResult({
          valid: result.data?.success || 0,
          invalid: result.data?.failed || 0,
          errors: result.data?.errors || []
        })
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('上传失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!uploadedFile) return
    
    try {
      // 由于文件上传已经将数据导入到后端，这里直接跳转到仪表板
      router.push('/dashboard')
    } catch (error) {
      console.error('Import error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Foreign Trade Agent Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your Excel file to start analyzing potential leads. Our AI will crawl company data and extract key insights for your sales outreach.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <Upload className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Upload Excel File</h2>
            </div>
            
            <FileUpload
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
              acceptedTypes=".xlsx,.xls,.csv"
            />
            
            {uploadedFile && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {uploadedFile.name} uploaded successfully
                    </p>
                    <p className="text-xs text-green-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.data.length} rows
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected File Format</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Company Name</p>
                  <p className="text-xs text-gray-500">Full legal name of the target company</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Country</p>
                  <p className="text-xs text-gray-500">Company location for targeted outreach</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Industry (Optional)</p>
                  <p className="text-xs text-gray-500">Business sector for better matching</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Website (Optional)</p>
                  <p className="text-xs text-gray-500">Starting point for data crawling</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        {uploadedFile && (
          <div className="mt-8">
            <DataPreview 
              data={uploadedFile.data}
              validation={validationResult}
              onConfirmImport={handleConfirmImport}
            />
          </div>
        )}
      </div>
    </div>
  )
}