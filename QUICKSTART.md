# 🚀 外贸小助手 - 快速启动指南

## 立即开始使用

### 1️⃣ 安装依赖
```bash
# 确保已安装 Node.js 18+ 和 pnpm
pnpm install
```

### 2️⃣ 配置API密钥
```bash
# 复制环境变量模板
cp env.example .env.local

# 编辑 .env.local，填入您的API密钥
# DASHSCOPE_API_KEY=sk-469ae5a3119e49e9afaadcd4f66980f5
```

### 3️⃣ 启动开发服务
```bash
# 一键启动所有服务
pnpm dev
```

等待几秒钟，看到以下提示即表示启动成功：
```
✅ 开发环境启动完成！
🌐 前端界面: http://localhost:3000
💬 AI助手: http://localhost:3000/agent
🏢 客户管理: http://localhost:3000/companies
🔍 Agent API: http://localhost:3001/api/agent/health
```

## 🎯 功能测试

### AI助手对话测试
1. 访问 http://localhost:3000/agent
2. 尝试以下对话：

**基础测试**
```
用户: 你好，请介绍一下你的功能
```

**业务场景测试**
```
用户: 我想开发德国的气动元件制造商，能给我一些建议吗？

用户: 帮我生成一封英文开发信，针对气动阀门制造商

用户: 分析一下欧洲市场的气动行业特点
```

### API直接测试
```bash
# 健康检查
curl http://localhost:3001/api/agent/health

# 聊天测试
curl -X POST http://localhost:3001/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "帮我分析气动行业的发展趋势"}
    ],
    "useRag": true
  }'
```

## 🔧 开发调试

### 查看日志
开发模式下会显示彩色日志：
- 🔵 **Agent服务**: 蓝色标签
- 🟢 **Web前端**: 绿色标签

### 单独启动服务
```bash
# 仅启动Agent服务
pnpm --filter @trade-assistant/service-agent dev

# 仅启动前端
pnpm --filter @trade-assistant/web dev
```

### 构建检查
```bash
# 类型检查
pnpm type-check

# 代码格式化
pnpm format

# 构建生产版本
pnpm build
```

## 🚨 常见问题

### Q: API调用失败，显示401错误
**A**: 检查 `.env.local` 中的 `DASHSCOPE_API_KEY` 是否正确配置

### Q: 前端显示"网络错误"
**A**: 确认Agent服务正在运行 (http://localhost:3001/api/agent/health)

### Q: 流式响应中断
**A**: 检查网络连接，或尝试刷新页面重新开始对话

### Q: pnpm安装依赖失败
**A**: 尝试清除缓存：`pnpm store prune && pnpm install`

## 📋 下一步

现在您已经成功运行了AI助手的核心功能！接下来可以：

1. **体验AI对话**: 在 `/agent` 页面测试各种业务场景
2. **查看代码结构**: 了解 `apps/service-agent` 和 `apps/web` 的实现
3. **扩展功能**: 添加新的Agent工具或前端组件
4. **集成数据**: 准备接入客户数据和长文本检索

## 🎉 恭喜！

您已经成功搭建了外贸小助手的开发环境。这是一个完整的AI驱动的客户开发平台基础架构，支持：

- ✅ **流式AI对话** (Qwen-Plus)
- ✅ **模块化架构** (Monorepo)
- ✅ **类型安全** (TypeScript + Zod)
- ✅ **RAG预留接口** (长文本检索占位)
- ✅ **现代前端** (Next.js 14 + Tailwind)

按照技术开发书的规划，后续将逐步添加客户发现、抓取、分析和决策闭环功能。

---

**需要帮助？** 查看完整的 [README.md](README.md) 或技术开发文档。
