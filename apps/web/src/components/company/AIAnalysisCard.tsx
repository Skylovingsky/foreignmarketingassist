'use client';

import { useState } from 'react';

interface QualityScoreDetail {
  score: number;
  weight: number;
  reasoning: string;
}

interface QualityScore {
  email_quality: QualityScoreDetail;
  contact_completeness: QualityScoreDetail;
  website_activity: QualityScoreDetail;
  company_size: QualityScoreDetail;
  purchase_intent: QualityScoreDetail;
  final_score: number;
  grade: string;
  priority_level: string;
}

interface AIAnalysisCardProps {
  analysis: any;
  loading?: boolean;
  onReAnalyze?: () => void;
}

export default function AIAnalysisCard({ analysis, loading, onReAnalyze }: AIAnalysisCardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'outreach'>('overview');

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="card text-center">
        <div className="text-gray-500 mb-4">
          <div className="text-4xl mb-2">🤖</div>
          <p>暂无AI分析结果</p>
          <p className="text-sm">点击下方按钮开始分析</p>
        </div>
        <button 
          onClick={onReAnalyze}
          className="btn-primary"
        >
          开始AI分析
        </button>
      </div>
    );
  }

  const qualityScore = analysis.qualityScore as QualityScore;
  
  const getGradeColor = (grade: string) => {
    switch (grade?.charAt(0)) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';  
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高优先级': return 'text-red-600 bg-red-100';
      case '中优先级': return 'text-yellow-600 bg-yellow-100';
      case '低优先级': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="card">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🤖</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI智能分析</h3>
            <p className="text-sm text-gray-500">
              分析时间：{new Date(analysis.metadata?.analysis_timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(qualityScore?.grade)}`}>
            {qualityScore?.grade || 'N/A'}
          </span>
          <button 
            onClick={onReAnalyze}
            className="btn-secondary text-sm"
          >
            重新分析
          </button>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'overview'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          质量评分
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'research'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          研究报告
        </button>
        <button
          onClick={() => setActiveTab('outreach')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'outreach'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          外联建议
        </button>
      </div>

      {/* 标签页内容 */}
      <div className="min-h-[300px]">
        {activeTab === 'overview' && (
          <div>
            {/* 总分和优先级 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600">
                  {qualityScore?.final_score?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">总体评分</div>
              </div>
              <div className="text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-lg font-semibold ${getGradeColor(qualityScore?.grade)}`}>
                  {qualityScore?.grade || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mt-1">质量等级</div>
              </div>
              <div className="text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(qualityScore?.priority_level)}`}>
                  {qualityScore?.priority_level || '待评估'}
                </div>
                <div className="text-sm text-gray-600 mt-1">优先级</div>
              </div>
            </div>

            {/* 分项评分 */}
            <div className="space-y-4">
              {qualityScore && Object.entries(qualityScore).map(([key, value]) => {
                if (typeof value === 'object' && value !== null && 'score' in value) {
                  const detail = value as QualityScoreDetail;
                  const percentage = (detail.score / 10) * 100;
                  
                  const getScoreName = (key: string) => {
                    const names: Record<string, string> = {
                      email_quality: '📧 邮箱质量',
                      contact_completeness: '📞 联系完整度',
                      website_activity: '🌐 网站活跃度',
                      company_size: '🏢 公司规模',
                      purchase_intent: '🛒 采购意向',
                    };
                    return names[key] || key;
                  };
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          {getScoreName(key)}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {detail.score.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">{detail.reasoning}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* 数据质量问题 */}
            {analysis.dataQualityIssues && analysis.dataQualityIssues.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ 数据质量提醒</h4>
                <ul className="space-y-1">
                  {analysis.dataQualityIssues.map((issue: any, index: number) => (
                    <li key={index} className="text-sm text-yellow-700">
                      • {issue.issue} ({issue.severity})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'research' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📋 执行摘要</h4>
              <p className="text-gray-700 leading-relaxed">
                {analysis.researchReport?.executive_summary}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🏭 业务模式</h4>
                <p className="text-gray-700">{analysis.researchReport?.business_model}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📊 市场地位</h4>
                <p className="text-gray-700">{analysis.researchReport?.market_position}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🤝 合作潜力</h4>
                <p className="text-gray-700">{analysis.researchReport?.cooperation_potential}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">👥 决策者特征</h4>
                <p className="text-gray-700">{analysis.researchReport?.key_decision_makers}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">⚖️ 风险与机会</h4>
              <p className="text-gray-700 leading-relaxed">
                {analysis.researchReport?.risks_and_opportunities}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'outreach' && (
          <div className="space-y-6">
            {/* 外联策略 */}
            {analysis.outreachStrategy && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">🎯 推荐策略</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">推荐渠道：</span>
                    <span className="text-blue-700 ml-1">{analysis.outreachStrategy.recommended_channel}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">最佳时间：</span>
                    <span className="text-blue-700 ml-1">{analysis.outreachStrategy.best_contact_time}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-medium text-blue-800">文化提醒：</span>
                  <span className="text-blue-700 ml-1">{analysis.outreachStrategy.cultural_notes}</span>
                </div>
              </div>
            )}

            {/* 外联消息模板 */}
            {analysis.outreachMessages && analysis.outreachMessages.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">💌 消息模板</h4>
                {analysis.outreachMessages.map((message: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">
                        {message.language} - {message.subject}
                      </span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(message.content)}
                        className="text-brand-600 hover:text-brand-700 text-sm"
                      >
                        复制
                      </button>
                    </div>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                      {message.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* 跟进建议 */}
            {analysis.followUpSuggestions && analysis.followUpSuggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">📅 跟进计划</h4>
                <div className="space-y-3">
                  {analysis.followUpSuggestions.map((suggestion: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-16 text-xs text-gray-600 font-medium">
                        {suggestion.timing}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{suggestion.method}</div>
                        <div className="text-sm text-gray-600">{suggestion.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}