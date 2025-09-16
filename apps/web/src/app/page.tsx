'use client';

import { useState, useEffect } from 'react';
import type { Company } from '@trade-assistant/dto';

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 集成真实的API调用获取客户数据
    const loadCompanies = async () => {
      try {
        // 这里将连接到真实的API
        // const response = await fetch('/api/companies');
        // const data = await response.json();
        // setCompanies(data);
        
        // 暂时设置空数组，等待真实数据
        setCompanies([]);
      } catch (error) {
        console.error('加载客户数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🌍</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        还没有客户数据
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        使用数据导入功能上传客户信息，或者使用AI助手开始客户开发
      </p>
      <div className="flex justify-center space-x-4">
        <a href="/import" className="btn-primary">
          📊 导入数据
        </a>
        <a href="/agent" className="btn-secondary">
          🤖 AI助手
        </a>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">外贸客户管理系统</h1>
        <p className="mt-2 text-gray-600">
          AI驱动的智能客户开发与管理平台
        </p>
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-brand-600">{companies.length}</div>
          <div className="text-sm text-gray-600 mt-1">总客户数</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-600 mt-1">本月新增</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">0</div>
          <div className="text-sm text-gray-600 mt-1">AI分析完成</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600">0</div>
          <div className="text-sm text-gray-600 mt-1">高质量客户</div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">客户数据</h2>
          <div className="flex space-x-3">
            <a href="/import" className="btn-secondary">
              📊 导入数据
            </a>
            <a href="/agent" className="btn-primary">
              🤖 AI助手
            </a>
          </div>
        </div>

        {companies.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    公司名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    国家/地区
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    行业
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {company.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {company.website}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{company.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{company.industry}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        已录入
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a 
                        href={`/companies/${company.id}`}
                        className="text-brand-600 hover:text-brand-900"
                      >
                        查看详情
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 功能区域 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/agent" className="card hover:shadow-lg transition-all cursor-pointer group">
          <div className="text-center p-2">
            <div className="text-4xl mb-3">🤖</div>
            <div className="font-semibold text-gray-900 mb-2 group-hover:text-brand-600">AI智能助手</div>
            <div className="text-sm text-gray-600">
              获取专业的外贸咨询和客户分析建议
            </div>
          </div>
        </a>
        
        <a href="/import" className="card hover:shadow-lg transition-all cursor-pointer group">
          <div className="text-center p-2">
            <div className="text-4xl mb-3">📊</div>
            <div className="font-semibold text-gray-900 mb-2 group-hover:text-brand-600">数据导入</div>
            <div className="text-sm text-gray-600">
              批量导入客户数据，支持Excel和CSV格式
            </div>
          </div>
        </a>
        
        <a href="/reports" className="card hover:shadow-lg transition-all cursor-pointer group">
          <div className="text-center p-2">
            <div className="text-4xl mb-3">📈</div>
            <div className="font-semibold text-gray-900 mb-2 group-hover:text-brand-600">数据分析</div>
            <div className="text-sm text-gray-600">
              查看客户统计和业务分析报表
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}