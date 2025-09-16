/**
 * AI驱动的公司分析服务
 * 使用Qwen模型分析爬取的公司数据并生成个性化开发信
 */

import crypto from 'crypto';
import { QwenClient } from './qwen.js';
import { CompanyCrawlResult } from './crawler.js';

export interface CompanyAnalysis {
  companyId: string;
  companyName: string;
  website: string;
  
  // 5维度分析评分
  dimensions: {
    marketPotential: {
      score: number;
      reasons: string[];
      description: string;
    };
    businessMatching: {
      score: number;
      reasons: string[];
      description: string;
    };
    contactability: {
      score: number;
      reasons: string[];
      description: string;
    };
    competitiveAdvantage: {
      score: number;
      reasons: string[];
      description: string;
    };
    urgencyLevel: {
      score: number;
      reasons: string[];
      description: string;
    };
  };
  
  // 综合分析
  overallScore: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  
  // 个性化策略
  outreachStrategy: {
    primaryApproach: string;
    keySellingPoints: string[];
    painPointsToAddress: string[];
    suggestedTiming: string;
  };
  
  // 生成的开发信
  outreachMessages: {
    email: {
      subject: string;
      content: string;
    };
    linkedin: {
      subject: string;
      content: string;
    };
  };
  
  analyzedAt: string;
}

export interface AnalysisConfig {
  businessContext: {
    companyName: string;
    industry: string;
    services: string[];
    targetMarkets: string[];
    uniqueValueProposition: string;
  };
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  language: 'zh' | 'en';
}

export class AIAnalyzerService {
  private qwenClient: QwenClient;

  constructor() {
    this.qwenClient = new QwenClient();
  }

  /**
   * 分析单个公司
   */
  async analyzeCompany(
    crawlResult: CompanyCrawlResult, 
    config: AnalysisConfig
  ): Promise<CompanyAnalysis> {
    try {
      console.log(`开始AI分析公司: ${crawlResult.companyName}`);

      // 构建分析prompt
      const analysisPrompt = this.buildAnalysisPrompt(crawlResult, config);
      
      // 调用Qwen进行分析
      const analysisResponse = await this.qwenClient.chat({
        messages: [
          {
            id: crypto.randomUUID(),
            role: 'system',
            content: this.getSystemPrompt(config),
            timestamp: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            role: 'user',
            content: analysisPrompt,
            timestamp: new Date().toISOString(),
          },
        ],
      });

      // 解析AI响应
      const analysis = this.parseAnalysisResponse(crawlResult, analysisResponse.message.content, config);
      
      console.log(`公司分析完成: ${analysis.companyName}, 评分: ${analysis.overallScore}`);
      
      return analysis;
    } catch (error) {
      console.error(`公司分析失败: ${crawlResult.companyName}`, error);
      
      // 返回基础分析结果
      return this.generateFallbackAnalysis(crawlResult, config);
    }
  }

  /**
   * 批量分析公司
   */
  async batchAnalyzeCompanies(
    crawlResults: CompanyCrawlResult[],
    config: AnalysisConfig
  ): Promise<CompanyAnalysis[]> {
    console.log(`开始批量分析 ${crawlResults.length} 个公司`);
    
    const analyses: CompanyAnalysis[] = [];
    
    for (const crawlResult of crawlResults) {
      try {
        const analysis = await this.analyzeCompany(crawlResult, config);
        analyses.push(analysis);
        
        // 添加延迟避免API限流
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`分析失败: ${crawlResult.companyName}`, error);
        // 继续处理下一个
      }
    }

    // 按优先级排序
    analyses.sort((a, b) => b.overallScore - a.overallScore);
    
