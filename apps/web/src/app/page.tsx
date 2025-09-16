'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Upload, Bot, Eye, ChevronDown, ChevronUp, ExternalLink, Phone, Mail, MapPin, Building, Search, Globe, Target, Clock, Zap } from 'lucide-react';

// 数据类型定义
interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  industry: string;
  position: string;
  department: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// 爬虫搜索结果
interface CrawlResult {
  companyName: string;
  website: string;
  description: string;
  contactEmails: string[];
  phones: string[];
  addresses: string[];
  socialMedia: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  businessInfo: {
    industry?: string;
    foundedYear?: string;
    employees?: string;
    revenue?: string;
  };
  score: {
    overall: number;
    relevance: number;
    credibility: number;
    contact: number;
    content: number;
    technical: number;
  };
  crawledAt: string;
  searchRank?: number;
  error?: string;
}

// AI分析维度
interface DimensionAnalysis {
  score: number;
  reasons: string[];
  description: string;
}

// AI分析结果
interface AIAnalysis {
  companyId: string;
  companyName: string;
  website: string;
  dimensions: {
    marketPotential: DimensionAnalysis;
    businessMatching: DimensionAnalysis;
    contactability: DimensionAnalysis;
    competitiveAdvantage: DimensionAnalysis;
    urgencyLevel: DimensionAnalysis;
  };
  overallScore: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  outreachStrategy: {
    primaryApproach: string;
    keySellingPoints: string[];
    painPointsToAddress: string[];
    suggestedTiming: string;
  };
  outreachMessages: {
    email: { subject: string; content: string; };
    linkedin: { subject: string; content: string; };
  };
  analyzedAt: string;
}

// 完整分析结果
interface CompanyAnalysisResult {
  crawlData: CrawlResult[];     // 爬虫搜索的多个网页数据
  aiAnalysis?: AIAnalysis;      // AI分析结果
  crawlLoading: boolean;        // 爬虫加载状态
  aiLoading: boolean;          // AI分析加载状态
  step: 'idle' | 'crawling' | 'crawled' | 'analyzing' | 'completed';
}

