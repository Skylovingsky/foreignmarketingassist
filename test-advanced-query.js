#!/usr/bin/env node
/**
 * 测试高级搜索查询构建
 * 模拟实际服务中的查询构建过程
 */

const { URL } = require('url');

const GOOGLE_API_KEY = 'AIzaSyCV_75iN7AEtYx4C4t-jz6HIqyGWj8pHck';
const GOOGLE_SEARCH_ENGINE_ID = '11dd97b987e454433';

// 模拟原始的高级搜索查询构建逻辑
function buildAdvancedSearchQuery(query) {
    const searchParts = [];
    
    // 核心关键词 - 使用引号确保精确匹配
    if (query.keywords && query.keywords.length > 0) {
      const keywordQuery = query.keywords.map(kw => `"${kw}"`).join(' OR ');
      searchParts.push(`(${keywordQuery})`);
    }
    
    // 行业相关搜索
    if (query.industry) {
      const industryTerms = [
        `"${query.industry}"`,
        `industry:"${query.industry}"`,
        `sector:"${query.industry}"`,
      ];
      searchParts.push(`(${industryTerms.join(' OR ')})`);
    }
    
    // 地理位置
    if (query.location) {
      const locationTerms = [
        `"${query.location}"`,
        `location:"${query.location}"`,
        `based:"${query.location}"`,
        `headquarters:"${query.location}"`,
      ];
      searchParts.push(`(${locationTerms.join(' OR ')})`);
    }
    
    // 公司规模
    if (query.size) {
      const sizeTerms = [
        `employees:"${query.size}"`,
        `size:"${query.size}"`,
        `staff:"${query.size}"`,
      ];
      searchParts.push(`(${sizeTerms.join(' OR ')})`);
    }
    
    // 公司类型标识符 - 确保找到的是公司
    const companyIdentifiers = [
      'company', 'corporation', 'corp', 'ltd', 'limited', 
      'inc', 'incorporated', 'llc', 'co', 'enterprise',
      'group', 'holdings', 'solutions', 'services', 'systems',
    ];
    searchParts.push(`(${companyIdentifiers.join(' OR ')})`);
    
    // 排除不相关的站点
    const excludeSites = [
      '-site:linkedin.com',
      '-site:facebook.com', 
      '-site:twitter.com',
      '-site:instagram.com',
      '-site:youtube.com',
      '-site:wikipedia.org',
      '-site:crunchbase.com',
    ];
    
    // 组合搜索查询
    let finalQuery = searchParts.join(' AND ');
    finalQuery += ' ' + excludeSites.join(' ');
    
    return finalQuery;
}

async function testAdvancedQuery(companyName) {
  console.log(`🔍 测试公司: ${companyName}\n`);
  
  // 构建查询对象，模拟实际服务中的查询
  const query = {
    keywords: [companyName],
    maxResults: 15
  };
  
  const searchTerms = buildAdvancedSearchQuery(query);
  console.log(`📋 生成的高级搜索查询:\n${searchTerms}\n`);
  
  // 测试这个查询
  try {
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);
    searchUrl.searchParams.set('cx', GOOGLE_SEARCH_ENGINE_ID);
    searchUrl.searchParams.set('q', searchTerms);
    searchUrl.searchParams.set('num', String(query.maxResults || 10));
    
    console.log(`📡 请求URL长度: ${searchUrl.toString().length} 字符`);
    console.log(`📡 完整URL: ${searchUrl.toString()}\n`);
    
    const response = await fetch(searchUrl.toString());
    const responseText = await response.text();
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log(`❌ 错误响应:`);
      
      try {
        const errorData = JSON.parse(responseText);
        console.log(`   错误信息: ${JSON.stringify(errorData, null, 2)}`);
      } catch (parseError) {
        console.log(`   原始错误响应: ${responseText.substring(0, 500)}...`);
      }
      
      return false;
    } else {
      const data = JSON.parse(responseText);
      console.log(`✅ 成功! 找到 ${data.items ? data.items.length : 0} 个结果`);
      
      if (data.items && data.items.length > 0) {
        console.log(`   前3个结果:`);
        data.items.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title} - ${item.displayLink}`);
        });
      }
      
      return true;
    }
  } catch (error) {
    console.log(`❌ 网络错误: ${error.message}`);
    return false;
  }
}

async function runTests() {
  // 测试几个不同的公司名称
  const testCompanies = [
    'INDUSTRIAL ANDEAN TOOLS S.R.L.',
    'Apple Inc',
    'Microsoft Corporation',
    'Test Company Ltd'
  ];
  
  for (const company of testCompanies) {
    await testAdvancedQuery(company);
    console.log('\n' + '='.repeat(80) + '\n');
  }
}

runTests().catch(console.error);