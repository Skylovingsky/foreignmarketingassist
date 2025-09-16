// 聊天和AI相关类型定义
export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: AgentMessage[];
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRequest {
  messages: AgentMessage[];
  useRag?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  message: AgentMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamChatResponse {
  delta: {
    content?: string;
    role?: string;
  };
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  done?: boolean;
}