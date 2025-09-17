/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@trade-assistant/dto'],
  async rewrites() {
    const agentApiUrl = process.env.AGENT_API_URL || 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev';
    console.log('Agent API URL:', agentApiUrl);
    
    return [
      {
        source: '/api/agent/:path*',
        destination: `${agentApiUrl}/api/agent/:path*`,
      },
      {
        source: '/api/ai-search/:path*',
        destination: `${agentApiUrl}/api/ai-search/:path*`,
      },
    ];
  },
  env: {
    AGENT_API_URL: process.env.AGENT_API_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;