import type { ChatRequest, ChatResponse, AgentMessage } from '@trade-assistant/dto';

// API配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// API客户端类
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // 通用请求方法
  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Agent API方法
  async getAgentHealth() {
    return this.request('/api/agent/health');
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/api/agent/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 流式聊天 - 返回 ReadableStream
  async sendStreamMessage(request: ChatRequest): Promise<ReadableStream> {
    const url = this.baseUrl ? `${this.baseUrl}/api/agent/chat/stream` : '/api/agent/chat/stream';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    return response.body;
  }
}

// 创建默认API客户端实例
export const apiClient = new ApiClient();

// 便捷方法
export const sendChatMessage = async (
  messages: AgentMessage[],
  options: {
    useRag?: boolean;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<ChatResponse> => {
  const request: ChatRequest = {
    messages,
    useRag: options.useRag ?? false,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 2000,
  };

  return apiClient.sendMessage(request);
};

// 流式聊天便捷方法
export const sendStreamChatMessage = async (
  messages: AgentMessage[],
  options: {
    useRag?: boolean;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<ReadableStream> => {
  const request: ChatRequest = {
    messages,
    useRag: options.useRag ?? false,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 2000,
  };

  return apiClient.sendStreamMessage(request);
};

// 解析流式响应的工具函数
export async function* parseStreamResponse(stream: ReadableStream): AsyncGenerator<any, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            yield parsed;
          } catch (error) {
            console.warn('Failed to parse stream data:', data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// 错误处理工具
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// AI公司分析相关API
export const analyzeCompany = async (
  companyId: string,
  documentContent: string,
  options: {
    analysisType?: 'full_research' | 'quick_scan' | 'update';
    forceReanalysis?: boolean;
  } = {}
) => {
  return apiClient.request('/api/agent/analyze-company', {
    method: 'POST',
    body: JSON.stringify({
      companyId,
      documentContent,
      analysisType: options.analysisType || 'full_research',
      forceReanalysis: options.forceReanalysis || false,
    }),
  });
};

export const getCompanyAnalysis = async (companyId: string) => {
  return apiClient.request(`/api/agent/company/${companyId}/analysis`);
};

export const generateOutreach = async (
  companyId: string,
  options: {
    language?: string;
    template?: string;
    customization?: string[];
  } = {}
) => {
  return apiClient.request(`/api/agent/company/${companyId}/outreach`, {
    method: 'POST',
    body: JSON.stringify(options),
  });
};

// 健康检查工具
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await apiClient.getAgentHealth();
    return true;
  } catch (error) {
    console.error('API健康检查失败:', error);
    return false;
  }
};