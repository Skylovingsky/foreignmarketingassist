#!/usr/bin/env node
/**
 * 测试简化的搜索查询构建
 */

const { URL } = require('url');

const GOOGLE_API_KEY = 'AIzaSyCV_75iN7AEtYx4C4t-jz6HIqyGWj8pHck';
const GOOGLE_SEARCH_ENGINE_ID = '11dd97b987e454433';

// 简化的搜索查询构建逻辑
function buildSimplifiedSearchQuery(query) {
    const searchParts = [];
    
    // 核心关键词 - 使用简单的引号匹配
    if (query.keywords && query.keywords.length > 0) {
      // 对于多个关键词，只使用第一个主要关键词
      const mainKeyword = query.keywords[0];
      searchParts.push(`"${mainKeyword}"`);
    }
    
    // 添加通用公司标识词，但保持简单
    searchParts.push('company OR corporation OR ltd OR inc OR llc');
    
    // 地理位置 - 如果提供的话，添加到搜索中
    if (query.location) {
      searchParts.push(`"${query.location}"`);
    }
    
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
    
    return finalQuery;
}

async function testSimplifiedQuery(companyName) {
  console.log(`🔍 测试公司: ${companyName}\n`);
  
  // 构建查询对象
  const query = {
    keywords: [companyName],
    maxResults: 10
  };
  
  const searchTerms = buildSimplifiedSearchQuery(query);
  console.log(`📋 生成的简化搜索查询:\n${searchTerms}\n`);
  
  // 测试这个查询
  try {
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);
    searchUrl.searchParams.set('cx', GOOGLE_SEARCH_ENGINE_ID);
    searchUrl.searchParams.set('q', searchTerms);
    searchUrl.searchParams.set('num', String(query.maxResults || 10));
    
    console.log(`📡 请求URL长度: ${searchUrl.toString().length} 字符`);
    
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
        console.log(`   前5个结果:`);
        data.items.slice(0, 5).forEach((item, index) => {
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
    await testSimplifiedQuery(company);
    console.log('\n' + '='.repeat(80) + '\n');
  }
}

runTests().catch(console.error);