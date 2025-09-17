// Simple Google Custom Search API test
import('node-fetch').then(fetch => global.fetch = fetch.default);

// Load environment variables manually
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  }
});

async function testGoogleAPI() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  
  console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  console.log('🔍 Search Engine ID:', searchEngineId ? `${searchEngineId.substring(0, 10)}...` : 'NOT FOUND');
  
  if (!apiKey || !searchEngineId) {
    console.error('❌ Missing API credentials');
    return;
  }
  
  // Test with the simplest possible query
  const testQueries = [
    'test',
    'apple',
    '"apple"',
    'apple company'
  ];
  
  for (const query of testQueries) {
    try {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.set('key', apiKey);
      url.searchParams.set('cx', searchEngineId);
      url.searchParams.set('q', query);
      url.searchParams.set('num', '5');
      
      console.log(`📡 URL: ${url.toString()}`);
      
      const response = await fetch(url.toString());
      
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error Response:`, errorText);
      } else {
        const data = await response.json();
        console.log(`✅ Success: Found ${data.items ? data.items.length : 0} results`);
        if (data.searchInformation) {
          console.log(`📈 Total Results: ${data.searchInformation.totalResults}`);
        }
      }
    } catch (error) {
      console.error(`💥 Exception:`, error.message);
    }
  }
}

testGoogleAPI().catch(console.error);