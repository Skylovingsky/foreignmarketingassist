import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AIAnalyzerService, AnalysisConfig } from '../lib/ai-analyzer.js';
import { WebCrawlerService, CompanySearchQuery } from '../lib/crawler.js';

// 请求验证schemas
const businessContextSchema = z.object({
  companyName: z.string().min(1, '请提供公司名称'),
  industry: z.string().min(1, '请提供行业信息'),
  services: z.array(z.string()).min(1, '至少提供一个服务项目'),
  targetMarkets: z.array(z.string()).min(1, '至少提供一个目标市场'),
  uniqueValueProposition: z.string().min(1, '请提供独特价值主张'),
});

const analyzeUrlSchema = z.object({
  url: z.string().url('请提供有效的网站URL'),
  businessContext: businessContextSchema,
  analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']).optional().default('detailed'),
  language: z.enum(['zh', 'en']).optional().default('zh'),
});

const analyzeUrlsSchema = z.object({
  urls: z.array(z.string().url()).min(1, '至少提供一个URL').max(5, '最多同时分析5个网站'),
  businessContext: businessContextSchema,
  analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']).optional().default('detailed'),
  language: z.enum(['zh', 'en']).optional().default('zh'),
});

const searchAndAnalyzeSchema = z.object({
  keywords: z.array(z.string()).min(1, '至少提供一个关键词').max(5, '最多5个关键词'),
  industry: z.string().optional(),
  location: z.string().optional(),
  size: z.string().optional(),
  maxResults: z.number().min(1).max(10).optional().default(5),
  businessContext: businessContextSchema,
  analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']).optional().default('detailed'),
  language: z.enum(['zh', 'en']).optional().default('zh'),
});

