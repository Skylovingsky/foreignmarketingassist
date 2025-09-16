'use client';

import { useState } from 'react';

interface SearchForm {
  keywords: string[];
  industry: string;
  location: string;
  size: string;
  maxResults: number;
  businessContext: {
    companyName: string;
    industry: string;
    services: string[];
    targetMarkets: string[];
    uniqueValueProposition: string;
  };
}

interface CompanyAnalysis {
  companyName: string;
  website: string;
  description: string;
  overallScore: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  dimensions: {
    marketPotential: { score: number; description: string; };
    businessMatching: { score: number; description: string; };
    contactability: { score: number; description: string; };
    competitiveAdvantage: { score: number; description: string; };
    urgencyLevel: { score: number; description: string; };
  };
  outreachMessages: {
    email: { subject: string; content: string; };
    linkedin: { subject: string; content: string; };
  };
}

interface SearchResults {
  success: boolean;
  report: {
    searchResults: {
      totalFound: number;
      highQuality: number;
      analyzed: number;
    };
    averageScore: number;
    topOpportunities: CompanyAnalysis[];
  };
  data: {
    analyses: CompanyAnalysis[];
  };
  actionPlan: {
    highPriority: { companies: CompanyAnalysis[]; action: string; timeline: string; };
    mediumPriority: { companies: CompanyAnalysis[]; action: string; timeline: string; };
    lowPriority: { companies: CompanyAnalysis[]; action: string; timeline: string; };
  };
}

