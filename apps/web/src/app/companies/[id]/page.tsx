'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AIAnalysisCard from '@/components/company/AIAnalysisCard';
import ContactInfoCard from '@/components/company/ContactInfoCard';
import type { Company } from '@trade-assistant/dto';

// Mock公司数据
const mockCompanies: Record<string, Company> = {
  '1': {
    id: '1',
    name: 'Global Tech Solutions',
    domain: 'globaltech.com',
    country: '美国',
    industry: '科技',
    employeeCount: 250,
    website: 'https://globaltech.com',
    description: '专业的技术解决方案提供商，专注于企业级软件开发和云服务',
    tags: ['B2B', '科技', '软件开发', '云服务'],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  '2': {
    id: '2',
    name: 'European Manufacturing Ltd',
    domain: 'euroman.co.uk',
    country: '英国',
    industry: '制造业',
    employeeCount: 500,
    website: 'https://euroman.co.uk',
    description: '欧洲领先的制造商，主要生产工业设备和零部件',
    tags: ['制造', '出口', 'OEM', '工业设备'],
    createdAt: '2024-01-16T09:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z',
  },
};

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'contact' | 'documents'>('analysis');

  useEffect(() => {
    // 模拟加载公司信息
    const loadCompany = async () => {
      setLoading(true);
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const companyData = mockCompanies[companyId];
      if (companyData) {
        setCompany(companyData);
        // 自动加载AI分析
        loadAnalysis();
      } else {
        // 公司不存在，返回列表页
        router.push('/');
      }
      
      setLoading(false);
    };

    loadCompany();
  }, [companyId, router]);

  const loadAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      
      // 调用AI分析API
      const response = await fetch(`/api/agent/company/${companyId}/analysis`);
      
      if (response.ok) {
        const result = await response.json();
        setAnalysis(result.analysis);
      } else {
        console.error('Failed to load analysis');
      }
    } catch (error) {
      console.error('Analysis loading error:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleReAnalyze = async () => {
    setAnalysisLoading(true);
    
    // 模拟重新分析（实际应用中需要提供公司文档内容）
    const mockDocumentContent = `
    公司名称: ${company?.name}
    官方网站: ${company?.website}
    行业: ${company?.industry}
    员工数: ${company?.employeeCount}
    描述: ${company?.description}
    
    这是一个模拟的爬虫文档内容，包含了从公司网站抓取的信息...
    联系我们页面显示了以下信息：
    - 邮箱: contact@${company?.domain}
    - 电话: +1-555-123-4567
    - 地址: 123 Business Street, New York, NY
    
    关于我们页面内容：
    我们是一家专业的${company?.industry}公司...
    `;

    try {
      const response = await fetch('/api/agent/analyze-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: companyId,
          documentContent: mockDocumentContent,
          analysisType: 'full_research',
          forceReanalysis: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'completed') {
          setAnalysis(result.analysis);
        }
      }
    } catch (error) {
      console.error('Re-analysis failed:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="card">
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">公司不存在</h2>
          <p className="text-gray-600 mb-4">找不到指定的公司信息</p>
          <button 
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            返回客户列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑导航 */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <button 
          onClick={() => router.push('/')}
          className="hover:text-gray-700"
        >
          客户管理
        </button>
        <span>/</span>
        <span className="text-gray-900">{company.name}</span>
      </nav>

      {/* 公司头部信息 */}
      <div className="card mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>🌍 {company.country}</span>
                  <span>🏭 {company.industry}</span>
                  {company.employeeCount && <span>👥 {company.employeeCount} 人</span>}
                </div>
              </div>
            </div>
            
            {company.description && (
              <p className="text-gray-700 mb-4">{company.description}</p>
            )}
            
            {company.website && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">🌐</span>
                <a 
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleReAnalyze}
              disabled={analysisLoading}
              className="btn-primary disabled:opacity-50"
            >
              {analysisLoading ? '分析中...' : '🤖 AI分析'}
            </button>
            <button className="btn-secondary">
              ⭐ 加入收藏
            </button>
          </div>
        </div>
        
        {/* 标签 */}
        {company.tags && company.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            {company.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 标签页导航 */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-6 py-3 text-sm font-medium border-b-2 ${
            activeTab === 'analysis'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🤖 AI分析报告
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-6 py-3 text-sm font-medium border-b-2 ${
            activeTab === 'contact'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📞 联系信息
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-6 py-3 text-sm font-medium border-b-2 ${
            activeTab === 'documents'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📄 源文档
        </button>
      </div>

      {/* 标签页内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {activeTab === 'analysis' && (
          <>
            <div className="lg:col-span-2">
              <AIAnalysisCard 
                analysis={analysis}
                loading={analysisLoading}
                onReAnalyze={handleReAnalyze}
              />
            </div>
            <div>
              <ContactInfoCard analysis={analysis} />
            </div>
          </>
        )}
        
        {activeTab === 'contact' && (
          <div className="lg:col-span-3">
            <ContactInfoCard analysis={analysis} />
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div className="lg:col-span-3">
            <div className="card text-center">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">源文档管理</h3>
              <p className="text-gray-600 mb-4">
                这里将显示爬虫抓取的原始网页内容和文档
              </p>
              <div className="text-sm text-gray-500">
                功能开发中，敬请期待...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}