import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import agentRoutes from './routes/agent.js';
import crawlerRoutes from './routes/crawler.js';

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
      origin: process.env.NODE_ENV === 'production' 
        ? [/localhost:3000/, /127\.0\.0\.1:3000/] // 生产环境限制域名
        : true, // 开发环境允许所有来源
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // 注册路由
    await fastify.register(agentRoutes);
    await fastify.register(crawlerRoutes);

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
    console.log(`📝 API Key Status: ${process.env.DASHSCOPE_API_KEY ? 'Configured ✅' : 'Missing ❌'}\n`);

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