#!/usr/bin/env node
/**
 * Google Search API 诊断测试脚本
 * 用于诊断400错误的具体原因
 */

const https = require('https');
const { URL } = require('url');

// 从环境变量读取配置
const GOOGLE_API_KEY = 'AIzaSyCV_75iN7AEtYx4C4t-jz6HIqyGWj8pHck';
const GOOGLE_SEARCH_ENGINE_ID = '11dd97b987e454433';

async function testGoogleSearchAPI() {
  console.log('🔍 开始诊断 Google Custom Search API...\n');
  
  // 测试1: 简单查询
  console.log('📋 测试1: 简单查询');
  await testQuery('INDUSTRIAL ANDEAN TOOLS');
  
  // 测试2: 更简单的查询
  console.log('\n📋 测试2: 更简单的查询');
  await testQuery('test company');
  
  // 测试3: 单个词查询
  console.log('\n📋 测试3: 单个词查询');
  await testQuery('company');
  
  // 测试4: 检查API密钥和搜索引擎ID
  console.log('\n📋 测试4: API配置检查');
  console.log(`API Key: ${GOOGLE_API_KEY ? GOOGLE_API_KEY.substring(0, 10) + '...' : '未配置'}`);
  console.log(`Search Engine ID: ${GOOGLE_SEARCH_ENGINE_ID || '未配置'}`);
}

async function testQuery(query) {
  try {
    console.log(`  查询: "${query}"`);
    
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);
    searchUrl.searchParams.set('cx', GOOGLE_SEARCH_ENGINE_ID);
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('num', '5');
    
    console.log(`  请求URL: ${searchUrl.toString()}`);
    
    const response = await fetch(searchUrl.toString());
    const responseText = await response.text();
    
    console.log(`  状态码: ${response.status}`);
    console.log(`  状态文本: ${response.statusText}`);
    
    if (!response.ok) {
      console.log(`  ❌ 错误响应:`);
      
      try {
        const errorData = JSON.parse(responseText);
        console.log(`     错误信息: ${JSON.stringify(errorData, null, 2)}`);
        
        if (errorData.error) {
          console.log(`     错误代码: ${errorData.error.code}`);
          console.log(`     错误消息: ${errorData.error.message}`);
          
          if (errorData.error.details) {
            console.log(`     错误详情: ${JSON.stringify(errorData.error.details, null, 2)}`);
          }
        }
      } catch (parseError) {
        console.log(`     原始错误响应: ${responseText}`);
      }
      
      return false;
    } else {
      const data = JSON.parse(responseText);
      console.log(`  ✅ 成功! 找到 ${data.items ? data.items.length : 0} 个结果`);
      
      if (data.items && data.items.length > 0) {
        console.log(`     第一个结果: ${data.items[0].title}`);
      }
      
      return true;
    }
  } catch (error) {
    console.log(`  ❌ 网络错误: ${error.message}`);
    return false;
  }
}

// 运行测试
testGoogleSearchAPI().catch(console.error);