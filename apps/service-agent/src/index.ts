import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import agentRoutes from './routes/agent.js';
import crawlerRoutes from './routes/crawler.js';
import aiAnalysisRoutes from './routes/ai-analysis.js';
import customersRoutes from './routes/customers.js';
import aiSearchRoutes from './routes/ai-search.js';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV !== 'production' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true,
      },
    } : undefined,
  },
});

async function start() {
  try {
    // 注册插件
    await fastify.register(helmet, {
      contentSecurityPolicy: false, // 开发环境下禁用CSP
    });
    
    await fastify.register(cors, {
      origin: [
        'http://localhost:3000',
        'https://3000-ibr8pve55krqf22np4xrh-6532622b.e2b.dev',
        /localhost:\d+/,
        /127\.0\.0\.1:\d+/,
        /.*\.e2b\.dev$/
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    // 注册文件上传支持
    await fastify.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    });

    // 注册路由
    await fastify.register(agentRoutes);
    await fastify.register(crawlerRoutes);
    await fastify.register(aiAnalysisRoutes);
    await fastify.register(customersRoutes);
    await fastify.register(aiSearchRoutes);

    // 根路径健康检查
    fastify.get('/', async (request, reply) => {
      return {
        service: 'Foreign Trade Assistant - Agent API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
          health: '/api/agent/health',
          chat: '/api/agent/chat',
          streamChat: '/api/agent/chat/stream',
          crawler: '/api/crawler/status',
          crawlSingle: '/api/crawler/single',
          crawlBatch: '/api/crawler/batch',
          crawlerSearch: '/api/crawler/search',
          aiAnalysis: '/api/ai-analysis/status',
          analyzeUrl: '/api/ai-analysis/analyze-url',
          analyzeBatch: '/api/ai-analysis/analyze-urls',
          searchAndAnalyze: '/api/ai-analysis/search-and-analyze',
          customers: '/api/customers',
          customersUpload: '/api/customers/upload',
          customersStats: '/api/customers/stats',
          aiSearch: '/api/ai-search/status',
          aiSearchAnalyze: '/api/ai-search/analyze-company',
          aiSearchStream: '/api/ai-search/analyze-company/stream',
        },
      };
    });

    // 启动服务器
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    
    console.log(`\n🚀 Agent API Service Started Successfully!`);
    console.log(`📍 Service URL: http://${host}:${port}`);
    console.log(`🏥 Health Check: http://${host}:${port}/api/agent/health`);
    console.log(`💬 Chat API: http://${host}:${port}/api/agent/chat`);
    console.log(`🌊 Stream Chat: http://${host}:${port}/api/agent/chat/stream`);
    console.log(`🕷️  Crawler API: http://${host}:${port}/api/crawler/status`);
    console.log(`🧠 AI Analysis: http://${host}:${port}/api/ai-analysis/status`);
    console.log(`🔍 Smart Search: http://${host}:${port}/api/ai-analysis/search-and-analyze`);
    console.log(`👥 Customers API: http://${host}:${port}/api/customers`);
    console.log(`📤 File Upload: http://${host}:${port}/api/customers/upload`);
    console.log(`📝 API Key Status: ${process.env.DASHSCOPE_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
    console.log(`🌐 Google API Status: ${process.env.GOOGLE_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
    console.log(`🔍 Debug - Google API Key exists: ${!!process.env.GOOGLE_API_KEY}`);
    console.log(`🔍 Debug - Google Search Engine ID exists: ${!!process.env.GOOGLE_SEARCH_ENGINE_ID}\n`);

  } catch (error) {
    console.error('❌ Failed to start Agent API service:', error);
    process.exit(1);
  }
}

// 优雅关闭处理
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Agent API service...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down Agent API service...');
  await fastify.close();
  process.exit(0);
});

// 启动服务
start();