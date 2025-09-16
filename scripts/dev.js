#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(color, prefix, message) {
  console.log(`${color}${colors.bright}[${prefix}]${colors.reset} ${message}`);
}

// 检查环境变量
function checkEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  try {
    require('fs').accessSync(envPath);
    colorLog(colors.green, 'ENV', '环境变量文件已找到');
  } catch (error) {
    colorLog(colors.yellow, 'ENV', '警告: .env.local 文件不存在，请复制 env.example');
  }
}

// 启动服务
function startService(name, command, cwd, color) {
  const child = spawn('sh', ['-c', command], {
    cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      colorLog(color, name, line);
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      colorLog(colors.red, name, line);
    });
  });

  child.on('close', (code) => {
    colorLog(colors.red, name, `进程退出，代码: ${code}`);
  });

  return child;
}

async function main() {
  colorLog(colors.cyan, 'INIT', '🚀 启动外贸小助手开发环境...');
  
  // 检查环境变量
  checkEnv();
  
  const rootDir = path.join(__dirname, '..');
  
  // 启动 Agent 服务
  colorLog(colors.blue, 'AGENT', '启动 Agent API 服务...');
  const agentProcess = startService(
    'AGENT',
    'pnpm --filter @trade-assistant/service-agent dev',
    rootDir,
    colors.blue
  );

  // 等待一下让Agent服务启动
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 启动 Web 服务
  colorLog(colors.green, 'WEB', '启动 Web 前端服务...');
  const webProcess = startService(
    'WEB',
    'pnpm --filter @trade-assistant/web dev',
    rootDir,
    colors.green
  );

  // 输出启动信息
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    colorLog(colors.cyan, 'SUCCESS', '✅ 开发环境启动完成！');
    console.log('');
    colorLog(colors.green, 'WEB', '🌐 前端界面: http://localhost:3000');
    colorLog(colors.green, 'WEB', '💬 AI助手: http://localhost:3000/agent');
    colorLog(colors.blue, 'AGENT', '🔍 Agent API: http://localhost:3001/api/agent/health');
    console.log('');
    colorLog(colors.yellow, 'INFO', '按 Ctrl+C 停止所有服务');
    console.log('='.repeat(60) + '\n');
  }, 5000);

  // 优雅关闭处理
  process.on('SIGINT', () => {
    colorLog(colors.yellow, 'SHUTDOWN', '正在关闭所有服务...');
    agentProcess.kill();
    webProcess.kill();
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });
}

main().catch((error) => {
  console.error('启动失败:', error);
  process.exit(1);
});