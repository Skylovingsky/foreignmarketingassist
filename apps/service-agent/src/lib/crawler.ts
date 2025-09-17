/**
 * 网页爬虫服务
 * 用于抓取公司网站信息和联系方式
 * 集成Google Custom Search API和智能内容提取
 */

import * as cheerio from 'cheerio';

export interface CrawlerConfig {
  timeout: number;
  maxPages: number;
  userAgent: string;
  respectRobots: boolean;
  googleApiKey?: string;
  googleSearchEngineId?: string;
  // Google搜索优化参数
  cseGl?: string;  // 地理位置
  cseHl?: string;  // 界面语言
  cseLr?: string;  // 搜索语言
  cseCr?: string;  // 国家限制
  cseDate?: string;  // 时间限制
  cseMaxPerMin?: number;  // 每分钟最大请求数
}

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export interface CompanyCrawlResult {
  companyName: string;
  website: string;
  description: string;
  contactEmails: string[];
  phones: string[];
  addresses: string[];
  socialMedia: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  businessInfo: {
    industry?: string;
    foundedYear?: string;
    employees?: string;
    revenue?: string;
  };
  score: {
    overall: number;
    relevance: number;
    credibility: number;
    contact: number;
    content: number;
    technical: number;
  };
  crawledAt: string;
  searchRank?: number;
  error?: string;
}

export interface CompanySearchQuery {
  keywords: string[];
  industry?: string;
  location?: string;
  size?: string;
  maxResults?: number;
}

export class WebCrawlerService {
  private config: CrawlerConfig;
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private requestWindow: number = 60000; // 1分钟窗口

  constructor(config?: Partial<CrawlerConfig>) {
    this.config = {
      timeout: 30000,
      maxPages: 5,
      userAgent: 'Trade-Assistant-Crawler/1.0',
      respectRobots: true,
      googleApiKey: process.env.GOOGLE_API_KEY,
      googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
      // Google搜索优化配置
      cseGl: process.env.CSE_GL,
      cseHl: process.env.CSE_HL,
      cseLr: process.env.CSE_LR,
      cseCr: process.env.CSE_CR,
      cseDate: process.env.CSE_DATE || 'm18',
      cseMaxPerMin: parseInt(process.env.CSE_MAX_PER_MIN || '40', 10),
      ...config,
    };
  }

  /**
   * 检查API请求频率限制
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    // 重置计数器（每分钟）
    if (now - this.lastRequestTime > this.requestWindow) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }
    
    // 检查是否超过限制
    if (this.requestCount >= (this.config.cseMaxPerMin || 40)) {
      const waitTime = this.requestWindow - (now - this.lastRequestTime);
      console.log(`⏳ API频率限制，等待 ${Math.ceil(waitTime/1000)} 秒...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastRequestTime = Date.now();
    }
    
    this.requestCount++;
  }

  /**
   * 使用Google Custom Search API搜索公司
   */
  async searchCompanies(query: CompanySearchQuery): Promise<GoogleSearchResult[]> {
    try {
      if (!this.config.googleApiKey || !this.config.googleSearchEngineId) {
        throw new Error('Google API配置缺失');
      }

      // 检查频率限制
      await this.checkRateLimit();

      // 构建精准搜索查询
      const searchTerms = this.buildAdvancedSearchQuery(query);

      const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
      searchUrl.searchParams.set('key', this.config.googleApiKey!);
      searchUrl.searchParams.set('cx', this.config.googleSearchEngineId!);
      searchUrl.searchParams.set('q', searchTerms);
      searchUrl.searchParams.set('num', String(query.maxResults || 10));
      
      // 添加高级搜索参数
      if (this.config.cseGl) searchUrl.searchParams.set('gl', this.config.cseGl);
      if (this.config.cseHl) searchUrl.searchParams.set('hl', this.config.cseHl);
      if (this.config.cseLr) searchUrl.searchParams.set('lr', this.config.cseLr);
      if (this.config.cseCr) searchUrl.searchParams.set('cr', this.config.cseCr);
      if (this.config.cseDate) searchUrl.searchParams.set('dateRestrict', this.config.cseDate);

      console.log(`执行Google搜索: ${searchTerms}`);

      const response = await fetch(searchUrl.toString());
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google搜索API详细错误:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Google搜索API错误: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`🔍 Google API响应数据:`, {
        totalResults: data.searchInformation?.totalResults || '未知',
        searchTime: data.searchInformation?.searchTime || '未知',
        itemsFound: data.items ? data.items.length : 0,
        hasItems: !!data.items
      });
      
      if (!data.items || data.items.length === 0) {
        console.log(`⚠️ 复杂查询无结果，尝试简化查询...`);
        
        // 尝试更简单的查询作为备用方案
        if (query.keywords.length > 0) {
          const fallbackQuery = `"${query.keywords[0]}"`;
          console.log(`🔄 备用查询: ${fallbackQuery}`);
          
          try {
            const fallbackUrl = new URL('https://www.googleapis.com/customsearch/v1');
            fallbackUrl.searchParams.set('key', this.config.googleApiKey!);
            fallbackUrl.searchParams.set('cx', this.config.googleSearchEngineId!);
            fallbackUrl.searchParams.set('q', fallbackQuery);
            fallbackUrl.searchParams.set('num', String(query.maxResults || 10));
            
            const fallbackResponse = await fetch(fallbackUrl.toString());
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.items && fallbackData.items.length > 0) {
                console.log(`✅ 备用查询成功找到 ${fallbackData.items.length} 个结果`);
                return fallbackData.items.map((item: any) => ({
                  title: item.title,
                  link: item.link,
                  snippet: item.snippet,
                  displayLink: item.displayLink,
                }));
              }
            }
          } catch (fallbackError) {
            console.error('备用查询也失败:', fallbackError);
          }
        }
        
