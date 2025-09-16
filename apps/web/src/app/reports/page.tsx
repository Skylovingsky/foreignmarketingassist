'use client';

import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 集成真实的报表数据API
    const loadReportData = async () => {
      try {
        // 这里将连接到真实的API
        // const response = await fetch('/api/reports');
        // const data = await response.json();
        
        // 暂时设置loading完成，显示空状态
      } catch (error) {
        console.error('加载报表数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">数据分析报表</h1>
        <p className="mt-2 text-gray-600">
          客户数据统计和业务分析洞察
        </p>
      </div>

      {/* 空状态提示 */}
      <div className="card">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无报表数据
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            导入客户数据后，系统将自动生成详细的分析报表，包括地理分布、行业分析、转化率统计等
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/import" className="btn-primary">
              📊 导入数据
            </a>
            <a href="/" className="btn-secondary">
              🏠 返回首页
            </a>
          </div>
        </div>
      </div>

      {/* 功能预览 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center p-6">
          <div className="text-3xl mb-3">👥</div>
          <h4 className="font-medium text-gray-900 mb-2">客户统计</h4>
          <p className="text-sm text-gray-600">
            总数、新增、活跃度等关键指标
          </p>
        </div>

        <div className="card text-center p-6">
          <div className="text-3xl mb-3">🌍</div>
          <h4 className="font-medium text-gray-900 mb-2">地理分布</h4>
          <p className="text-sm text-gray-600">
            按国家地区分析客户分布情况
          </p>
        </div>

        <div className="card text-center p-6">
          <div className="text-3xl mb-3">🏭</div>
          <h4 className="font-medium text-gray-900 mb-2">行业分析</h4>
          <p className="text-sm text-gray-600">
            客户行业类型分布和特征分析
          </p>
        </div>

        <div className="card text-center p-6">
          <div className="text-3xl mb-3">📈</div>
          <h4 className="font-medium text-gray-900 mb-2">趋势分析</h4>
          <p className="text-sm text-gray-600">
            月度增长和业务发展趋势
          </p>
        </div>
      </div>
    </div>
  );
}