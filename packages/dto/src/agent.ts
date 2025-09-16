// Agent和RAG相关类型定义
export interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    title?: string;
    source?: string;
    url?: string;
    section?: string;
    tags?: string[];
  };
  embedding?: number[];
  score?: number;
}

export interface RAGQuery {
  query: string;
  limit?: number;
  threshold?: number;
  filters?: Record<string, any>;
}

export interface RAGResponse {
  documents: RAGDocument[];
  query: string;
  totalResults: number;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface ToolCall {
  id: string;
  tool: string;
  parameters: Record<string, any>;
  result?: any;
  error?: string;
}

// AI公司分析请求和响应
export interface CompanyAnalysisRequest {
  companyId: string;
  documentContent: string;
  analysisType?: 'full_research' | 'quick_scan' | 'update';
  forceReanalysis?: boolean;
}

export interface CompanyAnalysisResponse {
  analysisId: string;
  status: 'started' | 'completed' | 'failed';
  analysis?: any; // 将使用AICompanyAnalysis类型
  error?: string;
}