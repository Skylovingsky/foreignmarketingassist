'use client';

import { useState, useRef, useEffect } from 'react';
import type { AgentMessage } from '@trade-assistant/dto';

export default function AgentPage() {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是外贸小助手，专门帮助您进行客户开发和业务咨询。我可以协助您：\n\n• 分析客户质量和潜在价值\n• 生成个性化开发信\n• 提供行业洞察和市场分析\n• 制定客户跟进策略\n\n请告诉我您需要什么帮助？',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useRAG, setUseRAG] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: AgentMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 使用API客户端发送消息
      const { sendChatMessage } = await import('@/lib/api');
      const response = await sendChatMessage([...messages, userMessage], {
        useRag: useRAG,
        temperature: 0.7,
      });

      setMessages(prev => [...prev, response.message]);
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: AgentMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '抱歉，我暂时无法回应。请检查网络连接或稍后再试。',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI助手</h1>
        <p className="mt-2 text-gray-600">
          与智能助手对话，获取专业的外贸业务建议
        </p>
      </div>

      {/* 聊天区域 */}
      <div className="card h-[600px] flex flex-col">
        {/* 设置栏 */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">智能对话</h2>
            <button
              onClick={() => setMessages(messages.slice(0, 1))}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-200 hover:bg-gray-50"
            >
              🗑️ 清空对话
            </button>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-3xl px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-brand-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-3xl px-4 py-2 rounded-lg bg-gray-100">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题..."
                className="input resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发送
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            按 Enter 发送，Shift + Enter 换行
          </div>
        </div>
      </div>

      {/* 快速问题 */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">常见问题</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            '如何提高开发信的回复率？',
            '怎样评估客户的质量和潜力？',
            '制定客户跟进策略的要点？',
            '如何利用LinkedIn开发客户？',
          ].map((question, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(question)}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <div className="text-sm font-medium text-gray-900">{question}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}