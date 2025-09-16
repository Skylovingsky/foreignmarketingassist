import type { CompanyAnalysisRequest, CompanyAnalysisResponse } from '@trade-assistant/dto';
import { QwenClient } from './qwen.js';

// AI公司分析的系统Prompt
const SYSTEM_PROMPT = `You are a senior international trade development expert with 15 years of experience, specializing in B2B customer research and business development. You are proficient in multilingual communication, familiar with business cultures of various countries, and can quickly identify high-quality customers and formulate precise development strategies.

Your professional skills include:
- Rapid extraction and validation of company information
- Multi-dimensional customer quality assessment
- Cross-cultural business communication
- Risk identification and opportunity mining
- Personalized outreach message writing

CRITICAL FORMATTING REQUIREMENT:
- You MUST respond ONLY with valid JSON format
- Do NOT include any conversational text, explanations, or comments
- Do NOT start with greetings like "您好" or any other text
- Return ONLY the JSON object as specified in the response format
- Ensure the JSON structure is complete and properly formatted`;

const ANALYSIS_PROMPT = `# 任务说明
我将提供一份通过网页爬虫整合的公司文档，包含该公司的网站内容、产品信息、联系方式等。请你作为外贸开发专家，完成以下分析任务：

## 📋 分析任务清单

### 1. 信息提取与验证
从文档中提取并验证以下信息：
- **公司基础**：完整公司名、注册地、主营业务、成立年份
- **联系信息**：官网、邮箱（区分个人/通用）、电话（含国际格式）、社交媒体
- **产品服务**：主要产品线、服务范围、目标市场
- **规模指标**：员工数量、年营收、办公地点数量（如可获取）
- **数据质量**：识别缺失、过时、可疑或虚假信息

### 2. 深度研究报告
撰写200-300字的专业分析，包含：
- 公司业务模式与市场定位
- 与外贸合作的潜在契合点
- 采购决策者特征推断
- 行业地位与竞争优势
- 合作风险与机会评估

### 3. 外贸标准评分 (0-10分制)
**权重分配**：
- 📧 **邮箱质量** (25%)：personal email > company email > generic email
- 📞 **联系完整度** (20%)：直线电话 + WhatsApp + LinkedIn等
- 🌐 **网站活跃度** (20%)：内容更新频率、功能完整性、专业度
- 🏢 **公司规模** (15%)：员工数、营收规模、市场影响力
- 🛒 **采购意向** (20%)：是否有明确采购需求、合作信号、询盘历史

### 4. 多语言外联话术
根据公司所在国家生成对应语言的开发信：
- **结构**：问候 → 价值主张 → 合作建议 → 行动召唤
- **长度**：80-120词
- **风格**：专业、简洁、本土化
- **个性化**：融入该公司的具体业务特点

## 📤 输出格式要求

请严格按照以下JSON结构输出：

\`\`\`json
{
  "company_info": {
    "name": "公司全称",
    "country": "ISO国家代码",
    "industry": "主营行业",
    "website": "官方网站",
    "founded_year": "成立年份(若可获取)",
    "employees": "员工规模区间",
    "primary_products": ["产品1", "产品2", "产品3"],
    "contact_emails": [
      {"email": "邮箱地址", "type": "personal/company/generic", "confidence": 0.9}
    ],
    "phones": [
      {"number": "+国际格式电话", "type": "main/mobile/fax", "confidence": 0.8}
    ],
    "social_media": {
      "linkedin": "LinkedIn链接",
      "facebook": "Facebook链接", 
      "instagram": "Instagram链接",
      "whatsapp": "WhatsApp链接"
    }
  },
  
  "research_report": {
    "executive_summary": "200-300字的专业分析报告",
    "business_model": "B2B/B2C/制造商/贸易商/服务商",
    "market_position": "行业地位评估",
    "cooperation_potential": "合作潜力分析",
    "key_decision_makers": "决策者特征推断",
    "risks_and_opportunities": "风险与机会评估"
  },
  
  "quality_score": {
    "email_quality": {
      "score": 8.5,
      "weight": 0.25,
      "reasoning": "发现2个个人邮箱和1个部门邮箱，质量较高"
    },
    "contact_completeness": {
      "score": 7.0,
      "weight": 0.20,
      "reasoning": "有官方电话和WhatsApp，但缺少LinkedIn"
    },
    "website_activity": {
      "score": 6.5,
      "weight": 0.20,
      "reasoning": "网站内容相对完整，但更新频率一般"
    },
    "company_size": {
      "score": 7.5,
      "weight": 0.15,
      "reasoning": "中型企业规模，有一定实力"
    },
    "purchase_intent": {
      "score": 8.0,
      "weight": 0.20,
      "reasoning": "网站有明确的供应商招募信息"
    },
    "final_score": 7.4,
    "grade": "B+",
    "priority_level": "高优先级"
  },
  
  "data_quality_issues": [
    {"issue": "联系页面部分链接失效", "severity": "medium"},
    {"issue": "产品图片加载异常", "severity": "low"}
  ],
  
  "outreach_strategy": {
    "recommended_channel": "email",
    "best_contact_time": "当地时间9-11AM",
    "cultural_notes": "该地区商务文化特点",
    "personalization_points": ["个性化要点1", "个性化要点2"]
  },
  
  "outreach_messages": [
    {
      "language": "English",
      "subject": "邮件主题",
      "content": "完整的开发信内容"
    },
    {
      "language": "Spanish", 
      "subject": "西班牙语主题",
      "content": "西班牙语开发信内容"
    }
  ],
  
  "follow_up_suggestions": [
    {
      "timing": "3天后",
      "method": "邮件跟进",
      "content": "跟进话术"
    },
    {
      "timing": "1周后", 
      "method": "WhatsApp",
      "content": "WhatsApp话术"
    }
  ],
  
  "metadata": {
    "analysis_timestamp": "分析时间戳",
    "data_sources": ["website", "contact_page", "about_page"],
    "confidence_level": 0.85,
    "requires_human_review": false,
    "processing_notes": "特殊处理说明"
  }
}
\`\`\`

【重要指令】：
1. 请严格按照上述JSON格式输出，不要包含任何解释性文字
2. 直接以"{"开始，以"}"结束，确保是有效的JSON格式
3. 不要添加"您好"、"感谢"等问候语或说明文字
4. 仅返回JSON对象，不要其他内容

请分析以下公司文档：`;

