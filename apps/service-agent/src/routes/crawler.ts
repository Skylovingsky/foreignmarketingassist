import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { WebCrawlerService } from '../lib/crawler.js';

// 请求验证schemas
const crawlSingleSchema = z.object({
  url: z.string().url('请提供有效的网站URL'),
});

const crawlBatchSchema = z.object({
  urls: z.array(z.string().url()).min(1, '至少提供一个URL').max(10, '最多同时爬取10个网站'),
});

export default async function crawlerRoutes(fastify: FastifyInstance) {
  const crawlerService = new WebCrawlerService();

  // 单个网站爬取接口
  fastify.post('/api/crawler/single', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { url } = crawlSingleSchema.parse(request.body);
      
      console.log(`收到单个网站爬取请求: ${url}`);
      
      const result = await crawlerService.crawlCompanyWebsite(url);
      
      return {
        success: true,
        data: result,
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
      
      return {
        success: true,
        total: results.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        data: results,
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

  // 爬虫状态检查接口
  fastify.get('/api/crawler/status', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      success: true,
      status: 'ready',
      config: {
        maxConcurrent: 10,
        timeout: 30000,
        userAgent: 'Trade-Assistant-Crawler/1.0',
      },
      message: '爬虫服务已就绪，等待集成具体实现',
    };
  });
}