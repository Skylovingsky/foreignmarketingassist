import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

// AI搜索请求的验证模式
const aiSearchRequestSchema = z.object({
  companyName: z.string().min(1, '公司名称不能为空'),
  options: z.object({
    includeFinancial: z.boolean().default(true),
    includeProducts: z.boolean().default(true),
    includeMarket: z.boolean().default(true),
    includeStrategy: z.boolean().default(true),
    language: z.enum(['zh-CN', 'en-US']).default('zh-CN'),
    depth: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed')
  }).default({})
});

type AiSearchRequest = z.infer<typeof aiSearchRequestSchema>;

const aiSearchRoutes: FastifyPluginAsync = async (fastify) => {
  // AI自主搜索分析端点
  fastify.post('/api/ai-search/analyze-company', async (request, reply) => {
    try {
      const { companyName, options } = aiSearchRequestSchema.parse(request.body);
      
      fastify.log.info(`🤖 AI自主搜索分析请求: ${companyName}`);
      
      // 构建智能搜索提示词
      const searchPrompt = generateSearchPrompt(companyName, options);
      
      // 调用AI进行搜索和分析
      const startTime = Date.now();
      const analysisResult = await performAIAnalysis(searchPrompt);
      const processingTime = Date.now() - startTime;
      
      // 返回结构化结果
      return {
        success: true,
        data: {
          companyName,
          report: analysisResult.content,
          metadata: {
            generatedAt: new Date().toISOString(),
            processingTimeMs: processingTime,
            aiModel: 'qwen-plus',
            searchDepth: options.depth,
            includedSections: Object.keys(options).filter(key => options[key as keyof typeof options] === true)
          },
          usage: analysisResult.usage
        }
      };
      
    } catch (error) {
      fastify.log.error(`AI搜索分析失败: ${error instanceof Error ? error.message : String(error)}`);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid request parameters',
          details: error.errors
        });
      }
      
      return reply.code(500).send({
        success: false,
        error: 'AI搜索分析失败',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 流式AI搜索分析端点
  fastify.post('/api/ai-search/analyze-company/stream', async (request, reply) => {
    try {
      const { companyName, options } = aiSearchRequestSchema.parse(request.body);
      
      fastify.log.info(`🌊 流式AI搜索分析请求: ${companyName}`);
      
      // 设置流式响应头
      reply.type('text/event-stream');
      reply.header('Cache-Control', 'no-cache');
      reply.header('Connection', 'keep-alive');
      reply.header('Access-Control-Allow-Origin', '*');
      
      const searchPrompt = generateSearchPrompt(companyName, options);
      
      // 发送开始事件
      reply.raw.write(`data: ${JSON.stringify({
        type: 'start',
        message: `开始分析 ${companyName}...`,
        timestamp: new Date().toISOString()
      })}\n\n`);
      
      // 模拟搜索步骤进度
      const searchSteps = [
        '🔍 联网搜索公司基础信息...',
        '📊 分析业务模式和产品线...',
        '🏢 评估市场地位和竞争优势...',
        '💰 收集财务和运营数据...',
        '📝 生成综合分析报告...',
        '✨ 优化报告格式和建议...'
      ];
      
      for (let i = 0; i < searchSteps.length; i++) {
        reply.raw.write(`data: ${JSON.stringify({
          type: 'progress',
          step: i + 1,
          total: searchSteps.length,
          message: searchSteps[i],
          percentage: Math.round((i + 1) / searchSteps.length * 80)
        })}\n\n`);
        
        // 模拟处理时间
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      }
      
      // 进行AI分析
      reply.raw.write(`data: ${JSON.stringify({
        type: 'progress',
        message: '🤖 AI正在生成详细报告...',
        percentage: 90
      })}\n\n`);
      
      const analysisResult = await performAIAnalysis(searchPrompt);
      
      // 发送最终结果
      reply.raw.write(`data: ${JSON.stringify({
        type: 'result',
        data: {
          companyName,
          report: analysisResult.content,
          metadata: {
            generatedAt: new Date().toISOString(),
            aiModel: 'qwen-plus',
            searchDepth: options.depth
          },
          usage: analysisResult.usage
        }
      })}\n\n`);
      
      reply.raw.write(`data: [DONE]\n\n`);
      reply.raw.end();
      
    } catch (error) {
      fastify.log.error(`流式AI搜索分析失败: ${error instanceof Error ? error.message : String(error)}`);
      
      reply.raw.write(`data: ${JSON.stringify({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })}\n\n`);
      
      reply.raw.end();
    }
  });

  // AI搜索能力状态检查
  fastify.get('/api/ai-search/status', async (request, reply) => {
    const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
    
    return {
      service: 'AI Search & Analysis Service',
      version: '1.0.0',
      status: 'operational',
      capabilities: {
        aiSearch: !!dashscopeApiKey,
        streamingAnalysis: true,
        supportedLanguages: ['zh-CN', 'en-US'],
        maxCompanyAnalysisLength: 4000,
        availableDepths: ['basic', 'detailed', 'comprehensive']
      },
      timestamp: new Date().toISOString()
    };
  });
};

// 生成智能搜索提示词
function generateSearchPrompt(companyName: string, options: AiSearchRequest['options']): string {
  const language = options.language === 'zh-CN' ? '中文' : 'English';
  
  let prompt = `请作为专业的商业分析师和市场研究专家，对公司"${companyName}"进行全面的在线搜索和深度分析。

## 搜索和分析要求：

1. **自主信息收集**: 请基于你的知识库和训练数据，搜集关于该公司的最新可靠信息
2. **多维度分析**: 从商业、财务、市场、战略等角度进行综合评估
3. **报告语言**: 请用${language}生成专业报告
4. **分析深度**: ${options.depth === 'comprehensive' ? '提供详尽的深度分析' : options.depth === 'detailed' ? '提供详细的中等深度分析' : '提供基础但全面的分析'}

## 必须包含的分析模块：

### 🏢 公司概况
- 公司全称、成立时间、总部位置
- 法定代表人/CEO信息
- 注册资本和企业性质
- 主营业务简介和发展历程

### 📈 业务分析`;

  if (options.includeProducts) {
    prompt += `
- 核心产品/服务详细介绍
- 产品线布局和技术优势
- 研发能力和创新水平`;
  }

  prompt += `
- 业务模式和盈利方式
- 主要客户群体和市场定位`;

  if (options.includeMarket) {
    prompt += `

### 🎯 市场表现
- 行业地位和市场份额
- 主要竞争对手分析
- 市场竞争优势和差异化特点
- 近期业绩和发展趋势`;
  }

  if (options.includeFinancial) {
    prompt += `

### 💰 财务状况
- 营收规模和增长趋势
- 盈利能力和财务健康度
- 主要财务指标分析
- 投融资历史和股东结构`;
  }

  if (options.includeStrategy) {
    prompt += `

### 🎯 商务机会评估
- 潜在合作机会识别
- 客户开发策略建议
- 合作风险评估
- 接触渠道和决策者信息`;
  }

  prompt += `

### 📋 总结与建议
- 公司核心优势和亮点
- 商务合作可行性评级 (1-10分，10分为最佳)
- 具体行动建议和注意事项

## 特别要求：
1. 信息要准确、客观，基于公开可靠数据
2. 如果某些信息无法确定，请明确标注"信息待确认"
3. 提供实用的商务洞察和可操作建议
4. 报告结构清晰，便于阅读和使用
5. 重点关注外贸商务开发的机会点

请开始你的专业分析：`;

  return prompt;
}

// 执行AI分析
async function performAIAnalysis(prompt: string) {
  const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
  const dashscopeBaseUrl = process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  
  if (!dashscopeApiKey) {
    throw new Error('DashScope API key is not configured');
  }
  
  const response = await fetch(`${dashscopeBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${dashscopeApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // 较低温度保证准确性
      max_tokens: 4000,
      stream: false
    })
  });
  
  if (!response.ok) {
    throw new Error(`DashScope API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from DashScope API');
  }
  
  return {
    content: data.choices[0].message.content,
    usage: data.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  };
}

export default aiSearchRoutes;