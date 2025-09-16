// 公司和客户相关类型定义
export interface Company {
  id: string;
  name: string;
  domain?: string;
  country?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  website?: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  department?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadScore {
  id: string;
  companyId: string;
  totalScore: number;
  emailQuality: number;
  phoneQuality: number;
  websiteActivity: number;
  companySize: number;
  purchaseIntent: number;
  evidences: Evidence[];
  calculatedAt: string;
}

export interface Evidence {
  id: string;
  type: 'email' | 'phone' | 'website' | 'size' | 'intent';
  description: string;
  score: number;
  source?: string;
  confidence: number;
}

export interface BatchUploadResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

// AI分析相关类型定义
export interface AIAnalysisStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface CompanyContactInfo {
  email: string;
  type: 'personal' | 'company' | 'generic';
  confidence: number;
}

export interface CompanyPhone {
  number: string;
  type: 'main' | 'mobile' | 'fax';
  confidence: number;
}

export interface CompanySocialMedia {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
}

export interface QualityScoreDetail {
  score: number;
  weight: number;
  reasoning: string;
}

export interface QualityScore {
  email_quality: QualityScoreDetail;
  contact_completeness: QualityScoreDetail;
  website_activity: QualityScoreDetail;
  company_size: QualityScoreDetail;
  purchase_intent: QualityScoreDetail;
  final_score: number;
  grade: string;
  priority_level: string;
}

export interface DataQualityIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high';
}

export interface OutreachStrategy {
  recommended_channel: string;
  best_contact_time: string;
  cultural_notes: string;
  personalization_points: string[];
}

export interface OutreachMessage {
  language: string;
  subject: string;
  content: string;
}

export interface FollowUpSuggestion {
  timing: string;
  method: string;
  content: string;
}

export interface AICompanyAnalysis {
  id: string;
  companyId: string;
  status: AIAnalysisStatus;
  
  // 公司基础信息
  companyInfo?: {
    name: string;
    country: string;
    industry: string;
    website: string;
    founded_year?: string;
    employees?: string;
    primary_products: string[];
    contact_emails: CompanyContactInfo[];
    phones: CompanyPhone[];
    social_media: CompanySocialMedia;
  };
  
  // 研究报告
  researchReport?: {
    executive_summary: string;
    business_model: string;
    market_position: string;
    cooperation_potential: string;
    key_decision_makers: string;
    risks_and_opportunities: string;
  };
  
  // 质量评分
  qualityScore?: QualityScore;
  
  // 数据质量问题
  dataQualityIssues?: DataQualityIssue[];
  
  // 外联策略
  outreachStrategy?: OutreachStrategy;
  
  // 外联消息模板
  outreachMessages?: OutreachMessage[];
  
  // 跟进建议
  followUpSuggestions?: FollowUpSuggestion[];
  
  // 元数据
  metadata?: {
    analysis_timestamp: string;
    data_sources: string[];
    confidence_level: number;
    requires_human_review: boolean;
    processing_notes?: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

// 扩展原有的Company接口
export interface CompanyWithAnalysis extends Company {
  aiAnalysis?: AIAnalysisStatus;
  latestAnalysis?: AICompanyAnalysis;
}