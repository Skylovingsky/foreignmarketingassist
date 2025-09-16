'use client';

import { useState } from 'react';
import FileDropzone from '@/components/import/FileDropzone';
import type { BatchUploadResult } from '@trade-assistant/dto';

export default function ImportPage() {
  const [uploadResult, setUploadResult] = useState<BatchUploadResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleUpload = (result: BatchUploadResult) => {
    setUploadResult(result);
    setShowResult(true);
  };

  const resetUpload = () => {
    setUploadResult(null);
    setShowResult(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">数据导入</h1>
        <p className="mt-2 text-gray-600">
          批量导入客户数据，支持 Excel 和 CSV 格式文件
        </p>
      </div>

      {!showResult ? (
        <>
          {/* 导入步骤说明 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card text-center">
              <div className="text-2xl mb-2">1️⃣</div>
              <div className="font-medium text-gray-900">准备数据</div>
              <div className="text-sm text-gray-600 mt-1">
                整理客户信息到 Excel 或 CSV 文件
              </div>
            </div>
            <div className="card text-center">
              <div className="text-2xl mb-2">2️⃣</div>
              <div className="font-medium text-gray-900">上传文件</div>
              <div className="text-sm text-gray-600 mt-1">
                拖拽或选择文件进行上传
              </div>
            </div>
            <div className="card text-center">
              <div className="text-2xl mb-2">3️⃣</div>
              <div className="font-medium text-gray-900">数据验证</div>
              <div className="text-sm text-gray-600 mt-1">
                系统自动验证并导入数据
              </div>
            </div>
          </div>

          {/* 文件上传区域 */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">上传客户数据文件</h2>
            <FileDropzone onUpload={handleUpload} />
          </div>

          {/* 数据字段说明 */}
          <div className="mt-8 card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">支持的数据字段</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">必填字段</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <strong>公司名称</strong> - 客户公司的完整名称</li>
                  <li>• <strong>联系人</strong> - 主要联系人姓名</li>
                  <li>• <strong>邮箱</strong> - 联系人的邮箱地址</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">可选字段</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <strong>电话</strong> - 联系电话号码</li>
                  <li>• <strong>网站</strong> - 公司官方网站</li>
                  <li>• <strong>国家</strong> - 公司所在国家</li>
                  <li>• <strong>行业</strong> - 公司所属行业</li>
                  <li>• <strong>员工数</strong> - 公司员工规模</li>
                  <li>• <strong>职位</strong> - 联系人职位</li>
                  <li>• <strong>部门</strong> - 联系人所在部门</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 上传结果展示 */
        <div className="space-y-6">
          {/* 结果概览 */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">导入结果</h2>
              <button
                onClick={resetUpload}
                className="btn-secondary"
              >
                重新导入
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{uploadResult?.total || 0}</div>
                <div className="text-sm text-gray-600">总记录数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{uploadResult?.success || 0}</div>
                <div className="text-sm text-gray-600">成功导入</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{uploadResult?.failed || 0}</div>
                <div className="text-sm text-gray-600">导入失败</div>
              </div>
            </div>

            {/* 成功率进度条 */}
            {uploadResult && uploadResult.total > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>导入成功率</span>
                  <span>{Math.round((uploadResult.success / uploadResult.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(uploadResult.success / uploadResult.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {uploadResult?.success && uploadResult.success > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-green-600 text-xl mr-2">✅</span>
                  <div>
                    <p className="text-green-800 font-medium">
                      成功导入 {uploadResult.success} 条客户记录
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      数据已保存到系统中，您可以在客户管理页面查看详情
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 错误详情 */}
          {uploadResult?.errors && uploadResult.errors.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                错误详情 ({uploadResult.errors.length} 个错误)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        行号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        字段
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        错误信息
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {uploadResult.errors.map((error, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {error.row}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {error.field}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600">
                          {error.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 后续操作 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">后续操作</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/"
                className="btn-primary text-center block"
              >
                查看客户列表
              </a>
              <a
                href="/agent"
                className="btn-secondary text-center block"
              >
                开始AI分析
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}