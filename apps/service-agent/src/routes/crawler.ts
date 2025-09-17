import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { WebCrawlerService, CompanySearchQuery } from '../lib/crawler.js';

// 请求验证schemas
const crawlSingleSchema = z.object({
  url: z.string().url('请提供有效的网站URL'),
});

const crawlBatchSchema = z.object({
  urls: z.array(z.string().url()).min(1, '至少提供一个URL').max(10, '最多同时爬取10个网站'),
});

const searchCompaniesSchema = z.object({
  keywords: z.array(z.string()).min(1, '至少提供一个关键词').max(5, '最多5个关键词'),
  industry: z.string().optional(),
  location: z.string().optional(),
  size: z.string().optional(),
  maxResults: z.number().min(1).max(10).optional(),
});

export default async function crawlerRoutes(fastify: FastifyInstance) {
  const crawlerService = new WebCrawlerService({
    googleApiKey: process.env.GOOGLE_API_KEY,
    googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
  });

  // 智能公司搜索和爬取接口
  fastify.post('/api/crawler/search', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = searchCompaniesSchema.parse(request.body) as CompanySearchQuery;
      
      console.log(`收到公司搜索请求:`, query);
      
      const results = await crawlerService.searchAndCrawlCompanies(query);
      
      return {
        success: true,
        query,
        total: results.length,
        highQuality: results.filter(r => r.score.overall >= 70).length,
        mediumQuality: results.filter(r => r.score.overall >= 40 && r.score.overall < 70).length,
        lowQuality: results.filter(r => r.score.overall < 40).length,
        data: results,
        summary: {
          averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score.overall, 0) / results.length) : 0,
          topCompany: results[0]?.companyName || null,
          topScore: results[0]?.score.overall || 0,
        },
      };
    } catch (error) {
      console.error('公司搜索错误:', error);
      
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          error: '请求格式错误',
          details: error.errors,
        });
        return;
      }

      reply.status(500).send({
        error: '搜索失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 单个网站爬取接口
  fastify.post('/api/crawler/single', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { url } = crawlSingleSchema.parse(request.body);
      
      console.log(`收到单个网站爬取请求: ${url}`);
      
      const result = await crawlerService.crawlCompanyWebsite(url);
      
      return {
        success: true,
        data: result,
        quality: {
          level: result.score.overall >= 70 ? 'high' : result.score.overall >= 40 ? 'medium' : 'low',
          score: result.score,
          recommendation: result.score.overall >= 70 ? '高质量目标客户' : 
                        result.score.overall >= 40 ? '中等质量潜在客户' : '低质量或信息不完整',
        },
      };
    } catch (error) {
      console.error('单个网站爬取错误:', error);
      
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          error: '请求格式错误',
          details: error.errors,
        });
        return;
      }

      reply.status(500).send({
        error: '爬取失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 批量网站爬取接口
  fastify.post('/api/crawler/batch', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { urls } = crawlBatchSchema.parse(request.body);
      
      console.log(`收到批量网站爬取请求: ${urls.length} 个网站`);
      
      const results = await crawlerService.batchCrawlWebsites(urls);
      
      // 分析结果质量
      const analysis = {
        total: results.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        highQuality: results.filter(r => r.score.overall >= 70).length,
        mediumQuality: results.filter(r => r.score.overall >= 40 && r.score.overall < 70).length,
        lowQuality: results.filter(r => r.score.overall < 40).length,
        averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score.overall, 0) / results.length) : 0,
      };
      
      return {
        success: true,
        analysis,
        data: results,
        recommendations: {
          highPriority: results.filter(r => r.score.overall >= 70),
          mediumPriority: results.filter(r => r.score.overall >= 40 && r.score.overall < 70),
          lowPriority: results.filter(r => r.score.overall < 40 && !r.error),
        },
      };
    } catch (error) {
      console.error('批量网站爬取错误:', error);
      
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          error: '请求格式错误',
          details: error.errors,
        });
        return;
      }

      reply.status(500).send({
        error: '批量爬取失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Google搜索测试接口
  fastify.post('/api/crawler/google-search', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = searchCompaniesSchema.parse(request.body) as CompanySearchQuery;
      
      console.log(`收到Google搜索测试请求:`, query);
      
      const searchResults = await crawlerService.searchCompanies(query);
      
      return {
        success: true,
        query,
        resultsCount: searchResults.length,
        results: searchResults,
      };
    } catch (error) {
      console.error('Google搜索错误:', error);
      
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          error: '请求格式错误',
          details: error.errors,
        });
        return;
      }

      reply.status(500).send({
        error: 'Google搜索失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 爬虫状态检查接口
  fastify.get('/api/crawler/status', async (request: FastifyRequest, reply: FastifyReply) => {
    const hasGoogleConfig = !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID);
    
    return {
      success: true,
      status: 'ready',
      features: {
        websiteCrawling: true,
        batchCrawling: true,
        googleSearch: hasGoogleConfig,
        qualityScoring: true,
        contentExtraction: true,
      },
      config: {
        maxConcurrent: 10,
        timeout: 30000,
        userAgent: 'Trade-Assistant-Crawler/1.0',
        googleApiConfigured: hasGoogleConfig,
      },
      message: hasGoogleConfig ? 
        '爬虫服务已完全就绪，支持Google搜索和网站爬取' : 
        '爬虫服务已就绪，缺少Google API配置，仅支持直接网站爬取',
    };
  });
}