        return [];
      }

      const results = data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
      }));
      
      console.log(`✅ 成功处理 ${results.length} 个搜索结果`);
      return results;
    } catch (error) {
      console.error('Google搜索失败:', error);
      throw error;
    }
  }

  /**
   * 爬取单个公司网站
   */
  async crawlCompanyWebsite(url: string, searchRank?: number): Promise<CompanyCrawlResult> {
    try {
      console.log(`开始爬取网站: ${url}`);
      
      // 获取网页内容
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.config.userAgent,
        },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // 提取基本信息
      const companyName = this.extractCompanyName($, url);
      const description = this.extractDescription($);
      const contactEmails = this.extractEmails(html);
      const phones = this.extractPhones(html);
      const addresses = this.extractAddresses($);
      const socialMedia = this.extractSocialMedia($);
      const businessInfo = this.extractBusinessInfo($);

      // 计算质量评分
      const score = this.calculateQualityScore({
        companyName,
        description,
        contactEmails,
        phones,
        addresses,
        socialMedia,
        businessInfo,
        html,
        url,
      });

      const result: CompanyCrawlResult = {
        companyName,
        website: url,
        description,
        contactEmails,
        phones,
        addresses,
        socialMedia,
        businessInfo,
        score,
        crawledAt: new Date().toISOString(),
        searchRank,
      };
      
      console.log(`网站爬取完成: ${companyName} (评分: ${score.overall})`);
      return result;
    } catch (error) {
      console.error('网站爬取失败:', error);
      
      return {
        companyName: '未知',
        website: url,
        description: '',
        contactEmails: [],
        phones: [],
        addresses: [],
        socialMedia: {},
        businessInfo: {},
        score: {
          overall: 0,
          relevance: 0,
          credibility: 0,
          contact: 0,
          content: 0,
          technical: 0,
        },
        crawledAt: new Date().toISOString(),
        searchRank,
        error: error instanceof Error ? error.message : '爬取失败',
      };
    }
  }

  /**
   * 批量搜索和爬取公司
   */
  async searchAndCrawlCompanies(query: CompanySearchQuery): Promise<CompanyCrawlResult[]> {
    try {
      console.log(`开始搜索和爬取公司，关键词: ${query.keywords.join(', ')}`);
      
      // 1. 使用Google搜索获取候选网站，如果失败则尝试备用策略
      let searchResults;
      try {
        searchResults = await this.searchCompanies(query);
      } catch (searchError) {
        console.error(`主搜索失败，尝试简化搜索策略:`, searchError);
        
        // 尝试更简单的搜索策略
        if (query.keywords.length > 0) {
          const simplifiedQuery = {
            keywords: [query.keywords[0]], // 只使用第一个关键词
            maxResults: query.maxResults || 10
          };
          
          try {
            console.log(`🔄 尝试简化搜索: ${simplifiedQuery.keywords[0]}`);
            searchResults = await this.searchCompanies(simplifiedQuery);
          } catch (fallbackError) {
            console.error(`备用搜索也失败:`, fallbackError);
            throw new Error(`所有搜索策略都失败: ${searchError instanceof Error ? searchError.message : String(searchError)}`);
          }
        } else {
          throw searchError;
        }
      }
      
      console.log(`找到 ${searchResults.length} 个搜索结果`);

      // 2. 爬取每个网站
      const crawlResults: CompanyCrawlResult[] = [];
      
      for (let i = 0; i < searchResults.length; i++) {
        const searchResult = searchResults[i];
        try {
          const crawlResult = await this.crawlCompanyWebsite(searchResult.link, i + 1);
          crawlResults.push(crawlResult);
          
          // 添加延迟避免过快请求
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`爬取 ${searchResult.link} 失败:`, error);
          // 继续处理下一个
        }
      }

      // 3. 按质量评分排序
      crawlResults.sort((a, b) => b.score.overall - a.score.overall);

      console.log(`完成爬取，成功处理 ${crawlResults.length} 个网站`);
      return crawlResults;
    } catch (error) {
      console.error('搜索和爬取失败:', error);
      throw error;
    }
  }

  /**
   * 批量爬取指定网站
   */
  async batchCrawlWebsites(urls: string[]): Promise<CompanyCrawlResult[]> {
    console.log(`开始批量爬取 ${urls.length} 个网站`);
    
    const results: CompanyCrawlResult[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const result = await this.crawlCompanyWebsite(url, i + 1);
        results.push(result);
        
        // 避免过快请求，添加延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`爬取 ${url} 失败:`, error);
        results.push({
          companyName: '未知',
          website: url,
          description: '',
          contactEmails: [],
          phones: [],
          addresses: [],
          socialMedia: {},
          businessInfo: {},
          score: {
            overall: 0,
            relevance: 0,
            credibility: 0,
            contact: 0,
            content: 0,
            technical: 0,
          },
          crawledAt: new Date().toISOString(),
          searchRank: i + 1,
          error: '批量爬取失败',
        });
      }
    }
    
    // 按质量评分排序
    results.sort((a, b) => b.score.overall - a.score.overall);
    
    return results;
  }

  /**
   * 提取公司名称
   */
  private extractCompanyName($: cheerio.CheerioAPI, url: string): string {
    // 尝试多种方式提取公司名称
    const candidates = [
      $('title').text(),
      $('h1').first().text(),
      $('[class*="company"], [class*="brand"], [class*="logo"]').first().text(),
      $('meta[property="og:site_name"]').attr('content') || '',
      $('meta[name="application-name"]').attr('content') || '',
    ].filter(Boolean);

    if (candidates.length > 0) {
      return this.cleanText(candidates[0]);
    }

    // 从域名提取
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '').split('.')[0];
    } catch {
      return '未知公司';
    }
  }

  /**
   * 提取公司描述
   */
  private extractDescription($: cheerio.CheerioAPI): string {
    const candidates = [
      $('meta[name="description"]').attr('content') || '',
      $('meta[property="og:description"]').attr('content') || '',
      $('.about, .description, .intro, .overview').first().text(),
      $('p').first().text(),
    ].filter(Boolean);

    return candidates.length > 0 ? this.cleanText(candidates[0]!) : '';
  }

  /**
   * 提取邮箱地址
   */
  private extractEmails(html: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = html.match(emailRegex) || [];
    
    // 过滤常见的无用邮箱
    const filtered = emails.filter(email => 
      !email.includes('example.com') &&
      !email.includes('test.com') &&
      !email.includes('noreply') &&
      !email.includes('no-reply')
    );
    
    return [...new Set(filtered)]; // 去重
  }

  /**
   * 提取电话号码
   */
  private extractPhones(html: string): string[] {
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|\+?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/g;
    const phones = html.match(phoneRegex) || [];
    
    return [...new Set(phones.map(phone => phone.trim()))]; // 去重
  }

  /**
   * 提取地址信息
   */
  private extractAddresses($: cheerio.CheerioAPI): string[] {
    const addresses = [
      $('.address, .location, .contact-address').text(),
      $('[class*="address"], [class*="location"]').text(),
    ].filter(Boolean).map(addr => this.cleanText(addr));

    return [...new Set(addresses)];
  }

  /**
   * 提取社交媒体链接
   */
  private extractSocialMedia($: cheerio.CheerioAPI): CompanyCrawlResult['socialMedia'] {
    const socialMedia: CompanyCrawlResult['socialMedia'] = {};

    $('a[href*="linkedin.com"]').each((_, el) => {
      if (!socialMedia.linkedin) {
        socialMedia.linkedin = $(el).attr('href');
      }
    });

    $('a[href*="facebook.com"]').each((_, el) => {
      if (!socialMedia.facebook) {
        socialMedia.facebook = $(el).attr('href');
      }
    });

    $('a[href*="twitter.com"], a[href*="x.com"]').each((_, el) => {
      if (!socialMedia.twitter) {
        socialMedia.twitter = $(el).attr('href');
      }
    });

    $('a[href*="instagram.com"]').each((_, el) => {
      if (!socialMedia.instagram) {
        socialMedia.instagram = $(el).attr('href');
      }
    });

    return socialMedia;
  }

  /**
   * 提取业务信息
   */
  private extractBusinessInfo($: cheerio.CheerioAPI): CompanyCrawlResult['businessInfo'] {
    const businessInfo: CompanyCrawlResult['businessInfo'] = {};
    
    // 提取行业信息
    const industrySelectors = [
      '[class*="industry"], [class*="sector"]',
      'meta[name="industry"]',
    ];
    
    for (const selector of industrySelectors) {
      const industry = $(selector).text() || $(selector).attr('content');
      if (industry) {
        businessInfo.industry = this.cleanText(industry);
        break;
      }
    }

    // 提取员工数量
    const text = $.text();
    const employeeMatch = text.match(/(\d+[-\s]*\d*)\s*(employees?|staff|people)/i);
    if (employeeMatch) {
      businessInfo.employees = employeeMatch[1];
    }

    // 提取成立年份
    const yearMatch = text.match(/(?:founded|established|since)\s*(\d{4})/i);
    if (yearMatch) {
      businessInfo.foundedYear = yearMatch[1];
    }

    return businessInfo;
  }

  /**
   * 计算网站质量评分
   */
  private calculateQualityScore(data: {
    companyName: string;
    description: string;
    contactEmails: string[];
    phones: string[];
    addresses: string[];
    socialMedia: CompanyCrawlResult['socialMedia'];
    businessInfo: CompanyCrawlResult['businessInfo'];
    html: string;
    url: string;
  }): CompanyCrawlResult['score'] {
    let relevance = 0;
    let credibility = 0;
    let contact = 0;
    let content = 0;
    let technical = 0;

    // 相关性评分 (0-100)
    if (data.companyName && data.companyName !== '未知公司') relevance += 30;
    if (data.description && data.description.length > 50) relevance += 40;
    if (data.businessInfo.industry) relevance += 30;

    // 可信度评分 (0-100)
    if (data.url.startsWith('https://')) credibility += 20;
    if (data.businessInfo.foundedYear) credibility += 20;
    if (data.addresses.length > 0) credibility += 20;
    if (Object.keys(data.socialMedia).length > 0) credibility += 20;
    if (data.html.includes('privacy') || data.html.includes('terms')) credibility += 20;

    // 联系方式评分 (0-100)
    contact += data.contactEmails.length * 40;
    contact += data.phones.length * 30;
    contact += data.addresses.length * 20;
    if (data.socialMedia.linkedin) contact += 10;

    // 内容质量评分 (0-100)
    if (data.description.length > 100) content += 30;
    if (data.description.length > 300) content += 20;
    const wordCount = data.html.split(/\s+/).length;
    if (wordCount > 500) content += 25;
    if (wordCount > 1500) content += 25;

    // 技术质量评分 (0-100)
    if (data.html.includes('viewport')) technical += 20;
    if (data.html.includes('og:')) technical += 20;
    if (data.html.includes('schema.org')) technical += 30;
    if (data.html.includes('json-ld')) technical += 30;

    // 限制分数范围
    relevance = Math.min(100, Math.max(0, relevance));
    credibility = Math.min(100, Math.max(0, credibility));
    contact = Math.min(100, Math.max(0, contact));
    content = Math.min(100, Math.max(0, content));
    technical = Math.min(100, Math.max(0, technical));

    // 计算综合评分
    const overall = Math.round(
      (relevance * 0.3 + credibility * 0.25 + contact * 0.25 + content * 0.15 + technical * 0.05)
    );

    return {
      overall,
      relevance,
      credibility,
      contact,
      content,
      technical,
    };
  }

  /**
   * 构建高级搜索查询
   * 简化查询以避免Google Custom Search API的400错误
   */
  private buildAdvancedSearchQuery(query: CompanySearchQuery): string {
    const searchParts: string[] = [];
    
    // 核心关键词 - 使用简单的引号匹配
    if (query.keywords.length > 0) {
      // 对于多个关键词，只使用第一个主要关键词
      const mainKeyword = query.keywords[0];
      searchParts.push(`"${mainKeyword}"`);
    }
    
    // 添加通用公司标识词，但保持简单
    searchParts.push('company OR corporation OR ltd OR inc OR llc');
    
    // 地理位置 - 暂时注释掉以避免查询过于复杂导致400错误
    // 后续可以在fallback机制中单独处理地理位置
    // if (query.location) {
    //   searchParts.push(`"${query.location}"`);
    // }
    
    // 行业信息 - 如果提供的话
    if (query.industry) {
      searchParts.push(`"${query.industry}"`);
    }
    
    // 简单排除主要社交媒体站点
    const excludeSites = [
      '-site:linkedin.com',
      '-site:facebook.com',
      '-site:twitter.com'
    ];
    
    // 组合搜索查询 - 使用空格分隔，让Google自然处理
    let finalQuery = searchParts.join(' ');
    
    // 添加站点排除
    if (excludeSites.length > 0) {
      finalQuery += ' ' + excludeSites.join(' ');
    }
    
    console.log(`🔍 构建的搜索查询: ${finalQuery}`);
    return finalQuery;
  }

  /**
   * 清理文本
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .trim()
      .substring(0, 500); // 限制长度
  }
}