export default async function aiAnalysisRoutes(fastify: FastifyInstance) {
  const aiAnalyzer = new AIAnalyzerService();
  const crawler = new WebCrawlerService();

  // 分析单个网站
  fastify.post('/api/ai-analysis/analyze-url', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = analyzeUrlSchema.parse(request.body);
      
      console.log(`收到AI分析请求: ${params.url}`);
      
      // 1. 爬取网站数据
      const crawlResult = await crawler.crawlCompanyWebsite(params.url);
      
      if (crawlResult.error) {
        return reply.status(400).send({
          error: '网站爬取失败',
          message: crawlResult.error,
        });
      }
      
      // 2. AI分析
      const config: AnalysisConfig = {
        businessContext: params.businessContext,
        analysisDepth: params.analysisDepth,
        language: params.language,
      };
      
      const analysis = await aiAnalyzer.analyzeCompany(crawlResult, config);
      
      return {
        success: true,
        data: {
          crawlResult,
          analysis,
        },
        meta: {
          crawlScore: crawlResult.score.overall,
          aiScore: analysis.overallScore,
          priority: analysis.priority,
          recommendation: analysis.recommendation,
        },
      };
    } catch (error) {
      console.error('AI分析错误:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: '请求格式错误',
          details: error.errors,
        });
      }

      return reply.status(500).send({
        error: 'AI分析失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 批量分析网站
  fastify.post('/api/ai-analysis/analyze-urls', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = analyzeUrlsSchema.parse(request.body);
      
      console.log(`收到批量AI分析请求: ${params.urls.length} 个网站`);
      
      // 1. 批量爬取网站
      const crawlResults = await crawler.batchCrawlWebsites(params.urls);
      
      // 2. 过滤掉爬取失败的网站
      const validCrawlResults = crawlResults.filter(result => !result.error);
      
      if (validCrawlResults.length === 0) {
        return reply.status(400).send({
          error: '所有网站爬取失败',
          message: '请检查URL是否有效',
        });
      }
      
      // 3. 批量AI分析
      const config: AnalysisConfig = {
        businessContext: params.businessContext,
        analysisDepth: params.analysisDepth,
        language: params.language,
      };
      
      const analyses = await aiAnalyzer.batchAnalyzeCompanies(validCrawlResults, config);
      
      // 4. 生成汇总报告
      const summary = {
        totalUrls: params.urls.length,
        successfulCrawls: validCrawlResults.length,
        failedCrawls: crawlResults.length - validCrawlResults.length,
        successfulAnalyses: analyses.length,
        highPriority: analyses.filter(a => a.priority === 'high').length,
        mediumPriority: analyses.filter(a => a.priority === 'medium').length,
        lowPriority: analyses.filter(a => a.priority === 'low').length,
        averageScore: analyses.length > 0 ? 
          Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length) : 0,
        topCompany: analyses[0]?.companyName || null,
        topScore: analyses[0]?.overallScore || 0,
      };
      
      return {
        success: true,
        summary,
        data: {
          crawlResults,
          analyses,
        },
        recommendations: {
          immediate: analyses.filter(a => a.priority === 'high'),
          followUp: analyses.filter(a => a.priority === 'medium'),
          research: analyses.filter(a => a.priority === 'low'),
        },
      };
    } catch (error) {
      console.error('批量AI分析错误:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: '请求格式错误',
          details: error.errors,
        });
      }

      return reply.status(500).send({
        error: '批量AI分析失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 智能搜索并分析 - 核心功能
  fastify.post('/api/ai-analysis/search-and-analyze', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = searchAndAnalyzeSchema.parse(request.body);
      
      console.log(`收到智能搜索分析请求:`, params);
      
      // 1. 构建搜索查询
      const searchQuery: CompanySearchQuery = {
        keywords: params.keywords,
        industry: params.industry,
        location: params.location,
        size: params.size,
        maxResults: params.maxResults,
      };
      
      // 2. 搜索并爬取公司网站
      const crawlResults = await crawler.searchAndCrawlCompanies(searchQuery);
      
      if (crawlResults.length === 0) {
        return reply.status(404).send({
          error: '未找到匹配的公司',
          message: '请尝试调整搜索关键词',
        });
      }
      
      // 3. 过滤高质量网站进行AI分析
      const highQualityCrawls = crawlResults.filter(result => 
        !result.error && result.score.overall >= 40
      );
      
      if (highQualityCrawls.length === 0) {
        return reply.status(404).send({
          error: '未找到高质量目标公司',
          message: '搜索到的公司网站质量较低，建议调整搜索策略',
        });
      }
      
      // 4. AI深度分析
      const config: AnalysisConfig = {
        businessContext: params.businessContext,
        analysisDepth: params.analysisDepth,
        language: params.language,
      };
      
      const analyses = await aiAnalyzer.batchAnalyzeCompanies(highQualityCrawls, config);
      
      // 5. 生成综合报告
      const report = {
        searchQuery,
        searchResults: {
          totalFound: crawlResults.length,
          highQuality: highQualityCrawls.length,
          analyzed: analyses.length,
        },
        qualityDistribution: {
          high: analyses.filter(a => a.overallScore >= 80).length,
          medium: analyses.filter(a => a.overallScore >= 60 && a.overallScore < 80).length,
          low: analyses.filter(a => a.overallScore < 60).length,
        },
        topOpportunities: analyses.slice(0, 3),
        averageScore: analyses.length > 0 ? 
          Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length) : 0,
      };
      
      return {
        success: true,
        report,
        data: {
          searchQuery,
          crawlResults,
          analyses,
        },
        actionPlan: {
          highPriority: {
            companies: analyses.filter(a => a.priority === 'high'),
            action: '立即联系，优先级最高',
            timeline: '24小时内',
          },
          mediumPriority: {
            companies: analyses.filter(a => a.priority === 'medium'),
            action: '安排跟进，制定详细策略',
            timeline: '3-5个工作日内',
          },
          lowPriority: {
            companies: analyses.filter(a => a.priority === 'low'),
            action: '长期关注，定期更新信息',
            timeline: '1-2周内',
          },
        },
      };
    } catch (error) {
      console.error('智能搜索分析错误:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: '请求格式错误',
          details: error.errors,
        });
      }

      return reply.status(500).send({
        error: '智能搜索分析失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 生成个性化开发信
  fastify.post('/api/ai-analysis/generate-outreach', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const schema = z.object({
        companyName: z.string(),
        companyInfo: z.string(),
        businessContext: businessContextSchema,
        messageType: z.enum(['email', 'linkedin', 'both']).default('both'),
        language: z.enum(['zh', 'en']).default('zh'),
      });
      
      const params = schema.parse(request.body);
      
      // 使用AI服务生成个性化消息
      // 这里可以调用专门的消息生成逻辑
      
      return {
        success: true,
        message: '个性化开发信生成功能开发中',
        data: {
          companyName: params.companyName,
          messageType: params.messageType,
          language: params.language,
        },
      };
    } catch (error) {
      console.error('生成开发信错误:', error);
      
      return reply.status(500).send({
        error: '生成开发信失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // AI分析服务状态
  fastify.get('/api/ai-analysis/status', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const hasQwenConfig = !!process.env.DASHSCOPE_API_KEY;
      const hasGoogleConfig = !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID);
      
      return {
        success: true,
        status: 'ready',
        features: {
          websiteAnalysis: hasQwenConfig,
          batchAnalysis: hasQwenConfig,
          intelligentSearch: hasQwenConfig && hasGoogleConfig,
          outreachGeneration: hasQwenConfig,
          multiLanguage: true,
        },
        config: {
          qwenConfigured: hasQwenConfig,
          googleConfigured: hasGoogleConfig,
          supportedLanguages: ['zh', 'en'],
          analysisDepths: ['basic', 'detailed', 'comprehensive'],
        },
        capabilities: [
          '5维度公司分析评分',
          '个性化开发策略生成',
          '中英文开发信自动生成',
          '批量智能分析处理',
          '质量评分和优先级排序',
        ],
        message: hasQwenConfig ? 
          'AI分析服务已完全就绪' : 
          'AI分析服务需要配置Qwen API密钥',
      };
    } catch (error) {
      return reply.status(500).send({
        error: '状态检查失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}