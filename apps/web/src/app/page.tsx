'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  country?: string;
  industry?: string;
  employeeCount?: number;
  position?: string;
  department?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalCustomers: number;
    filteredCustomers: number;
  };
}

interface AIAnalysisResult {
  companyId: string;
  companyName: string;
  website: string;
  dimensions: {
    marketPotential: { score: number; description: string; };
    businessMatching: { score: number; description: string; };
    contactability: { score: number; description: string; };
    competitiveAdvantage: { score: number; description: string; };
    urgencyLevel: { score: number; description: string; };
  };
  overallScore: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  outreachMessages: {
    email: { subject: string; content: string; };
    linkedin: { subject: string; content: string; };
  };
}

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [aiAnalysisLoading, setAIAnalysisLoading] = useState<string | null>(null);
  const [aiAnalysisResults, setAIAnalysisResults] = useState<Record<string, AIAnalysisResult>>({});
  const [showAnalysis, setShowAnalysis] = useState<string | null>(null);

  // 获取客户列表
  const fetchCustomers = async (page = 1, search = '', industry = '', country = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(industry && { industry }),
        ...(country && { country }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev'}/api/customers?${params}`
      );

      if (!response.ok) {
        throw new Error('获取客户数据失败');
      }

      const data: CustomersResponse = await response.json();
      
      if (data.success) {
        setCustomers(data.data);
        setCurrentPage(data.pagination.current);
        setTotalPages(data.pagination.totalPages);
        setTotalCustomers(data.summary.totalCustomers);
      } else {
        throw new Error('获取客户数据失败');
      }
    } catch (err) {
      console.error('获取客户列表错误:', err);
      setError(err instanceof Error ? err.message : '获取客户数据时出现未知错误');
    } finally {
      setLoading(false);
    }
  };

  // AI分析函数
  const analyzeCustomer = async (customer: Customer) => {
    if (!customer.website) {
      alert('该客户没有网站信息，无法进行AI分析');
      return;
    }

    try {
      setAIAnalysisLoading(customer.id);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev'}/api/ai-analysis/analyze-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: customer.website,
            businessContext: {
              companyName: 'Global Trade Solutions',
              industry: 'International Trade Services',
              services: ['Export Services', 'Supply Chain Management', 'Trade Finance'],
              targetMarkets: ['Europe', 'Asia', 'North America'],
              uniqueValueProposition: 'End-to-end international trade solutions with 20+ years expertise',
            },
            analysisDepth: 'detailed',
            language: 'zh',
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.data.analysis) {
        setAIAnalysisResults(prev => ({
          ...prev,
          [customer.id]: data.data.analysis,
        }));
        setShowAnalysis(customer.id);
      } else {
        throw new Error(data.message || 'AI分析失败');
      }
    } catch (err) {
      console.error('AI分析错误:', err);
      setError(err instanceof Error ? err.message : 'AI分析时出现未知错误');
    } finally {
      setAIAnalysisLoading(null);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchCustomers();
  }, []);

  // 搜索和过滤
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCustomers(1, searchTerm, selectedIndustry, selectedCountry);
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    fetchCustomers(page, searchTerm, selectedIndustry, selectedCountry);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchTerm('');
    setSelectedIndustry('');
    setSelectedCountry('');
    setCurrentPage(1);
    fetchCustomers(1);
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 获取优先级文本
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高优先级';
      case 'medium': return '中等优先级';
      case 'low': return '低优先级';
      default: return '未分析';
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">正在加载客户数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题和统计 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👥 客户管理</h1>
            <p className="mt-2 text-gray-600">
              管理您的客户信息，进行AI智能分析，生成个性化外联策略
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/import" className="btn-secondary">
              📤 导入数据
            </Link>
            <button
              onClick={() => fetchCustomers(currentPage, searchTerm, selectedIndustry, selectedCountry)}
              className="btn-primary"
            >
              🔄 刷新数据
            </button>
          </div>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{totalCustomers}</div>
            <div className="text-sm text-blue-700">总客户数</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{customers.length}</div>
            <div className="text-sm text-green-700">当前页显示</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{Object.keys(aiAnalysisResults).length}</div>
            <div className="text-sm text-purple-700">已分析客户</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{totalPages}</div>
            <div className="text-sm text-orange-700">总页数</div>
          </div>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="公司名称、联系人、邮箱..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">行业</label>
            <input
              type="text"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              placeholder="制造业、科技..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">国家</label>
            <input
              type="text"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              placeholder="德国、美国、中国..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button onClick={handleSearch} className="btn-primary">
              🔍 搜索
            </button>
            <button onClick={handleReset} className="btn-secondary">
              🔄 重置
            </button>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-400 text-xl mr-2">⚠️</span>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* 客户列表 */}
      {customers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无客户数据</h3>
          <p className="text-gray-600 mb-4">
            开始导入您的客户数据文件，或手动添加客户信息
          </p>
          <Link href="/import" className="btn-primary">
            📤 导入客户数据
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {customers.map((customer) => (
              <div key={customer.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 基本信息 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{customer.companyName}</h3>
                      <p className="text-sm text-gray-600">👤 {customer.contactName}</p>
                      <p className="text-sm text-gray-600">📧 {customer.email}</p>
                      {customer.phone && (
                        <p className="text-sm text-gray-600">📞 {customer.phone}</p>
                      )}
                    </div>
                    
                    {/* 公司信息 */}
                    <div>
                      {customer.website && (
                        <p className="text-sm text-gray-600">🌐 <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{customer.website}</a></p>
                      )}
                      {customer.country && (
                        <p className="text-sm text-gray-600">🌍 {customer.country}</p>
                      )}
                      {customer.industry && (
                        <p className="text-sm text-gray-600">🏭 {customer.industry}</p>
                      )}
                      {customer.employeeCount && (
                        <p className="text-sm text-gray-600">👥 {customer.employeeCount} 人</p>
                      )}
                    </div>
                    
                    {/* 职位信息 */}
                    <div>
                      {customer.position && (
                        <p className="text-sm text-gray-600">💼 {customer.position}</p>
                      )}
                      {customer.department && (
                        <p className="text-sm text-gray-600">🏢 {customer.department}</p>
                      )}
                      {customer.notes && (
                        <p className="text-sm text-gray-600">📝 {customer.notes}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        创建时间: {new Date(customer.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* AI分析按钮和结果 */}
                  <div className="ml-6 flex flex-col items-end space-y-3">
                    {aiAnalysisResults[customer.id] && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(aiAnalysisResults[customer.id].priority)}`}>
                        {getPriorityText(aiAnalysisResults[customer.id].priority)}
                      </div>
                    )}
                    
                    <button
                      onClick={() => analyzeCustomer(customer)}
                      disabled={aiAnalysisLoading === customer.id || !customer.website}
                      className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiAnalysisLoading === customer.id ? (
                        <>
                          <span className="animate-spin mr-1">⏳</span>
                          分析中...
                        </>
                      ) : (
                        <>
                          🤖 AI分析
                        </>
                      )}
                    </button>
                    
                    {aiAnalysisResults[customer.id] && (
                      <button
                        onClick={() => setShowAnalysis(showAnalysis === customer.id ? null : customer.id)}
                        className="btn-secondary text-sm"
                      >
                        {showAnalysis === customer.id ? '🔽 隐藏结果' : '🔼 查看分析'}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* AI分析详细结果 */}
                {showAnalysis === customer.id && aiAnalysisResults[customer.id] && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-4">🤖 AI智能分析结果</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 5维评分 */}
                        <div>
                          <h5 className="font-medium text-gray-800 mb-3">📊 五维评分分析</h5>
                          <div className="space-y-3">
                            {Object.entries(aiAnalysisResults[customer.id].dimensions).map(([key, dimension]) => (
                              <div key={key}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-600">
                                    {key === 'marketPotential' && '🎯 市场潜力'}
                                    {key === 'businessMatching' && '🤝 业务匹配'}
                                    {key === 'contactability' && '📞 可联系性'}
                                    {key === 'competitiveAdvantage' && '⚡ 竞争优势'}
                                    {key === 'urgencyLevel' && '⏰ 紧急程度'}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-800">{dimension.score}/100</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                    style={{ width: `${dimension.score}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-600">{dimension.description}</p>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{aiAnalysisResults[customer.id].overallScore}</div>
                              <div className="text-sm text-blue-700">综合评分</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 建议和外联 */}
                        <div>
                          <h5 className="font-medium text-gray-800 mb-3">💡 AI建议</h5>
                          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                            {aiAnalysisResults[customer.id].recommendation}
                          </p>
                          
                          <h5 className="font-medium text-gray-800 mb-3">📧 外联消息模板</h5>
                          <div className="space-y-3">
                            <div className="p-3 bg-white rounded border">
                              <div className="font-medium text-sm text-gray-700 mb-1">邮件主题:</div>
                              <div className="text-sm text-gray-600 mb-2">{aiAnalysisResults[customer.id].outreachMessages.email.subject}</div>
                              <div className="font-medium text-sm text-gray-700 mb-1">邮件内容:</div>
                              <div className="text-xs text-gray-600 max-h-20 overflow-y-auto whitespace-pre-wrap">
                                {aiAnalysisResults[customer.id].outreachMessages.email.content}
                              </div>
                            </div>
                            
                            <div className="p-3 bg-white rounded border">
                              <div className="font-medium text-sm text-gray-700 mb-1">LinkedIn消息:</div>
                              <div className="text-sm text-gray-600 mb-2">{aiAnalysisResults[customer.id].outreachMessages.linkedin.subject}</div>
                              <div className="text-xs text-gray-600 max-h-20 overflow-y-auto whitespace-pre-wrap">
                                {aiAnalysisResults[customer.id].outreachMessages.linkedin.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="btn-secondary disabled:opacity-50"
              >
                ← 上一页
              </button>
              
              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                下一页 →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}