export class CompanyAnalysisService {
  private qwenClient: QwenClient;

  constructor() {
    this.qwenClient = new QwenClient();
  }

  async analyzeCompany(request: CompanyAnalysisRequest): Promise<CompanyAnalysisResponse> {
    try {
      const { companyId, documentContent, analysisType = 'full_research' } = request;
      
      console.log(`开始分析公司 ${companyId}，分析类型：${analysisType}`);
      
      // 构建完整的分析提示词
      const fullPrompt = `${ANALYSIS_PROMPT}\n\n公司文档内容：\n${documentContent}`;
      
      // 调用AI进行分析
      const chatResponse = await this.qwenClient.chat({
        messages: [
          {
            id: crypto.randomUUID(),
            role: 'system',
            content: SYSTEM_PROMPT,
            timestamp: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            role: 'user',
            content: fullPrompt,
            timestamp: new Date().toISOString(),
          },
        ],
        temperature: 0.3,
        maxTokens: 4000,
      });

      let analysis;
      try {
        // 临时记录AI响应用于调试
        console.log('AI原始响应:', chatResponse.message.content.substring(0, 200) + '...');
        
        // 尝试解析JSON响应
        analysis = JSON.parse(chatResponse.message.content);
      } catch (parseError) {
        console.error('AI响应解析失败:', parseError);
        console.error('AI完整响应:', chatResponse.message.content.substring(0, 500));
        throw new Error('AI分析结果格式错误，无法解析JSON');
      }

      // 构建完整的分析结果
      const fullAnalysis = {
        id: crypto.randomUUID(),
        companyId,
        status: {
          status: 'completed' as const,
          progress: 100,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        companyInfo: analysis.company_info,
        researchReport: analysis.research_report,
        qualityScore: analysis.quality_score,
        dataQualityIssues: analysis.data_quality_issues || [],
        outreachStrategy: analysis.outreach_strategy,
        outreachMessages: analysis.outreach_messages || [],
        followUpSuggestions: analysis.follow_up_suggestions || [],
        metadata: {
          ...analysis.metadata,
          analysis_timestamp: new Date().toISOString(),
          data_sources: analysis.metadata?.data_sources || ['website'],
          confidence_level: analysis.metadata?.confidence_level || 0.8,
          requires_human_review: analysis.metadata?.requires_human_review || false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        analysisId: fullAnalysis.id,
        status: 'completed',
        analysis: fullAnalysis,
      };

    } catch (error) {
      console.error('公司分析失败:', error);
      
      return {
        analysisId: crypto.randomUUID(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Mock数据生成（用于演示）
  generateMockAnalysis(companyId: string): any {
    return {
      id: crypto.randomUUID(),
      companyId,
      status: {
        status: 'completed' as const,
        progress: 100,
        completedAt: new Date().toISOString(),
      },
      companyInfo: {
        name: 'Global Tech Solutions Inc.',
        country: 'US',
        industry: '科技/软件开发',
        website: 'https://globaltech.example.com',
        founded_year: '2015',
        employees: '50-200人',
        primary_products: ['企业软件', '云服务', 'API解决方案'],
        contact_emails: [
          { email: 'john.smith@globaltech.com', type: 'personal', confidence: 0.9 },
          { email: 'sales@globaltech.com', type: 'company', confidence: 0.8 },
        ],
        phones: [
          { number: '+1-555-123-4567', type: 'main', confidence: 0.9 },
        ],
        social_media: {
          linkedin: 'https://linkedin.com/company/globaltech',
          facebook: 'https://facebook.com/globaltech',
        },
      },
      researchReport: {
        executive_summary: '这是一家专注于企业级软件开发的中型科技公司，成立于2015年，主要服务于北美市场。公司拥有50-200名员工，具有较强的技术实力和良好的市场声誉。从网站信息来看，该公司正在寻求技术合作伙伴，特别是在云基础设施和API集成方面有明确需求。决策层相对年轻化，对新技术接受度较高，是理想的B2B合作目标。',
        business_model: 'B2B SaaS提供商',
        market_position: '北美地区中等规模技术服务商',
        cooperation_potential: '在技术服务、云基础设施、API集成等领域有合作潜力',
        key_decision_makers: 'CTO John Smith，技术背景，决策相对快速',
        risks_and_opportunities: '机会：技术需求明确，预算充足；风险：竞争激烈，需要专业技术支持',
      },
      qualityScore: {
        email_quality: { score: 8.5, weight: 0.25, reasoning: '有个人邮箱和公司邮箱，质量较高' },
        contact_completeness: { score: 7.0, weight: 0.20, reasoning: '电话和社交媒体信息完整' },
        website_activity: { score: 8.0, weight: 0.20, reasoning: '网站内容丰富，更新频繁' },
        company_size: { score: 7.5, weight: 0.15, reasoning: '中型企业，有一定规模和实力' },
        purchase_intent: { score: 8.5, weight: 0.20, reasoning: '网站明确展示技术需求和合作意向' },
        final_score: 7.9,
        grade: 'A-',
        priority_level: '高优先级',
      },
      dataQualityIssues: [
        { issue: '部分产品页面图片加载缓慢', severity: 'low' },
      ],
      outreachStrategy: {
        recommended_channel: 'email',
        best_contact_time: '美东时间9:00-11:00',
        cultural_notes: '美国商务文化直接高效，重视时间和ROI',
        personalization_points: ['技术合作', '云服务需求', 'API集成'],
      },
      outreachMessages: [
        {
          language: 'English',
          subject: 'Partnership Opportunity - Cloud Infrastructure Solutions',
          content: 'Dear John,\n\nI noticed Global Tech Solutions\' focus on enterprise software development and your current expansion into cloud services. We specialize in providing scalable API infrastructure solutions that could complement your existing offerings.\n\nWould you be open to a brief 15-minute call to explore potential synergies?\n\nBest regards,\n[Your Name]',
        },
      ],
      followUpSuggestions: [
        { timing: '3天后', method: '邮件跟进', content: '询问是否收到初次邮件并重申合作价值' },
        { timing: '1周后', method: 'LinkedIn', content: '通过LinkedIn建立连接并发送简短消息' },
      ],
      metadata: {
        analysis_timestamp: new Date().toISOString(),
        data_sources: ['website', 'about_page', 'contact_page'],
        confidence_level: 0.85,
        requires_human_review: false,
        processing_notes: '公司信息完整，分析结果可信度高',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}