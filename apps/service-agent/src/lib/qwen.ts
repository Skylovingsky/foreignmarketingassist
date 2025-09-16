import OpenAI from 'openai';
import crypto from 'crypto';
import type { ChatRequest, ChatResponse, AgentMessage } from '@trade-assistant/dto';

export class QwenClient {
  private client?: OpenAI;
  private model: string = 'qwen-plus';

  private useMockMode: boolean;

  constructor() {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    const baseURL = process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
    
    // 调试日志
    console.log('🔑 Debug - API Key exists:', !!apiKey);
    console.log('🔑 Debug - API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'null');
    
    // 检查是否使用演示模式
    this.useMockMode = !apiKey || apiKey === 'sk-demo-key-placeholder';
    
    console.log('🎭 Debug - Use mock mode:', this.useMockMode);
    
    if (!this.useMockMode) {
      console.log('🚀 Initializing real Qwen client with API key');
      console.log('🔧 Debug - Base URL:', baseURL);
      this.client = new OpenAI({
        apiKey,
        baseURL,
        defaultHeaders: {
          'User-Agent': 'trade-assistant/1.0.0',
        },
      });
    } else {
      console.log('🎭 Running in mock mode - using simulated AI responses');
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (this.useMockMode) {
      return this.getMockResponse(request);
    }

    // Try direct HTTP client first as workaround
    try {
      return await this.chatDirect(request);
    } catch (directError) {
      console.warn('🔄 Direct HTTP failed, trying OpenAI SDK:', directError);
      
      try {
        if (!this.client) {
          throw new Error('OpenAI client not initialized');
        }

        const messages = request.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        }));

        console.log('🔍 Debug - Making API call with model:', this.model);
        console.log('🔍 Debug - Messages count:', messages.length);

        const response = await this.client.chat.completions.create({
          model: this.model,
          messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 2000,
          stream: false,
        });

        console.log('✅ Debug - API call successful');

        const choice = response.choices[0];
        const message: AgentMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: choice.message.content || '',
          timestamp: new Date().toISOString(),
        };

        return {
          message,
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
        };
      } catch (error) {
        console.error('🚨 Qwen API error:', error);
        console.error('🚨 Error details:', JSON.stringify(error, null, 2));
        if (error && typeof error === 'object' && 'status' in error) {
          console.error('🚨 HTTP Status:', error.status);
        }
        throw new Error(`AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async chatDirect(request: ChatRequest): Promise<ChatResponse> {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    const baseURL = process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    
    const messages = request.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    console.log('🔥 Direct HTTP call to DashScope API');

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚨 Direct API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Direct HTTP call successful');

    const choice = data.choices[0];
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: choice.message.content || '',
      timestamp: new Date().toISOString(),
    };

    return {
      message,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<any, void, unknown> {
    if (this.useMockMode) {
      yield* this.getMockStreamResponse(request);
      return;
    }

    try {
      if (!this.client) {
        throw new Error('OpenAI client not initialized');
      }

      const messages = request.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
        stream: true,
      });

      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (choice?.delta) {
          yield {
            delta: {
              content: choice.delta.content || '',
              role: choice.delta.role || 'assistant',
            },
            done: choice.finish_reason !== null,
          };
        }
      }
    } catch (error) {
      console.error('Qwen streaming error:', error);
      throw new Error(`AI streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Mock响应方法
  private getMockResponse(request: ChatRequest): ChatResponse {
    const userMessage = request.messages[request.messages.length - 1];
    const mockResponses = [
      '您好！我是外贸小助手的演示版本。目前您看到的是模拟响应，因为还没有配置真实的AI API密钥。\n\n关于您的问题，我建议：\n\n1. 📧 **开发信优化**: 个性化邮件主题，突出产品价值\n2. 🎯 **客户筛选**: 重点关注有明确采购需求的客户\n3. 📞 **多渠道跟进**: 结合邮件、电话、社交媒体\n4. 📊 **数据分析**: 定期分析转化率和客户反馈\n\n如需完整的AI功能，请联系管理员配置真实的通义千问API密钥。',
      
      '感谢您的咨询！作为外贸小助手，我来为您分析一下：\n\n**客户开发策略建议：**\n\n🌍 **市场研究**\n- 分析目标市场的文化背景和商务习惯\n- 了解当地的节假日和最佳联系时间\n- 研究竞争对手的策略和定价\n\n📧 **邮件营销**\n- 邮件主题要简洁明了，避免敏感词汇\n- 内容要突出客户的痛点和您的解决方案\n- 适当使用客户的本地语言问候\n\n💼 **关系建立**\n- 建立信任需要时间，保持耐心和专业\n- 定期分享行业资讯和产品更新\n- 参加行业展会和线上活动\n\n⚠️ 提醒：这是演示模式回复，完整功能需要配置API密钥。',
      
      '您好！关于外贸业务，我有以下几点建议：\n\n**提高询盘质量的方法：**\n\n🎯 **精准定位**\n- 明确目标客户画像\n- 分析客户的采购周期\n- 关注客户的实际需求\n\n📈 **提升转化率**\n- 快速响应客户询盘（24小时内）\n- 提供详细的产品信息和报价\n- 展示公司实力和成功案例\n\n🤝 **维护客户关系**\n- 建立客户档案，记录沟通历史\n- 节假日问候和定期回访\n- 提供优质的售后服务\n\n📊 **数据驱动决策**\n- 分析邮件开启率和回复率\n- 跟踪客户的参与度和兴趣度\n- 调整策略以提高效果\n\n注：当前为演示模式，实际使用请配置真实API。'
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: randomResponse,
      timestamp: new Date().toISOString(),
    };

    return {
      message,
      usage: {
        promptTokens: 100,
        completionTokens: 150,
        totalTokens: 250,
      },
    };
  }

  // Mock流式响应
  private async *getMockStreamResponse(request: ChatRequest): AsyncGenerator<any, void, unknown> {
    const response = this.getMockResponse(request);
    const content = response.message.content;
    const words = content.split('');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));
      
      yield {
        delta: {
          content: words[i],
          role: 'assistant',
        },
        done: false,
      };
    }
    
    yield {
      delta: {
        content: '',
        role: 'assistant',
      },
      done: true,
    };
  }
}