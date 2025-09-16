import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { QwenClient } from '../lib/qwen.js';
import { RAGService } from '../lib/rag.js';
import { CompanyAnalysisService } from '../lib/company-analysis.js';
import type { ChatRequest, AgentMessage, CompanyAnalysisRequest } from '@trade-assistant/dto';

// Zod schemas for request validation
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    id: z.string().optional(),
    timestamp: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  })),
  useRag: z.boolean().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
});

const companyAnalysisRequestSchema = z.object({
  companyId: z.string(),
  documentContent: z.string(),
  analysisType: z.enum(['full_research', 'quick_scan', 'update']).optional(),
  forceReanalysis: z.boolean().optional(),
});

export default async function agentRoutes(fastify: FastifyInstance) {
  const qwenClient = new QwenClient();
  const ragService = new RAGService();
  const analysisService = new CompanyAnalysisService();

  // 健康检查
  fastify.get('/api/agent/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      status: 'healthy',
      service: 'trade-assistant-agent',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  });

  // 普通聊天接口
  fastify.post('/api/agent/chat', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = chatRequestSchema.parse(request.body);
      
      let messages: AgentMessage[] = body.messages.map(msg => ({
        id: msg.id || crypto.randomUUID(),
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
        metadata: msg.metadata,
      }));

      // 如果启用RAG，先进行检索
      if (body.useRag) {
        const userMessage = messages[messages.length - 1];
        if (userMessage.role === 'user') {
          try {
            const ragResults = await ragService.query({
              query: userMessage.content,
              limit: 3,
            });

            if (ragResults.documents.length > 0) {
              const contextMessage: AgentMessage = {
                id: crypto.randomUUID(),
                role: 'system',
                content: `参考以下信息回答用户问题：\n\n${ragResults.documents
                  .map(doc => `${doc.metadata.title || '相关信息'}：${doc.content}`)
                  .join('\n\n')}`,
                timestamp: new Date().toISOString(),
              };
              messages.splice(-1, 0, contextMessage);
            }
          } catch (ragError) {
            console.warn('RAG query failed:', ragError);
            // 继续处理，不因RAG失败而中断对话
          }
        }
      }

      const chatRequest: ChatRequest = {
        messages,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
      };

      const response = await qwenClient.chat(chatRequest);
      return response;
    } catch (error) {
      console.error('Chat error:', error);
      
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          error: 'Invalid request format',
          details: error.errors,
        });
        return;
      }

      reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 流式聊天接口
  fastify.post('/api/agent/chat/stream', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = chatRequestSchema.parse(request.body);
      
      let messages: AgentMessage[] = body.messages.map(msg => ({
        id: msg.id || crypto.randomUUID(),
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
        metadata: msg.metadata,
      }));

      // RAG增强处理（同上）
      if (body.useRag) {
        const userMessage = messages[messages.length - 1];
        if (userMessage.role === 'user') {
          try {
            const ragResults = await ragService.query({
              query: userMessage.content,
              limit: 3,
            });

            if (ragResults.documents.length > 0) {
              const contextMessage: AgentMessage = {
                id: crypto.randomUUID(),
                role: 'system',
                content: `参考以下信息回答用户问题：\n\n${ragResults.documents
                  .map(doc => `${doc.metadata.title || '相关信息'}：${doc.content}`)
                  .join('\n\n')}`,
                timestamp: new Date().toISOString(),
              };
              messages.splice(-1, 0, contextMessage);
            }
          } catch (ragError) {
            console.warn('RAG query failed:', ragError);
          }
        }
      }

      const chatRequest: ChatRequest = {
        messages,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
      };

      // 设置SSE响应头
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');
      reply.raw.setHeader('Access-Control-Allow-Origin', '*');

      // 流式响应
      for await (const chunk of qwenClient.streamChat(chatRequest)) {
        reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      reply.raw.write('data: [DONE]\n\n');
      reply.raw.end();
    } catch (error) {
      console.error('Stream chat error:', error);
      
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          error: 'Invalid request format',
          details: error.errors,
        });
        return;
      }

      reply.status(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 公司AI分析接口
  fastify.post('/api/agent/analyze-company', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = companyAnalysisRequestSchema.parse(request.body);
      
      console.log(`收到公司分析请求: ${body.companyId}`);
      
      const result = await analysisService.analyzeCompany(body);
      
      return result;
    } catch (error) {
      console.error('Company analysis error:', error);
      
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          error: 'Invalid request format',
          details: error.errors,
        });
        return;
      }

      reply.status(500).send({
        error: 'Company analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 获取公司分析结果接口
  fastify.get('/api/agent/company/:companyId/analysis', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { companyId } = request.params as { companyId: string };
      
      // 在实际应用中，这里应该从数据库查询
      // 现在返回Mock数据进行演示
      console.log(`获取公司分析结果: ${companyId}`);
      
      const mockAnalysis = analysisService.generateMockAnalysis(companyId);
      
      return {
        success: true,
        analysis: mockAnalysis,
      };
    } catch (error) {
      console.error('Get analysis error:', error);
      
      reply.status(500).send({
        error: 'Failed to get analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 生成外联话术接口
  fastify.post('/api/agent/company/:companyId/outreach', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { companyId } = request.params as { companyId: string };
      const { language, template, customization } = request.body as { 
        language?: string; 
        template?: string; 
        customization?: string[];
      };
      
      console.log(`生成外联话术: ${companyId}, 语言: ${language || 'auto'}`);
      
      // 模拟生成个性化外联话术
      const mockOutreach = {
        language: language || 'English',
        subject: 'Partnership Opportunity - Your Business Growth',
        content: `Dear Partner,

I hope this message finds you well. I've been following your company's impressive work in the industry and believe there could be valuable synergies between our organizations.

${customization?.includes('technical_focus') ? 'Given your technical expertise, ' : ''}We specialize in helping businesses like yours expand their market reach through strategic partnerships and innovative solutions.

Would you be open to a brief 15-minute conversation to explore potential collaboration opportunities?

Looking forward to hearing from you.

Best regards,
[Your Name]`,
        tips: [
          '建议在当地工作时间发送',
          '可以在LinkedIn上先建立连接',
          '提及具体的合作价值点',
        ],
      };
      
      return {
        success: true,
        outreach: mockOutreach,
      };
    } catch (error) {
      console.error('Generate outreach error:', error);
      
      reply.status(500).send({
        error: 'Failed to generate outreach',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}