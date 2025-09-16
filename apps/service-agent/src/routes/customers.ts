import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import crypto from 'crypto';
import { WebCrawlerService } from '../lib/crawler.js';
import { AIAnalyzerService, AnalysisConfig } from '../lib/ai-analyzer.js';

// 客户数据类型定义
interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  country?: string;
  industry?: string;
  employeeCount?: number;
  position?: string;
  department?: string;
  notes?: string;
  transactionCount?: number;
  transactionAmount?: number;
  status?: 'NEW' | 'CRAWLED' | 'ANALYZED';
  leadScore?: number;
  crawledUrls?: Array<{
    url: string;
    title: string;
    content: string;
    emails: string[];
    phones: string[];
    keywords: string[];
  }>;
  contacts?: Array<{
    name: string;
    title: string;
    email: string;
    phone: string;
    confidence: number;
    source: string;
    type: 'personal' | 'generic';
  }>;
  scoreBreakdown?: {
    personalEmail: number;
    directPhone: number;
    procurementConfidence: number;
    productSimilarity: number;
    siteFreshness: number;
    belongingConfidence: number;
  };
  analysis?: string;
  detailedAnalysisReport?: string; // 新增：详细分析报告
  lastAnalyzed?: string;
  createdAt: string;
  updatedAt: string;
}

// 内存存储（生产环境应该用数据库）
let customers: Customer[] = [];
let customerIdCounter = 1;

// 请求验证schemas
const uploadFileSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  encoding: z.string(),
});

