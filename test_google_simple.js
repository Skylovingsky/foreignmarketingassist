// Simple Google Custom Search API test with curl
async function testGoogleAPI() {
  const apiKey = 'AIzaSyCV_75iN7AEtYx4C4t-jz6HIqyGWj8pHck';
  const searchEngineId = '11dd97b987e454433';
  
  console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
  console.log('🔍 Search Engine ID:', searchEngineId.substring(0, 10) + '...');
  
  const testQueries = [
    'test',
    'apple',
    '"apple"'
  ];
  
  for (const query of testQueries) {
    try {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=5`;
      
      console.log(`📡 URL: ${url}`);
      
      const response = await fetch(url);
      
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
        if (data.items && data.items.length > 0) {
          console.log(`🔗 First result: ${data.items[0].title} - ${data.items[0].link}`);
        }
      }
    } catch (error) {
      console.error(`💥 Exception:`, error.message);
    }
  }
}

testGoogleAPI().catch(console.error);