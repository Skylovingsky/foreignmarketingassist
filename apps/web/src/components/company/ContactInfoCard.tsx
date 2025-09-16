'use client';

import { useState } from 'react';

interface ContactInfoCardProps {
  analysis: any;
}

export default function ContactInfoCard({ analysis }: ContactInfoCardProps) {
  const [copiedItem, setCopiedItem] = useState<string>('');

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getEmailTypeColor = (type: string) => {
    switch (type) {
      case 'personal': return 'bg-green-100 text-green-800';
      case 'company': return 'bg-blue-100 text-blue-800';
      case 'generic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmailTypeText = (type: string) => {
    switch (type) {
      case 'personal': return '个人邮箱';
      case 'company': return '公司邮箱';
      case 'generic': return '通用邮箱';
      default: return '未知';
    }
  };

  const getPhoneTypeText = (type: string) => {
    switch (type) {
      case 'main': return '主要电话';
      case 'mobile': return '手机号码';
      case 'fax': return '传真号码';
      default: return '电话';
    }
  };

  if (!analysis?.companyInfo) {
    return (
      <div className="card">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📞</div>
          <p>暂无联系信息</p>
          <p className="text-sm">AI分析完成后将显示提取的联系方式</p>
        </div>
      </div>
    );
  }

  const { companyInfo } = analysis;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">📞</span>
          联系信息
        </h3>
        <div className="text-sm text-gray-500">
          AI提取 • 置信度 {Math.round(analysis.metadata?.confidence_level * 100)}%
        </div>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">公司名称</label>
            <div className="flex items-center justify-between">
              <span className="text-gray-900">{companyInfo.name}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">国家地区</label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">{companyInfo.country}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">主营行业</label>
            <span className="text-gray-900">{companyInfo.industry}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">员工规模</label>
            <span className="text-gray-900">{companyInfo.employees || '未知'}</span>
          </div>
        </div>

        {/* 官方网站 */}
        {companyInfo.website && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">官方网站</label>
            <div className="flex items-center justify-between">
              <a 
                href={companyInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 hover:underline"
              >
                {companyInfo.website}
              </a>
              <button
                onClick={() => copyToClipboard(companyInfo.website, 'website')}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                {copiedItem === 'website' ? '✓' : '📋'}
              </button>
            </div>
          </div>
        )}

        {/* 邮箱列表 */}
        {companyInfo.contact_emails && companyInfo.contact_emails.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">邮箱地址</label>
            <div className="space-y-2">
              {companyInfo.contact_emails.map((email: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{email.email}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmailTypeColor(email.type)}`}>
                        {getEmailTypeText(email.type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        置信度: {Math.round(email.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(email.email, `email-${index}`)}
                      className="text-gray-400 hover:text-gray-600 text-sm p-1"
                      title="复制邮箱"
                    >
                      {copiedItem === `email-${index}` ? '✓' : '📋'}
                    </button>
                    <a
                      href={`mailto:${email.email}`}
                      className="text-brand-600 hover:text-brand-700 text-sm p-1"
                      title="发送邮件"
                    >
                      ✉️
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 电话列表 */}
        {companyInfo.phones && companyInfo.phones.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">电话号码</label>
            <div className="space-y-2">
              {companyInfo.phones.map((phone: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{phone.number}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {getPhoneTypeText(phone.type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        置信度: {Math.round(phone.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(phone.number, `phone-${index}`)}
                      className="text-gray-400 hover:text-gray-600 text-sm p-1"
                      title="复制号码"
                    >
                      {copiedItem === `phone-${index}` ? '✓' : '📋'}
                    </button>
                    <a
                      href={`tel:${phone.number}`}
                      className="text-green-600 hover:text-green-700 text-sm p-1"
                      title="拨打电话"
                    >
                      📞
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 社交媒体 */}
        {companyInfo.social_media && Object.keys(companyInfo.social_media).some(key => companyInfo.social_media[key]) && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">社交媒体</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {companyInfo.social_media.linkedin && (
                <a
                  href={companyInfo.social_media.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span>💼</span>
                  <span className="text-sm">LinkedIn</span>
                </a>
              )}
              {companyInfo.social_media.facebook && (
                <a
                  href={companyInfo.social_media.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span>📘</span>
                  <span className="text-sm">Facebook</span>
                </a>
              )}
              {companyInfo.social_media.instagram && (
                <a
                  href={companyInfo.social_media.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors"
                >
                  <span>📷</span>
                  <span className="text-sm">Instagram</span>
                </a>
              )}
              {companyInfo.social_media.whatsapp && (
                <a
                  href={`https://wa.me/${companyInfo.social_media.whatsapp.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span>💚</span>
                  <span className="text-sm">WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* 产品信息 */}
        {companyInfo.primary_products && companyInfo.primary_products.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">主要产品</label>
            <div className="flex flex-wrap gap-2">
              {companyInfo.primary_products.map((product: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                >
                  {product}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}