const createCustomerSchema = z.object({
  companyName: z.string().min(1, '公司名称不能为空'),
  contactName: z.string().min(1, '联系人不能为空'),
  email: z.string().email('邮箱格式不正确'),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  country: z.string().optional(),
  industry: z.string().optional(),
  employeeCount: z.number().int().positive().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  notes: z.string().optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

// 批量上传结果接口
interface BatchUploadResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  customers?: Customer[];
}

// 解析CSV文件
async function parseCSV(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const stream = Readable.from(buffer);
    
    stream
      .pipe(csvParser())
      .on('data', (data: any) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// 解析Excel文件
function parseExcel(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

// 标准化字段名映射
const fieldMapping: Record<string, string> = {
  // 中文字段映射
  '采购商': 'companyName',
  '公司名称': 'companyName',
  '目的国/地区': 'country',
  '国家': 'country',
  '地区': 'country',
  '交易次数': 'transactionCount',
  '交易金额': 'transactionAmount',
  '联系人': 'contactName',
  '邮箱': 'email',
  '电话': 'phone',
  '网站': 'website',
  '行业': 'industry',
  '员工数': 'employeeCount',
  '职位': 'position',
  '部门': 'department',
  '备注': 'notes',
  
  // 英文字段映射
  'company': 'companyName',
  'companyname': 'companyName',
  'company name': 'companyName',
  'contact': 'contactName',
  'contactname': 'contactName',
  'contact name': 'contactName',
  'name': 'contactName',
  'email': 'email',
  'mail': 'email',
  'phone': 'phone',
  'tel': 'phone',
  'telephone': 'phone',
  'website': 'website',
  'url': 'website',
  'site': 'website',
  'country': 'country',
  'nation': 'country',
  'location': 'country',
  'industry': 'industry',
  'sector': 'industry',
  'employees': 'employeeCount',
  'employeecount': 'employeeCount',
  'staff': 'employeeCount',
  'position': 'position',
  'title': 'position',
  'department': 'department',
  'dept': 'department',
  'notes': 'notes',
  'note': 'notes',
  'remark': 'notes',
};

// 标准化数据
function normalizeRowData(row: any): any {
  const normalized: any = {};
  
  Object.keys(row).forEach(key => {
    const lowerKey = key.toLowerCase().trim();
    const mappedKey = fieldMapping[lowerKey] || fieldMapping[key] || lowerKey;
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      normalized[mappedKey] = row[key];
    }
  });
  
  return normalized;
}

// 验证客户数据
function validateCustomerData(data: any, rowIndex: number): { isValid: boolean; errors: any[]; customer?: Customer } {
  const errors: any[] = [];
  
  try {
    const normalized = normalizeRowData(data);
    
    // 必填字段检查 - 只有公司名称是必需的
    if (!normalized.companyName) {
      errors.push({ row: rowIndex, field: 'companyName', message: '公司名称不能为空' });
    }
    
    // 如果没有联系人，使用默认值
    if (!normalized.contactName) {
      normalized.contactName = 'Unknown Contact';
    }
    
    // 如果没有邮箱，生成一个默认值
    if (!normalized.email) {
      const companySlug = normalized.companyName ? normalized.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') : 'unknown';
      normalized.email = `contact@${companySlug}.com`;
    }
    
    // 邮箱格式验证
    if (normalized.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
      errors.push({ row: rowIndex, field: 'email', message: '邮箱格式不正确' });
    }
    
    // 网站URL验证
    if (normalized.website && normalized.website !== '') {
      try {
        new URL(normalized.website);
      } catch {
        errors.push({ row: rowIndex, field: 'website', message: '网站URL格式不正确' });
      }
    }
    
    // 员工数验证
    if (normalized.employeeCount && (!Number.isInteger(Number(normalized.employeeCount)) || Number(normalized.employeeCount) <= 0)) {
      errors.push({ row: rowIndex, field: 'employeeCount', message: '员工数必须是正整数' });
    }
    
    if (errors.length === 0) {
      const customer: Customer = {
        id: (customerIdCounter++).toString(),
        companyName: normalized.companyName,
        contactName: normalized.contactName,
        email: normalized.email,
        phone: normalized.phone || '',
        website: normalized.website || '',
        country: normalized.country || '',
        industry: normalized.industry || '',
        employeeCount: normalized.employeeCount ? Number(normalized.employeeCount) : undefined,
        position: normalized.position || '',
        department: normalized.department || '',
        notes: normalized.notes || '',
        transactionCount: normalized.transactionCount ? Number(normalized.transactionCount) : undefined,
        transactionAmount: normalized.transactionAmount ? Number(normalized.transactionAmount) : undefined,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return { isValid: true, errors: [], customer };
    }
    
    return { isValid: false, errors };
  } catch (error) {
    errors.push({ row: rowIndex, field: 'general', message: '数据格式错误' });
    return { isValid: false, errors };
  }
}

// 生成详细分析报告的方法
async function generateDetailedAnalysisReport(
  customer: Customer, 
  crawlResults: any[], 
  analysis: any, 
  aiAnalyzer: AIAnalyzerService
): Promise<string> {
  try {
    // 汇总所有爬取的信息
    const allEmails = [...new Set(crawlResults.flatMap(r => r.contactEmails || []))];
    const allPhones = [...new Set(crawlResults.flatMap(r => r.phones || []))];
    const allContent = crawlResults.map(r => r.description || '').filter(d => d.length > 0);
    
    const reportPrompt = `请为以下公司生成一份详细的外贸合作分析报告：

**目标公司信息：**
- 公司名称: ${customer.companyName}
- 所在国家: ${customer.country}
- 交易次数: ${customer.transactionCount || 'N/A'}
- 交易金额: ${customer.transactionAmount || 'N/A'}

**网站分析数据：**
爬取到 ${crawlResults.length} 个相关网站的信息：
${crawlResults.map((result, i) => `
${i + 1}. ${result.website}
   评分: ${result.score?.overall || 'N/A'}
   内容摘要: ${result.description?.substring(0, 300) || 'N/A'}...
`).join('\n')}

**联系信息汇总：**
- 发现邮箱: ${allEmails.length} 个 (${allEmails.slice(0, 3).join(', ')}${allEmails.length > 3 ? '...' : ''})
- 发现电话: ${allPhones.length} 个

**AI评分结果：**
- 整体评分: ${analysis.overallScore}/100
- 优先级: ${analysis.priority}

请生成一份1000-1500字的详细分析报告，包含以下内容：

1. **公司概况分析** - 基于网站信息分析公司的业务性质、规模和实力
2. **合作潜力评估** - 从外贸代理角度评估合作价值和机会
3. **风险评估** - 识别潜在的合作风险和注意事项  
4. **联系策略建议** - 具体的联系方式和沟通策略
5. **后续行动计划** - 详细的跟进步骤和时间安排

请用专业的商务语言撰写，确保内容实用且可操作。`;

    const response = await aiAnalyzer['qwenClient'].chat({
      messages: [
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: '你是一位资深的外贸商务分析专家，擅长企业尽职调查和商务合作评估。请基于提供的信息生成专业、详细的商务分析报告。',
          timestamp: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          role: 'user',
          content: reportPrompt,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return response.message.content;
  } catch (error) {
    console.error('生成详细报告失败:', error);
    return `基于对 ${customer.companyName} 的初步分析，该公司位于 ${customer.country}，具有一定的商业价值。建议进行进一步的深入调研和直接联系。`;
  }
}

// AI辅助选择最佳网站的方法
async function selectBestWebsiteWithAI(candidates: any[], customer: Customer): Promise<any | null> {
  try {
    const aiAnalyzer = new AIAnalyzerService();
    
    // 构建候选网站信息摘要
    const candidatesSummary = candidates.map((candidate, index) => {
      return `${index + 1}. ${candidate.website}
   - 公司名称: ${candidate.companyName || 'N/A'}
   - 描述: ${candidate.description?.substring(0, 200) || 'N/A'}...
   - 评分: ${candidate.score.overall}
   - 联系方式: ${candidate.contactEmails?.length || 0} 邮箱, ${candidate.phones?.length || 0} 电话`;
    }).join('\n\n');

    const selectionPrompt = `我需要为公司 "${customer.companyName}" (${customer.country}) 选择最佳的官方网站。

以下是搜索到的候选网站：
${candidatesSummary}

请分析这些候选网站，选择最有可能是 "${customer.companyName}" 官方网站的选项。考虑因素包括：
1. 公司名称匹配度
2. 网站内容相关性
3. 联系信息完整性
4. 网站专业性评分

请只回复选择的编号（1-${candidates.length}），如果都不合适请回复0。`;

    // 调用AI进行选择
    const response = await aiAnalyzer['qwenClient'].chat({
      messages: [
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: '你是一个专业的企业网站识别专家，能够准确判断哪个网站最可能是目标公司的官方网站。',
          timestamp: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          role: 'user',
          content: selectionPrompt,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    const selection = parseInt(response.message.content.trim());
    console.log(`AI选择结果: ${selection} (总共 ${candidates.length} 个选项)`);

    if (selection >= 1 && selection <= candidates.length) {
      return candidates[selection - 1];
    } else {
      console.log('AI判断所有候选网站都不合适，选择评分最高的');
      return candidates.sort((a, b) => b.score.overall - a.score.overall)[0];
    }
  } catch (error) {
    console.error('AI选择网站失败，回退到评分最高的:', error);
    // 如果AI选择失败，回退到评分最高的网站
    return candidates.sort((a, b) => b.score.overall - a.score.overall)[0];
  }
}

export default async function customersRoutes(fastify: FastifyInstance) {
  
  // 获取客户列表
  fastify.get('/api/customers', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { page = 1, limit = 20, search = '', industry = '', country = '' } = request.query as any;
      
      let filteredCustomers = customers;
      
      // 搜索过滤
      if (search) {
        const searchLower = search.toLowerCase();
        filteredCustomers = filteredCustomers.filter(customer =>
          customer.companyName.toLowerCase().includes(searchLower) ||
          customer.contactName.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower)
        );
      }
      
      // 行业过滤
      if (industry) {
        filteredCustomers = filteredCustomers.filter(customer =>
          customer.industry?.toLowerCase().includes(industry.toLowerCase())
        );
      }
      
      // 国家过滤
      if (country) {
        filteredCustomers = filteredCustomers.filter(customer =>
          customer.country?.toLowerCase().includes(country.toLowerCase())
        );
      }
      
      // 分页
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedCustomers,
        pagination: {
          current: page,
          pageSize: limit,
          total: filteredCustomers.length,
          totalPages: Math.ceil(filteredCustomers.length / limit),
        },
        summary: {
          totalCustomers: customers.length,
          filteredCustomers: filteredCustomers.length,
        },
      };
    } catch (error) {
      console.error('获取客户列表错误:', error);
      return reply.status(500).send({
        error: '获取客户列表失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
  
  // 获取单个客户详情
  fastify.get('/api/customers/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      const customer = customers.find(c => c.id === id);
      if (!customer) {
        return reply.status(404).send({
          error: '客户不存在',
          message: `未找到ID为 ${id} 的客户`,
        });
      }
      
      return {
        success: true,
        data: customer,
      };
    } catch (error) {
      console.error('获取客户详情错误:', error);
      return reply.status(500).send({
        error: '获取客户详情失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
  
  // 创建客户
  fastify.post('/api/customers', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const customerData = createCustomerSchema.parse(request.body);
      
      // 检查邮箱是否已存在
      const existingCustomer = customers.find(c => c.email === customerData.email);
      if (existingCustomer) {
        return reply.status(409).send({
          error: '邮箱已存在',
          message: '该邮箱地址已被其他客户使用',
        });
      }
      
      const customer: Customer = {
        id: (customerIdCounter++).toString(),
        ...customerData,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      customers.push(customer);
      
      return {
        success: true,
        data: customer,
        message: '客户创建成功',
      };
    } catch (error) {
      console.error('创建客户错误:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: '数据验证失败',
          details: error.errors,
        });
      }
      
      return reply.status(500).send({
        error: '创建客户失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
  
  // 更新客户
  fastify.put('/api/customers/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const updateData = updateCustomerSchema.parse(request.body);
      
      const customerIndex = customers.findIndex(c => c.id === id);
      if (customerIndex === -1) {
        return reply.status(404).send({
          error: '客户不存在',
          message: `未找到ID为 ${id} 的客户`,
        });
      }
      
      // 如果更新邮箱，检查是否与其他客户重复
      if (updateData.email) {
        const existingCustomer = customers.find(c => c.email === updateData.email && c.id !== id);
        if (existingCustomer) {
          return reply.status(409).send({
            error: '邮箱已存在',
            message: '该邮箱地址已被其他客户使用',
          });
        }
      }
      
      customers[customerIndex] = {
        ...customers[customerIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      
      return {
        success: true,
        data: customers[customerIndex],
        message: '客户更新成功',
      };
    } catch (error) {
      console.error('更新客户错误:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: '数据验证失败',
          details: error.errors,
        });
      }
      
      return reply.status(500).send({
        error: '更新客户失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
  
  // 删除客户
  fastify.delete('/api/customers/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      const customerIndex = customers.findIndex(c => c.id === id);
      if (customerIndex === -1) {
        return reply.status(404).send({
          error: '客户不存在',
          message: `未找到ID为 ${id} 的客户`,
        });
      }
      
      customers.splice(customerIndex, 1);
      
      return {
        success: true,
        message: '客户删除成功',
      };
    } catch (error) {
      console.error('删除客户错误:', error);
      return reply.status(500).send({
        error: '删除客户失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
  
  // 批量上传客户数据
  fastify.post('/api/customers/upload', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('收到文件上传请求');
      
      // 获取上传的文件
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({
          error: '没有找到上传文件',
          message: '请选择要上传的文件',
        });
      }
      
      console.log(`上传文件: ${data.filename}, 类型: ${data.mimetype}`);
      
      // 读取文件内容
      const buffer = await data.toBuffer();
      let rawData: any[] = [];
      
      // 根据文件类型解析数据
      if (data.mimetype === 'text/csv' || data.filename.endsWith('.csv')) {
        rawData = await parseCSV(buffer);
      } else if (
        data.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        data.mimetype === 'application/vnd.ms-excel' ||
        data.filename.endsWith('.xlsx') ||
        data.filename.endsWith('.xls')
      ) {
        rawData = parseExcel(buffer);
      } else {
        return reply.status(400).send({
          error: '不支持的文件格式',
          message: '请上传 CSV 或 Excel 文件',
        });
      }
      
      console.log(`解析到 ${rawData.length} 行数据`);
      
      if (rawData.length === 0) {
        return reply.status(400).send({
          error: '文件为空',
          message: '上传的文件没有包含任何数据',
        });
      }
      
      // 验证和处理数据
      const result: BatchUploadResult = {
        total: rawData.length,
        success: 0,
        failed: 0,
        errors: [],
        customers: [],
      };
      
      const successCustomers: Customer[] = [];
      
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const validation = validateCustomerData(row, i + 1);
        
        if (validation.isValid && validation.customer) {
          // 检查邮箱是否已存在
          const existingCustomer = customers.find(c => c.email === validation.customer!.email);
          if (existingCustomer) {
            result.errors.push({
              row: i + 1,
              field: 'email',
              message: '邮箱已存在',
            });
            result.failed++;
          } else {
            successCustomers.push(validation.customer);
            result.success++;
          }
        } else {
          result.errors.push(...validation.errors);
          result.failed++;
        }
      }
      
      // 批量添加成功的客户
      customers.push(...successCustomers);
      result.customers = successCustomers;
      
      console.log(`上传完成: 成功 ${result.success}, 失败 ${result.failed}`);
      
      return {
        success: true,
        data: result,
        message: `文件上传完成，成功导入 ${result.success} 条记录，${result.failed} 条记录失败`,
      };
    } catch (error) {
      console.error('文件上传错误:', error);
      return reply.status(500).send({
        error: '文件上传失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
  
  // 获取客户统计信息
  fastify.get('/api/customers/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = {
        totalCustomers: customers.length,
        byIndustry: {} as Record<string, number>,
        byCountry: {} as Record<string, number>,
        recentlyAdded: customers.filter(c => {
          const createdAt = new Date(c.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdAt > weekAgo;
        }).length,
      };
      
      // 统计行业分布
      customers.forEach(customer => {
        const industry = customer.industry || '未分类';
        stats.byIndustry[industry] = (stats.byIndustry[industry] || 0) + 1;
      });
      
      // 统计国家分布
      customers.forEach(customer => {
        const country = customer.country || '未知';
        stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
      });
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('获取统计信息错误:', error);
      return reply.status(500).send({
        error: '获取统计信息失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
  
  // 清空客户数据（开发用）
  fastify.delete('/api/customers/clear', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      customers = [];
      customerIdCounter = 1;
      
      return {
        success: true,
        message: '所有客户数据已清空',
      };
    } catch (error) {
      console.error('清空客户数据错误:', error);
      return reply.status(500).send({
        error: '清空客户数据失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 分析客户（爬取网站 + AI 分析）
  fastify.post('/api/customers/:id/analyze', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      const customer = customers.find(c => c.id === id);
      if (!customer) {
        return reply.status(404).send({
          error: '客户不存在',
          message: `未找到ID为 ${id} 的客户`,
        });
      }

      // 获取客户索引，用于后续更新
      const customerIndex = customers.findIndex(c => c.id === id);

      // 如果没有网站，尝试根据公司名称和国家搜索网站
      let websiteToAnalyze = customer.website;
      
      if (!websiteToAnalyze || websiteToAnalyze.trim() === '') {
        console.log(`客户 ${customer.companyName} 没有网站信息，尝试智能搜索...`);
        
        // 使用Google搜索API查找公司网站
        const crawler = new WebCrawlerService({
          googleApiKey: process.env.GOOGLE_API_KEY,
          googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
        });

        try {
          // 优化搜索策略：使用更精确的关键词
          const companyKeywords = [
            customer.companyName,
            // 去除常见后缀，提高搜索准确性
            customer.companyName.replace(/\s+(LIMITED|LTD|PRIVATE|PVT|CORPORATION|CORP|INC|INCORPORATED|LLC|CO|COMPANY|GROUP|ENTERPRISE|SOLUTIONS|SERVICES|SYSTEMS)$/gi, '').trim()
          ].filter(keyword => keyword.length > 3); // 过滤太短的关键词

          const searchQuery = {
            keywords: companyKeywords.slice(0, 2), // 最多使用2个关键词
            location: customer.country,
            maxResults: 15 // 大幅增加搜索结果数量，确保找到更多候选网站
          };
          
          const searchResults = await crawler.searchAndCrawlCompanies(searchQuery);
          
          // 基础过滤：排除明显无关的网站
          const basicFilteredWebsites = searchResults.filter(result => 
            !result.error && 
            result.website &&
            !result.website.includes('.pdf') &&
            !result.website.includes('.doc') &&
            !result.website.includes('scribd.com') &&
            !result.website.includes('.gov') &&
            !result.website.includes('wikipedia.org') &&
            !result.website.includes('linkedin.com') &&
            !result.website.includes('facebook.com') &&
            !result.website.includes('twitter.com') &&
            !result.website.includes('instagram.com') &&
            result.score.overall >= 30 // 降低基础门槛
          );

          console.log(`基础过滤后剩余 ${basicFilteredWebsites.length} 个网站`);

          if (basicFilteredWebsites.length > 0) {
            // 如果有多个候选网站，使用AI来判断哪个最匹配
            let selectedWebsite;
            
            if (basicFilteredWebsites.length === 1) {
              selectedWebsite = basicFilteredWebsites[0];
            } else {
              // 使用AI分析多个候选网站，选择最佳匹配
              selectedWebsite = await selectBestWebsiteWithAI(basicFilteredWebsites, customer);
            }

            if (selectedWebsite) {
              websiteToAnalyze = selectedWebsite.website;
              console.log(`选择网站进行分析: ${websiteToAnalyze} (评分: ${selectedWebsite.score.overall})`);
              
              // 更新客户的网站信息
              if (customerIndex !== -1) {
                customers[customerIndex].website = websiteToAnalyze;
              }
            }
          } else {
            return reply.status(400).send({
              error: '无法自动分析',
              message: `系统无法为 "${customer.companyName}" 找到有效的公司官方网站。请考虑：
              
1. 手动添加网站URL后重新分析
2. 检查公司名称拼写是否正确
3. 该公司可能没有官方网站

搜索尝试的关键词: "${companyKeywords.join('", "')}"`,
              suggestions: {
                manualInput: true,
                searchKeywords: companyKeywords,
                foundResults: searchResults.length,
                validResults: basicFilteredWebsites.length
              }
            });
          }
        } catch (searchError) {
          console.error('搜索错误:', searchError);
          return reply.status(400).send({
            error: '搜索服务异常',
            message: `无法为 "${customer.companyName}" 进行网站搜索。可能原因：

1. 搜索服务暂时不可用
2. API配额已用完
3. 网络连接问题

建议：请稍后重试，或手动添加公司网站URL`,
            suggestions: {
              manualInput: true,
              retryLater: true
            }
          });
        }
      }

      console.log(`开始分析客户: ${customer.companyName} - ${websiteToAnalyze}`);

      // 1. 爬取网站数据
      const crawler = new WebCrawlerService({
        googleApiKey: process.env.GOOGLE_API_KEY,
        googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
      });

      if (!websiteToAnalyze) {
        return reply.status(400).send({
          error: '无法分析',
          message: '没有有效的网站URL进行分析',
        });
      }

      const crawlResult = await crawler.crawlCompanyWebsite(websiteToAnalyze);
      
      if (crawlResult.error) {
        console.error('网站爬取失败:', crawlResult.error);
        return reply.status(400).send({
          error: '网站爬取失败',
          message: crawlResult.error,
        });
      }

      // 2. 如果找到了多个相关网站，尝试爬取更多信息
      let allCrawlResults = [crawlResult];
      let searchResults: any[] = [];
      
      // 重新获取搜索结果用于额外爬取
      if (!websiteToAnalyze || websiteToAnalyze === customer.website) {
        try {
          const companyKeywords = [
            customer.companyName,
            customer.companyName.replace(/\s+(LIMITED|LTD|PRIVATE|PVT|CORPORATION|CORP|INC|INCORPORATED|LLC|CO|COMPANY|GROUP|ENTERPRISE|SOLUTIONS|SERVICES|SYSTEMS)$/gi, '').trim()
          ].filter(keyword => keyword.length > 3);

          const searchQuery = {
            keywords: companyKeywords.slice(0, 2),
            location: customer.country,
            maxResults: 10
          };
          
          searchResults = await crawler.searchAndCrawlCompanies(searchQuery);
          
          const additionalWebsites = searchResults.filter(result => 
            !result.error && 
            result.website &&
            result.website !== websiteToAnalyze &&
            !result.website.includes('.pdf') &&
            !result.website.includes('.doc') &&
            result.score.overall >= 40
          );

          console.log(`找到 ${additionalWebsites.length} 个额外的候选网站进行爬取`);
          
          // 爬取前3个额外网站获取更多信息
          for (let i = 0; i < Math.min(3, additionalWebsites.length); i++) {
            try {
              const additionalCrawl = await crawler.crawlCompanyWebsite(additionalWebsites[i].website);
              if (!additionalCrawl.error) {
                allCrawlResults.push(additionalCrawl);
              }
              // 添加延迟避免过快请求
              await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (error) {
              console.error(`额外爬取 ${additionalWebsites[i].website} 失败:`, error);
            }
          }
        } catch (error) {
          console.error('获取额外搜索结果失败:', error);
        }
      }

      console.log(`总共爬取了 ${allCrawlResults.length} 个网站的信息`);

      // 3. 进行综合AI分析
      const aiAnalyzer = new AIAnalyzerService();
      const businessContext = {
        companyName: "外贸代理公司",
        industry: "外贸服务",
        services: ["外贸代理", "采购代理", "出口服务", "贸易咨询"],
        targetMarkets: ["全球市场", "欧美市场", "亚洲市场"],
        uniqueValueProposition: "专业外贸代理服务，帮助企业拓展国际市场"
      };

      const analysisConfig: AnalysisConfig = {
        businessContext,
        analysisDepth: 'comprehensive', // 使用更深入的分析
        language: 'zh',
      };

      // 使用主要网站进行分析，但结合所有爬取的信息
      const analysis = await aiAnalyzer.analyzeCompany(crawlResult, analysisConfig);
      
      // 生成综合分析报告
      const detailedAnalysisReport = await generateDetailedAnalysisReport(
        customer, allCrawlResults, analysis, aiAnalyzer
      );

      // 3. 更新客户数据
      if (customerIndex !== -1) {
        customers[customerIndex] = {
          ...customers[customerIndex],
          status: 'ANALYZED',
          leadScore: analysis.overallScore,
          crawledUrls: allCrawlResults.map(result => ({
            url: result.website,
            title: result.companyName || customer.companyName,
            content: result.description || '',
            emails: result.contactEmails || [],
            phones: result.phones || [],
            keywords: []
          })),
          contacts: (crawlResult.contactEmails || []).map((email: string, idx: number) => ({
            name: `联系人 ${idx + 1}`,
            title: '未知',
            email: email,
            phone: (crawlResult.phones || [])[idx] || '',
            confidence: 0.8,
            source: 'website',
            type: email.includes('info@') || email.includes('contact@') ? 'generic' as const : 'personal' as const
          })),
          scoreBreakdown: {
            personalEmail: analysis.dimensions?.contactability?.score || 0,
            directPhone: analysis.dimensions?.contactability?.score || 0,
            procurementConfidence: analysis.dimensions?.businessMatching?.score || 0,
            productSimilarity: analysis.dimensions?.businessMatching?.score || 0,
            siteFreshness: analysis.dimensions?.marketPotential?.score || 0,
            belongingConfidence: analysis.overallScore || 0,
          },
          analysis: analysis.recommendation,
          detailedAnalysisReport: detailedAnalysisReport, // 存储详细分析报告
          lastAnalyzed: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      console.log(`客户分析完成: ${customer.companyName} - 评分: ${analysis.overallScore}`);

      return {
        success: true,
        data: customers[customerIndex],
        crawlResult,
        analysis,
        message: '客户分析完成',
      };
    } catch (error) {
      console.error('客户分析错误:', error);
      return reply.status(500).send({
        error: '客户分析失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}