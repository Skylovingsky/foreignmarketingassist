'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { BatchUploadResult } from '@trade-assistant/dto';

interface FileDropzoneProps {
  onUpload: (result: BatchUploadResult) => void;
}

export default function FileDropzone({ onUpload }: FileDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processFile = async (file: File): Promise<BatchUploadResult> => {
    // 模拟文件处理过程
    setUploadProgress(0);
    
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            
            // 模拟处理结果
            const result: BatchUploadResult = {
              total: 150,
              success: 142,
              failed: 8,
              errors: [
                { row: 23, field: 'email', message: '邮箱格式不正确' },
                { row: 45, field: 'phone', message: '电话号码格式不正确' },
                { row: 67, field: 'company', message: '公司名称不能为空' },
                { row: 89, field: 'country', message: '国家代码无效' },
                { row: 101, field: 'email', message: '邮箱重复' },
                { row: 123, field: 'industry', message: '行业分类不存在' },
                { row: 134, field: 'website', message: '网站URL格式不正确' },
                { row: 148, field: 'employeeCount', message: '员工数必须是正整数' },
              ],
            };
            
            resolve(result);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await processFile(file);
      onUpload(result);
    } catch (error) {
      console.error('文件处理失败:', error);
      // 处理错误情况
      const errorResult: BatchUploadResult = {
        total: 0,
        success: 0,
        failed: 1,
        errors: [{ row: 0, field: 'file', message: '文件处理失败，请检查文件格式' }],
      };
      onUpload(errorResult);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {!isUploading ? (
            <>
              <div className="text-4xl">📊</div>
              
              {isDragActive ? (
                <p className="text-lg font-medium text-brand-600">
                  放开文件开始上传...
                </p>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    拖拽文件到这里，或点击选择文件
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式
                  </p>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={isUploading}
                >
                  选择文件
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-4xl">⏳</div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  正在处理文件...
                </p>
                <p className="text-sm text-gray-500">
                  {acceptedFiles[0]?.name}
                </p>
              </div>
              
              {/* 进度条 */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-brand-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {Math.round(uploadProgress)}% 完成
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 文件要求说明 */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">文件要求</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 文件格式: Excel (.xlsx, .xls) 或 CSV (.csv)</li>
          <li>• 文件大小: 不超过 10MB</li>
          <li>• 必需字段: 公司名称, 联系人, 邮箱</li>
          <li>• 可选字段: 电话, 网站, 国家, 行业, 员工数等</li>
        </ul>
      </div>

      {/* 示例模板下载 */}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="text-brand-600 hover:text-brand-700 text-sm font-medium"
          onClick={() => {
            // 创建示例CSV数据
            const csvContent = [
              '公司名称,联系人,邮箱,电话,网站,国家,行业,员工数',
              'Global Tech Solutions,John Smith,john@globaltech.com,+1-555-0123,https://globaltech.com,美国,科技,250',
              'European Manufacturing Ltd,Sarah Wilson,sarah@euroman.co.uk,+44-20-1234-5678,https://euroman.co.uk,英国,制造业,500',
            ].join('\n');
            
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = '客户数据导入模板.csv';
            link.click();
          }}
        >
          📥 下载导入模板
        </button>
      </div>
    </div>
  );
}