// 事件埋点和分析相关类型定义
export interface UserEvent {
  id: string;
  userId?: string;
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: string;
}

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  sessionsCount: number;
  averageSessionDuration: number;
  topEvents: Array<{
    event: string;
    count: number;
  }>;
  conversionRate: number;
}