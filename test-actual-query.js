#!/usr/bin/env node
/**
 * 测试实际生成的查询
 */

const { URL } = require('url');

const GOOGLE_API_KEY = 'AIzaSyCV_75iN7AEtYx4C4t-jz6HIqyGWj8pHck';
const GOOGLE_SEARCH_ENGINE_ID = '11dd97b987e454433';

async function testActualQuery() {
  // 这是从日志中看到的实际查询
  const query = '"INDUSTRIAL ANDEAN TOOLS S.R.L." company OR corporation OR ltd OR inc OR llc -site:linkedin.com -site:facebook.com -site:twitter.com';
  
  console.log(`🔍 测试实际生成的查询:`);
  console.log(`📋 查询: ${query}\n`);
  
  try {
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);
    searchUrl.searchParams.set('cx', GOOGLE_SEARCH_ENGINE_ID);
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('num', '5');
    
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
      console.log(`📊 搜索信息:`);
      console.log(`   总结果数: ${data.searchInformation?.totalResults || '未知'}`);
      console.log(`   搜索时间: ${data.searchInformation?.searchTime || '未知'}秒`);
      
      if (data.items && data.items.length > 0) {
        console.log(`\n📋 搜索结果:`);
        data.items.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title}`);
          console.log(`      链接: ${item.link}`);
          console.log(`      摘要: ${item.snippet?.substring(0, 100)}...`);
          console.log(`      域名: ${item.displayLink}\n`);
        });
      } else {
        console.log(`\n❓ 没有找到结果的可能原因:`);
        console.log(`   1. 公司名称太具体，在网络上找不到匹配的内容`);
        console.log(`   2. 搜索条件过于严格`);
        console.log(`   3. 该公司可能没有官方网站或网络存在很少`);
      }
      
      return true;
    }
  } catch (error) {
    console.log(`❌ 网络错误: ${error.message}`);
    return false;
  }
}

async function testSimplifiedQuery() {
  // 测试一个更简单的查询
  const simpleQuery = '"INDUSTRIAL ANDEAN TOOLS"';
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 测试简化查询:`);
  console.log(`📋 查询: ${simpleQuery}\n`);
  
  try {
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);
    searchUrl.searchParams.set('cx', GOOGLE_SEARCH_ENGINE_ID);
    searchUrl.searchParams.set('q', simpleQuery);
    searchUrl.searchParams.set('num', '10');
    
    const response = await fetch(searchUrl.toString());
    const responseText = await response.text();
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log(`✅ 简化查询结果: 找到 ${data.items ? data.items.length : 0} 个结果`);
      
      if (data.items && data.items.length > 0) {
        console.log(`\n📋 前5个结果:`);
        data.items.slice(0, 5).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title} - ${item.displayLink}`);
        });
      }
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
  }
}

async function runTests() {
  await testActualQuery();
  await testSimplifiedQuery();
}

runTests().catch(console.error);