const API_URL = 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev';

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, CompanyAnalysisResult>>({});
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<Record<string, string | null>>({});
  const [uploadLoading, setUploadLoading] = useState(false);

  // 加载客户数据
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/customers`);
      if (!response.ok) throw new Error('获取客户数据失败');
      
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
      } else {
        throw new Error(data.message || '数据格式错误');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  // 步骤1：爬虫搜索公司信息
  const crawlCompanyData = async (customer: Customer) => {
    try {
      // 初始化分析状态
      setAnalysisResults(prev => ({
        ...prev,
        [customer.id]: {
          crawlData: [],
          crawlLoading: true,
          aiLoading: false,
          step: 'crawling'
        }
      }));

      console.log(`开始爬虫搜索: ${customer.companyName}`);

      const response = await fetch(`${API_URL}/api/crawler/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: [customer.companyName, customer.industry].filter(Boolean),
          industry: customer.industry,
          maxResults: 5
        })
      });

      if (!response.ok) throw new Error(`爬虫搜索失败: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        const crawlData = data.data || [];
        console.log(`爬虫搜索完成，找到 ${crawlData.length} 个结果`);
        
        setAnalysisResults(prev => ({
          ...prev,
          [customer.id]: {
            ...prev[customer.id],
            crawlData,
            crawlLoading: false,
            step: 'crawled'
          }
        }));

        return crawlData;
      } else {
        throw new Error(data.message || '爬虫搜索失败');
      }
    } catch (err) {
      console.error('爬虫搜索错误:', err);
      setAnalysisResults(prev => ({
        ...prev,
        [customer.id]: {
          crawlData: [],
          crawlLoading: false,
          aiLoading: false,
          step: 'idle'
        }
      }));
      alert(`爬虫搜索失败: ${err instanceof Error ? err.message : '未知错误'}`);
      return null;
    }
  };

  // 步骤2：AI分析长文本
  const analyzeWithAI = async (customer: Customer, crawlData: CrawlResult[]) => {
    try {
      setAnalysisResults(prev => ({
        ...prev,
        [customer.id]: {
          ...prev[customer.id],
          aiLoading: true,
          step: 'analyzing'
        }
      }));

      console.log(`开始AI分析: ${customer.companyName}`);

      // 选择最佳的爬虫结果进行分析（通常是评分最高的）
      const bestResult = crawlData
        .filter(item => !item.error && item.score.overall > 0)
        .sort((a, b) => b.score.overall - a.score.overall)[0];

      if (!bestResult) {
        throw new Error('没有找到有效的爬虫数据进行分析');
      }

      const response = await fetch(`${API_URL}/api/ai-analysis/analyze-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: bestResult.website,
          businessContext: {
            companyName: customer.companyName,
            industry: customer.industry || 'Business',
            services: ['Manufacturing', 'Business Solutions'],
            targetMarkets: ['Global', 'B2B'],
            uniqueValueProposition: 'Quality business solutions'
          },
          analysisDepth: 'detailed',
          language: 'zh'
        })
      });

      if (!response.ok) throw new Error(`AI分析失败: ${response.status}`);
      
      const aiData = await response.json();
      if (aiData.success) {
        console.log(`AI分析完成: ${customer.companyName}，总分: ${aiData.data.analysis.overallScore}`);
        
        setAnalysisResults(prev => ({
          ...prev,
          [customer.id]: {
            ...prev[customer.id],
            aiAnalysis: aiData.data.analysis,
            aiLoading: false,
            step: 'completed'
          }
        }));
      } else {
        throw new Error(aiData.message || 'AI分析失败');
      }
    } catch (err) {
      console.error('AI分析错误:', err);
      setAnalysisResults(prev => ({
        ...prev,
        [customer.id]: {
          ...prev[customer.id],
          aiLoading: false,
          step: 'crawled'  // 回到爬虫完成状态
        }
      }));
      alert(`AI分析失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  // 完整分析流程：爬虫 → AI分析
  const performFullAnalysis = async (customer: Customer) => {
    const crawlData = await crawlCompanyData(customer);
    if (crawlData && crawlData.length > 0) {
      await analyzeWithAI(customer, crawlData);
    }
  };

  // 文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_URL}/api/customers/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert(`上传成功：导入了 ${data.data.success} 条记录`);
        fetchCustomers(); // 重新加载客户数据
      } else {
        alert(`上传失败：${data.message}`);
      }
    } catch (err) {
      alert(`上传错误：${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setUploadLoading(false);
      event.target.value = ''; // 清空文件选择
    }
  };

  // 切换展开状态
  const toggleCustomer = (customerId: string) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

  const toggleSection = (customerId: string, section: string) => {
    const key = `${customerId}-${section}`;
    setExpandedSection(prev => ({
      ...prev,
      [key]: prev[key] === section ? null : section
    }));
  };

  // 获取步骤状态
  const getStepStatus = (customerId: string) => {
    const result = analysisResults[customerId];
    if (!result) return { step: 'idle', icon: Bot, color: 'gray' };

    switch (result.step) {
      case 'crawling':
        return { step: '爬虫搜索中...', icon: Search, color: 'blue' };
      case 'crawled':
        return { step: '爬虫完成，等待AI分析', icon: Globe, color: 'green' };
      case 'analyzing':
        return { step: 'AI分析中...', icon: Bot, color: 'purple' };
      case 'completed':
        return { step: '分析完成', icon: Target, color: 'green' };
      default:
        return { step: '开始分析', icon: Zap, color: 'gray' };
    }
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

  // 获取分数颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载客户数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCustomers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">外贸客户AI分析平台</h1>
              <p className="text-gray-600 mt-1">爬虫搜索 → 长文本生成 → AI智能分析</p>
            </div>
            
            {/* 文件上传 */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploadLoading}
                />
                <button
                  disabled={uploadLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploadLoading ? '上传中...' : '上传Excel/CSV'}
                </button>
              </div>
              <p className="text-sm text-gray-500">共 {customers.length} 个客户</p>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无客户数据</h3>
            <p className="text-gray-500 mb-6">请上传Excel或CSV文件来导入客户数据</p>
          </div>
        ) : (
          <div className="space-y-6">
            {customers.map((customer) => {
              const result = analysisResults[customer.id];
              const stepStatus = getStepStatus(customer.id);
              const StepIcon = stepStatus.icon;

              return (
                <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* 客户基本信息 */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Building className="w-5 h-5 text-blue-600" />
                          <h2 className="text-xl font-semibold text-gray-900">{customer.companyName}</h2>
                          {result?.aiAnalysis && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(result.aiAnalysis.priority)}`}>
                              {result.aiAnalysis.priority.toUpperCase()} 优先级
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">联系人:</span>
                            <span className="text-gray-600">{customer.contactName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">行业:</span>
                            <span className="text-gray-600">{customer.industry}</span>
                          </div>
                        </div>
                        
                        {customer.website && (
                          <div>
                            <a 
                              href={customer.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {customer.website}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* 操作按钮和状态 */}
                      <div className="flex items-center gap-3">
                        {/* 进度显示 */}
                        {result && (
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                result.crawlData.length > 0 ? 'bg-green-100 text-green-600' : 
                                result.crawlLoading ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                              }`}>
                                {result.crawlLoading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <Search className="w-4 h-4" />
                                )}
                              </div>
                              <div className={`w-4 h-0.5 ${result.crawlData.length > 0 ? 'bg-green-300' : 'bg-gray-300'}`}></div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                result.aiAnalysis ? 'bg-green-100 text-green-600' : 
                                result.aiLoading ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                              }`}>
                                {result.aiLoading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                ) : (
                                  <Bot className="w-4 h-4" />
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              爬虫 → AI
                            </div>
                          </div>
                        )}
                        
                        {/* AI分析总分 */}
                        {result?.aiAnalysis && (
                          <div className={`px-3 py-1 rounded-lg ${getScoreColor(result.aiAnalysis.overallScore)}`}>
                            <span className="font-medium">总分: {result.aiAnalysis.overallScore}/100</span>
                          </div>
                        )}
                        
                        {/* 主要操作按钮 */}
                        <button
                          onClick={() => {
                            if (result?.step === 'crawled' && result.crawlData.length > 0) {
                              analyzeWithAI(customer, result.crawlData);
                            } else {
                              performFullAnalysis(customer);
                            }
                          }}
                          disabled={result?.crawlLoading || result?.aiLoading}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50 ${
                            stepStatus.color === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                            stepStatus.color === 'purple' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                            stepStatus.color === 'green' ? 'bg-green-600 text-white hover:bg-green-700' :
                            'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                          }`}
                        >
                          {result?.crawlLoading || result?.aiLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>{stepStatus.step}</span>
                            </>
                          ) : (
                            <>
                              <StepIcon className="w-4 h-4" />
                              <span>
                                {result?.step === 'crawled' && result.crawlData.length > 0 ? 'AI分析' :
                                 result?.step === 'completed' ? '重新分析' : '开始分析'}
                              </span>
                            </>
                          )}
                        </button>
                        
                        {/* 查看详情按钮 */}
                        {result && (result.crawlData.length > 0 || result.aiAnalysis) && (
                          <button
                            onClick={() => toggleCustomer(customer.id)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>{expandedCustomer === customer.id ? '收起详情' : '查看详情'}</span>
                            {expandedCustomer === customer.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 详细结果展示 */}
                  {result && (result.crawlData.length > 0 || result.aiAnalysis) && expandedCustomer === customer.id && (
                    <div className="border-t border-gray-200">
                      <div className="p-6 space-y-6">
                        {/* 爬虫搜索结果 */}
                        {result.crawlData.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Search className="w-5 h-5 text-blue-600" />
                                爬虫搜索结果 ({result.crawlData.length} 个网页)
                              </h3>
                              <button
                                onClick={() => toggleSection(customer.id, 'crawl')}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {expandedSection[`${customer.id}-crawl`] === 'crawl' ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                            
                            {/* 搜索结果汇总 */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center p-3 bg-white rounded border">
                                <div className="text-xl font-bold text-blue-600">
                                  {Math.round(result.crawlData.reduce((sum, item) => sum + item.score.overall, 0) / result.crawlData.length)}
                                </div>
                                <div className="text-sm text-gray-600">平均质量</div>
                              </div>
                              <div className="text-center p-3 bg-white rounded border">
                                <div className="text-xl font-bold text-green-600">
                                  {result.crawlData.reduce((sum, item) => sum + item.contactEmails.length, 0)}
                                </div>
                                <div className="text-sm text-gray-600">邮箱总数</div>
                              </div>
                              <div className="text-center p-3 bg-white rounded border">
                                <div className="text-xl font-bold text-purple-600">
                                  {result.crawlData.reduce((sum, item) => sum + item.phones.length, 0)}
                                </div>
                                <div className="text-sm text-gray-600">电话总数</div>
                              </div>
                              <div className="text-center p-3 bg-white rounded border">
                                <div className="text-xl font-bold text-orange-600">
                                  {result.crawlData.filter(item => item.score.overall >= 70).length}
                                </div>
                                <div className="text-sm text-gray-600">高质量源</div>
                              </div>
                            </div>

                            {expandedSection[`${customer.id}-crawl`] === 'crawl' && (
                              <div className="space-y-3">
                                {result.crawlData.map((crawlItem, idx) => (
                                  <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">#{idx + 1}</span>
                                        <a 
                                          href={crawlItem.website} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="font-medium text-blue-600 hover:text-blue-800"
                                        >
                                          {crawlItem.companyName || '未知公司'}
                                        </a>
                                      </div>
                                      <span className={`px-2 py-1 rounded text-xs ${getScoreColor(crawlItem.score.overall)}`}>
                                        质量分: {crawlItem.score.overall}
                                      </span>
                                    </div>
                                    
                                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                      {crawlItem.description || '无描述信息'}
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                      {crawlItem.contactEmails.length > 0 && (
                                        <div>
                                          <span className="font-medium text-gray-700">邮箱 ({crawlItem.contactEmails.length}):</span>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {crawlItem.contactEmails.slice(0, 3).map((email, emailIdx) => (
                                              <span key={emailIdx} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded">
                                                {email}
                                              </span>
                                            ))}
                                            {crawlItem.contactEmails.length > 3 && (
                                              <span className="text-gray-500">+{crawlItem.contactEmails.length - 3} 更多</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {crawlItem.phones.length > 0 && (
                                        <div>
                                          <span className="font-medium text-gray-700">电话 ({crawlItem.phones.length}):</span>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {crawlItem.phones.slice(0, 2).map((phone, phoneIdx) => (
                                              <span key={phoneIdx} className="px-1 py-0.5 bg-green-100 text-green-800 rounded">
                                                {phone}
                                              </span>
                                            ))}
                                            {crawlItem.phones.length > 2 && (
                                              <span className="text-gray-500">+{crawlItem.phones.length - 2} 更多</span>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {Object.keys(crawlItem.socialMedia || {}).length > 0 && (
                                        <div>
                                          <span className="font-medium text-gray-700">社交媒体:</span>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {Object.entries(crawlItem.socialMedia || {}).map(([platform, url]) => (
                                              <span key={platform} className="px-1 py-0.5 bg-purple-100 text-purple-800 rounded">
                                                {platform}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* AI分析结果 */}
                        {result.aiAnalysis && (
                          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Bot className="w-5 h-5 text-purple-600" />
                                AI 深度分析报告
                              </h3>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-purple-600">{result.aiAnalysis.overallScore}/100</div>
                                <div className="text-sm text-gray-600">综合评分</div>
                              </div>
                            </div>

                            {/* 5维度评分 */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                              {Object.entries(result.aiAnalysis.dimensions).map(([key, dimension]) => (
                                <div key={key} className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                                  <div className={`text-lg font-bold mb-1 ${getScoreColor(dimension.score)} px-2 py-1 rounded`}>
                                    {dimension.score}
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium">
                                    {key === 'marketPotential' && '市场潜力'}
                                    {key === 'businessMatching' && '业务匹配'}
                                    {key === 'contactability' && '联系便利性'}
                                    {key === 'competitiveAdvantage' && '竞争优势'}
                                    {key === 'urgencyLevel' && '紧急程度'}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* 详细分析展开 */}
                            <div className="space-y-3">
                              {Object.entries(result.aiAnalysis.dimensions).map(([key, dimension]) => (
                                <div key={key} className="bg-white rounded-lg p-4 border border-gray-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900">
                                      {key === 'marketPotential' && '市场潜力分析'}
                                      {key === 'businessMatching' && '业务匹配度'}
                                      {key === 'contactability' && '联系便利性'}
                                      {key === 'competitiveAdvantage' && '竞争优势'}
                                      {key === 'urgencyLevel' && '紧急程度'}
                                    </h4>
                                    <span className={`px-2 py-1 rounded text-sm ${getScoreColor(dimension.score)}`}>
                                      {dimension.score}/100
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">{dimension.description}</p>
                                  <div className="text-xs text-gray-600">
                                    <strong>关键原因：</strong>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                      {dimension.reasons.map((reason, idx) => (
                                        <li key={idx}>{reason}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* 商业建议 */}
                            <div className="bg-white rounded-lg p-4 border border-gray-100 mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">AI 商业建议</h4>
                              <p className="text-sm text-gray-700 leading-relaxed mb-4">{result.aiAnalysis.recommendation}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium text-gray-800 text-sm mb-2">接触策略</h5>
                                  <p className="text-xs text-gray-600 mb-2">{result.aiAnalysis.outreachStrategy.primaryApproach}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {result.aiAnalysis.outreachStrategy.keySellingPoints.map((point, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        {point}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-800 text-sm mb-2">最佳时机</h5>
                                  <p className="text-xs text-gray-600">{result.aiAnalysis.outreachStrategy.suggestedTiming}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}