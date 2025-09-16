/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@trade-assistant/dto'],
  async rewrites() {
    const agentApiUrl = process.env.AGENT_API_URL || 'http://localhost:3001';
    console.log('Agent API URL:', agentApiUrl);
    
    return [
      {
        source: '/api/agent/:path*',
        destination: `${agentApiUrl}/api/agent/:path*`,
      },
    ];
  },
  env: {
    AGENT_API_URL: process.env.AGENT_API_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;