export default function Home() {
  const [searchForm, setSearchForm] = useState<SearchForm>({
    keywords: [],
    industry: '',
    location: '',
    size: '',
    maxResults: 5,
    businessContext: {
      companyName: 'Global Trade Solutions',
      industry: 'International Trade Services',
      services: ['Export Services', 'Supply Chain Management', 'Trade Finance'],
      targetMarkets: ['Europe', 'Asia', 'North America'],
      uniqueValueProposition: 'End-to-end international trade solutions with 20+ years expertise',
    },
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  const [marketInput, setMarketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addKeyword = () => {
    if (keywordInput.trim() && !searchForm.keywords.includes(keywordInput.trim())) {
      setSearchForm(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSearchForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addService = () => {
    if (serviceInput.trim() && !searchForm.businessContext.services.includes(serviceInput.trim())) {
      setSearchForm(prev => ({
        ...prev,
        businessContext: {
          ...prev.businessContext,
          services: [...prev.businessContext.services, serviceInput.trim()]
        }
      }));
      setServiceInput('');
    }
  };

  const removeService = (service: string) => {
    setSearchForm(prev => ({
      ...prev,
      businessContext: {
        ...prev.businessContext,
        services: prev.businessContext.services.filter(s => s !== service)
      }
    }));
  };

  const addMarket = () => {
    if (marketInput.trim() && !searchForm.businessContext.targetMarkets.includes(marketInput.trim())) {
      setSearchForm(prev => ({
        ...prev,
        businessContext: {
          ...prev.businessContext,
          targetMarkets: [...prev.businessContext.targetMarkets, marketInput.trim()]
        }
      }));
      setMarketInput('');
    }
  };

  const removeMarket = (market: string) => {
    setSearchForm(prev => ({
      ...prev,
      businessContext: {
        ...prev.businessContext,
        targetMarkets: prev.businessContext.targetMarkets.filter(m => m !== market)
      }
    }));
  };

  const handleSearch = async () => {
    if (searchForm.keywords.length === 0) {
      setError('请至少添加一个搜索关键词');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev'}/api/ai-analysis/search-and-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...searchForm,
          analysisDepth: 'comprehensive',
          language: 'zh',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
      } else {
        setError(data.message || '搜索失败，请稍后重试');
      }
    } catch (err) {
      console.error('搜索错误:', err);
      setError('网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高优先级';
      case 'medium': return '中等优先级'; 
      case 'low': return '低优先级';
      default: return '未知';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🌍 智能客户开发平台</h1>
        <p className="mt-2 text-gray-600">
          AI驱动的全球贸易伙伴搜索与智能分析系统
        </p>
      </div>

      {/* 搜索表单 */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">🔍 智能搜索配置</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左侧：搜索参数 */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                搜索关键词 *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="例如: manufacturing, technology, services"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="btn-secondary"
                >
                  添加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchForm.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-100 text-brand-700"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 text-brand-500 hover:text-brand-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目标行业
                </label>
                <input
                  type="text"
                  value={searchForm.industry}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="例如: manufacturing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  地理位置
                </label>
                <input
                  type="text"
                  value={searchForm.location}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="例如: Germany, China, Peru"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  公司规模
                </label>
                <select
                  value={searchForm.size}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="">不限</option>
                  <option value="small">小型企业 (1-50人)</option>
                  <option value="medium">中型企业 (51-250人)</option>
                  <option value="large">大型企业 (250+人)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  搜索结果数量
                </label>
                <select
                  value={searchForm.maxResults}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, maxResults: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value={3}>3个结果</option>
                  <option value={5}>5个结果</option>
                  <option value={10}>10个结果</option>
                </select>
              </div>
            </div>
          </div>

          {/* 右侧：业务信息 */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                您的公司名称 *
              </label>
              <input
                type="text"
                value={searchForm.businessContext.companyName}
                onChange={(e) => setSearchForm(prev => ({
                  ...prev,
                  businessContext: { ...prev.businessContext, companyName: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="例如: Global Trade Solutions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                您的行业 *
              </label>
              <input
                type="text"
                value={searchForm.businessContext.industry}
                onChange={(e) => setSearchForm(prev => ({
                  ...prev,
                  businessContext: { ...prev.businessContext, industry: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="例如: International Trade Services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                服务项目 *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addService()}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="例如: Export Services, Supply Chain"
                />
                <button
                  type="button"
                  onClick={addService}
                  className="btn-secondary"
                >
                  添加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchForm.businessContext.services.map((service) => (
                  <span
                    key={service}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => removeService(service)}
                      className="ml-1 text-green-500 hover:text-green-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标市场 *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={marketInput}
                  onChange={(e) => setMarketInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMarket()}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="例如: Europe, Asia, North America"
                />
                <button
                  type="button"
                  onClick={addMarket}
                  className="btn-secondary"
                >
                  添加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchForm.businessContext.targetMarkets.map((market) => (
                  <span
                    key={market}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                  >
                    {market}
                    <button
                      type="button"
                      onClick={() => removeMarket(market)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                独特价值主张 *
              </label>
              <textarea
                value={searchForm.businessContext.uniqueValueProposition}
                onChange={(e) => setSearchForm(prev => ({
                  ...prev,
                  businessContext: { ...prev.businessContext, uniqueValueProposition: e.target.value }
                }))}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="例如: End-to-end international trade solutions with 20+ years expertise"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSearch}
            disabled={loading || searchForm.keywords.length === 0}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                AI智能搜索分析中...
              </>
            ) : (
              <>
                🔍 开始智能搜索分析
              </>
            )}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      {results && (
        <div className="space-y-8">
          {/* 搜索汇总 */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">📊 搜索结果汇总</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600">{results.report.searchResults.totalFound}</div>
                <div className="text-sm text-gray-600">找到公司</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{results.report.searchResults.highQuality}</div>
                <div className="text-sm text-gray-600">高质量目标</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{results.report.searchResults.analyzed}</div>
                <div className="text-sm text-gray-600">AI分析完成</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{results.report.averageScore}</div>
                <div className="text-sm text-gray-600">平均评分</div>
              </div>
            </div>
          </div>

          {/* 行动计划 */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 智能行动计划</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="font-semibold text-red-700 mb-2">
                  🔥 高优先级 ({results.actionPlan.highPriority.companies.length})
                </h3>
                <p className="text-sm text-red-600 mb-3">{results.actionPlan.highPriority.action}</p>
                <p className="text-xs text-red-500">时间线: {results.actionPlan.highPriority.timeline}</p>
              </div>
              <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <h3 className="font-semibold text-yellow-700 mb-2">
                  📅 中等优先级 ({results.actionPlan.mediumPriority.companies.length})
                </h3>
                <p className="text-sm text-yellow-600 mb-3">{results.actionPlan.mediumPriority.action}</p>
                <p className="text-xs text-yellow-500">时间线: {results.actionPlan.mediumPriority.timeline}</p>
              </div>
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold text-green-700 mb-2">
                  📚 低优先级 ({results.actionPlan.lowPriority.companies.length})
                </h3>
                <p className="text-sm text-green-600 mb-3">{results.actionPlan.lowPriority.action}</p>
                <p className="text-xs text-green-500">时间线: {results.actionPlan.lowPriority.timeline}</p>
              </div>
            </div>
          </div>

          {/* 详细分析结果 */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">🎯 AI详细分析结果</h2>
            <div className="space-y-8">
              {results.data.analyses.map((analysis, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{analysis.companyName}</h3>
                      <p className="text-sm text-gray-500">{analysis.website}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-brand-600">{analysis.overallScore}</div>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(analysis.priority)}`}>
                        {getPriorityText(analysis.priority)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700">{analysis.description}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">📊 5维度评分分析</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {Object.entries(analysis.dimensions).map(([key, dimension]) => (
                        <div key={key} className="text-center">
                          <div className="text-lg font-bold text-brand-600">{dimension.score}</div>
                          <div className="text-xs text-gray-600 mb-1">
                            {key === 'marketPotential' && '市场潜力'}
                            {key === 'businessMatching' && '业务匹配'}
                            {key === 'contactability' && '可联系性'}
                            {key === 'competitiveAdvantage' && '竞争优势'}
                            {key === 'urgencyLevel' && '紧急程度'}
                          </div>
                          <div className="text-xs text-gray-500">{dimension.description.substring(0, 50)}...</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">💡 AI建议</h4>
                    <p className="text-sm text-gray-700">{analysis.recommendation}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📧 邮件开发信</h4>
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">主题: {analysis.outreachMessages.email.subject}</div>
                        <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">{analysis.outreachMessages.email.content}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">💼 LinkedIn消息</h4>
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">主题: {analysis.outreachMessages.linkedin.subject}</div>
                        <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">{analysis.outreachMessages.linkedin.content}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}