    return analyses;
  }

  /**
   * 构建分析prompt
   */
  private buildAnalysisPrompt(crawlResult: CompanyCrawlResult, config: AnalysisConfig): string {
    const { businessContext, language } = config;
    
    const companyInfo = `
公司基本信息:
- 公司名称: ${crawlResult.companyName}
- 网站: ${crawlResult.website}
- 行业: ${crawlResult.businessInfo.industry || '未知'}
- 公司描述: ${crawlResult.description}
- 成立年份: ${crawlResult.businessInfo.foundedYear || '未知'}
- 员工规模: ${crawlResult.businessInfo.employees || '未知'}

联系信息:
- 邮箱: ${crawlResult.contactEmails.join(', ') || '无'}
- 电话: ${crawlResult.phones.join(', ') || '无'}
- 地址: ${crawlResult.addresses.join(', ') || '无'}
- 社交媒体: ${JSON.stringify(crawlResult.socialMedia, null, 2)}

网站质量评分:
- 整体评分: ${crawlResult.score.overall}/100
- 相关性: ${crawlResult.score.relevance}/100
- 可信度: ${crawlResult.score.credibility}/100
- 联系方式: ${crawlResult.score.contact}/100
- 内容质量: ${crawlResult.score.content}/100
`;

    if (language === 'zh') {
      return `
请基于以下信息，对这家公司进行深度商业分析：

${companyInfo}

我方公司信息:
- 公司名称: ${businessContext.companyName}
- 行业: ${businessContext.industry}
- 主要服务: ${businessContext.services.join(', ')}
- 目标市场: ${businessContext.targetMarkets.join(', ')}
- 独特价值主张: ${businessContext.uniqueValueProposition}

请按以下5个维度进行详细分析，每个维度给出1-100分的评分：

1. 市场潜力 (Market Potential)
2. 业务匹配度 (Business Matching)  
3. 可联系性 (Contactability)
4. 竞争优势 (Competitive Advantage)
5. 紧急程度 (Urgency Level)

同时生成个性化的中英文开发信内容。
`;
    } else {
      return `
Please conduct a comprehensive business analysis based on the following information:

${companyInfo}

Our Company Information:
- Company Name: ${businessContext.companyName}
- Industry: ${businessContext.industry}
- Services: ${businessContext.services.join(', ')}
- Target Markets: ${businessContext.targetMarkets.join(', ')}
- Unique Value Proposition: ${businessContext.uniqueValueProposition}

Please analyze the following 5 dimensions with scores from 1-100:

1. Market Potential
2. Business Matching
3. Contactability
4. Competitive Advantage
5. Urgency Level

Also generate personalized outreach messages in both Chinese and English.
`;
    }
  }

  /**
   * 获取系统prompt
   */
  private getSystemPrompt(config: AnalysisConfig): string {
    if (config.language === 'zh') {
      return `
你是一个专业的B2B销售分析师，擅长分析潜在客户并制定精准的商业开发策略。

请严格按照以下JSON格式输出分析结果：

{
  "dimensions": {
    "marketPotential": {
      "score": 85,
      "reasons": ["具体原因1", "具体原因2"],
      "description": "详细分析描述"
    },
    "businessMatching": {
      "score": 75,
      "reasons": ["具体原因1", "具体原因2"],  
      "description": "详细分析描述"
    },
    "contactability": {
      "score": 90,
      "reasons": ["具体原因1", "具体原因2"],
      "description": "详细分析描述"
    },
    "competitiveAdvantage": {
      "score": 80,
      "reasons": ["具体原因1", "具体原因2"],
      "description": "详细分析描述"
    },
    "urgencyLevel": {
      "score": 70,
      "reasons": ["具体原因1", "具体原因2"],
      "description": "详细分析描述"
    }
  },
  "overallScore": 80,
  "priority": "high",
  "recommendation": "综合建议和策略",
  "outreachStrategy": {
    "primaryApproach": "主要接触方式",
    "keySellingPoints": ["卖点1", "卖点2"],
    "painPointsToAddress": ["痛点1", "痛点2"],
    "suggestedTiming": "建议联系时机"
  },
  "outreachMessages": {
    "email": {
      "subject": "邮件主题",
      "content": "邮件正文"
    },
    "linkedin": {
      "subject": "LinkedIn消息主题", 
      "content": "LinkedIn消息内容"
    }
  }
}

请确保输出严格符合JSON格式，便于程序解析。
`;
    } else {
      return `
You are a professional B2B sales analyst specializing in prospect analysis and business development strategies.

Please output the analysis result in the following JSON format:

{
  "dimensions": {
    "marketPotential": {
      "score": 85,
      "reasons": ["Specific reason 1", "Specific reason 2"],
      "description": "Detailed analysis description"
    },
    "businessMatching": {
      "score": 75,
      "reasons": ["Specific reason 1", "Specific reason 2"],
      "description": "Detailed analysis description"
    },
    "contactability": {
      "score": 90,
      "reasons": ["Specific reason 1", "Specific reason 2"],
      "description": "Detailed analysis description"
    },
    "competitiveAdvantage": {
      "score": 80,
      "reasons": ["Specific reason 1", "Specific reason 2"],
      "description": "Detailed analysis description"
    },
    "urgencyLevel": {
      "score": 70,
      "reasons": ["Specific reason 1", "Specific reason 2"],
      "description": "Detailed analysis description"
    }
  },
  "overallScore": 80,
  "priority": "high",
  "recommendation": "Comprehensive recommendations and strategy",
  "outreachStrategy": {
    "primaryApproach": "Primary contact approach",
    "keySellingPoints": ["Selling point 1", "Selling point 2"],
    "painPointsToAddress": ["Pain point 1", "Pain point 2"],
    "suggestedTiming": "Suggested contact timing"
  },
  "outreachMessages": {
    "email": {
      "subject": "Email subject",
      "content": "Email body"
    },
    "linkedin": {
      "subject": "LinkedIn message subject",
      "content": "LinkedIn message content"
    }
  }
}

Please ensure the output strictly follows JSON format for easy parsing.
`;
    }
  }

  /**
   * 解析AI分析响应
   */
  private parseAnalysisResponse(
    crawlResult: CompanyCrawlResult,
    response: string,
    config: AnalysisConfig
  ): CompanyAnalysis {
    try {
      // 尝试提取JSON内容
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法找到JSON格式的分析结果');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      return {
        companyId: `${crawlResult.website}-${Date.now()}`,
        companyName: crawlResult.companyName,
        website: crawlResult.website,
        dimensions: analysisData.dimensions,
        overallScore: analysisData.overallScore,
        priority: analysisData.priority,
        recommendation: analysisData.recommendation,
        outreachStrategy: analysisData.outreachStrategy,
        outreachMessages: analysisData.outreachMessages,
        analyzedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('解析AI分析响应失败:', error);
      return this.generateFallbackAnalysis(crawlResult, config);
    }
  }

  /**
   * 生成备用分析结果
   */
  private generateFallbackAnalysis(
    crawlResult: CompanyCrawlResult,
    config: AnalysisConfig
  ): CompanyAnalysis {
    const baseScore = Math.max(crawlResult.score.overall, 30);
    
    return {
      companyId: `${crawlResult.website}-${Date.now()}`,
      companyName: crawlResult.companyName,
      website: crawlResult.website,
      dimensions: {
        marketPotential: {
          score: baseScore,
          reasons: ['基于网站质量评估'],
          description: '需要进一步分析市场潜力',
        },
        businessMatching: {
          score: baseScore - 10,
          reasons: ['需要更多业务信息'],
          description: '需要进一步分析业务匹配度',
        },
        contactability: {
          score: crawlResult.score.contact,
          reasons: crawlResult.contactEmails.length > 0 ? ['找到联系邮箱'] : ['缺少直接联系方式'],
          description: `联系方式可用性: ${crawlResult.contactEmails.length}个邮箱, ${crawlResult.phones.length}个电话`,
        },
        competitiveAdvantage: {
          score: baseScore - 5,
          reasons: ['需要详细分析'],
          description: '需要进一步评估竞争优势',
        },
        urgencyLevel: {
          score: 50,
          reasons: ['标准评估'],
          description: '建议适时跟进',
        },
      },
      overallScore: baseScore,
      priority: baseScore >= 70 ? 'high' : baseScore >= 50 ? 'medium' : 'low',
      recommendation: `基础分析完成，建议进行深度调研。网站质量评分: ${crawlResult.score.overall}/100`,
      outreachStrategy: {
        primaryApproach: crawlResult.contactEmails.length > 0 ? '邮件联系' : '社交媒体或电话',
        keySellingPoints: ['专业服务', '行业经验', '定制解决方案'],
        painPointsToAddress: ['效率提升', '成本优化', '业务增长'],
        suggestedTiming: '工作日上午或下午',
      },
      outreachMessages: {
        email: {
          subject: `关于${config.businessContext.services[0]}服务的合作机会`,
          content: `尊敬的${crawlResult.companyName}团队，

我是${config.businessContext.companyName}的业务代表，专注于为${crawlResult.businessInfo.industry || '贵行业'}企业提供${config.businessContext.services.join('、')}服务。

我们注意到贵公司在业务发展方面的优秀表现，相信我们的专业服务能够为您带来额外的价值。

期待与您进一步交流合作可能性。

此致
敬礼`,
        },
        linkedin: {
          subject: '潜在合作机会',
          content: `您好！我是${config.businessContext.companyName}的业务代表，看到您公司在${crawlResult.businessInfo.industry || '相关领域'}的发展，希望能探讨潜在的合作机会。`,
        },
      },
      analyzedAt: new Date().toISOString(),
    };
  }
}