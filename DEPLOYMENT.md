# 🚀 外贸小助手 - 在线部署指南

## ✅ 部署完成状态

您的外贸小助手项目已成功部署到线上环境！

### 🌐 访问地址

| 服务名称 | 访问地址 | 说明 |
|---------|---------|------|
| **前端界面** | [https://3000-ibr8pve55krqf22np4xrh-6532622b.e2b.dev](https://3000-ibr8pve55krqf22np4xrh-6532622b.e2b.dev) | 主要用户界面 |
| **Agent API** | [https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev](https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev) | AI助手API服务 |

### 📋 功能页面

- **主页（客户管理）**: [https://3000-ibr8pve55krqf22np4xrh-6532622b.e2b.dev](https://3000-ibr8pve55krqf22np4xrh-6532622b.e2b.dev)
- **AI助手对话**: [https://3000-ibr8pve55krqf22np4xrh-6532622b.e2b.dev/agent](https://3000-ibr8pve55krqf22np4xrh-6532622b.e2b.dev/agent)
- **API健康检查**: [https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev/api/agent/health](https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev/api/agent/health)

## 🏗️ 项目架构

### 前端 (Next.js 14)
- **框架**: Next.js 14 with App Router
- **样式**: Tailwind CSS
- **端口**: 3000
- **功能**: 
  - 客户数据管理界面
  - AI助手聊天界面
  - 响应式设计

### 后端 (Fastify API)
- **框架**: Fastify 4.x
- **AI集成**: 阿里云通义千问 (Qwen-Plus)
- **端口**: 3001
- **功能**:
  - AI对话API
  - RAG知识检索 (占位实现)
  - 流式聊天支持

## ⚙️ 技术栈

### 核心技术
- **Node.js**: >= 18.0.0
- **TypeScript**: 5.2+
- **Next.js**: 14.x (App Router)
- **Fastify**: 4.x
- **Tailwind CSS**: 3.x

### AI & 数据
- **阿里云通义千问**: Qwen-Plus模型
- **OpenAI SDK**: 兼容通义千问API
- **类型安全**: Zod schemas验证

### 部署 & 运维
- **PM2**: 进程管理和守护
- **环境变量**: 配置管理
- **日志**: 结构化日志输出

## 📦 项目结构

```
foreign-trade-assistant/
├── 📁 apps/
│   ├── 📁 web/                    # Next.js前端应用
│   │   ├── src/app/               # 页面和布局
│   │   ├── src/components/        # React组件
│   │   └── package.json
│   └── 📁 service-agent/          # Fastify API服务
│       ├── src/lib/               # 业务逻辑
│       ├── src/routes/            # API路由
│       └── package.json
├── 📁 packages/
│   └── 📁 dto/                    # 共享类型定义
│       └── src/
├── 📁 logs/                       # PM2日志文件
├── 📄 ecosystem.config.js         # PM2配置
├── 📄 .env.local                  # 环境变量
└── 📄 package.json                # 根配置
```

## 🔧 服务管理

### PM2 命令

```bash
# 查看服务状态
npx pm2 status

# 查看日志
npx pm2 logs --nostream

# 重启服务
npx pm2 restart all

# 停止服务
npx pm2 stop all

# 删除服务
npx pm2 delete all
```

### 当前运行的服务

```
┌────┬──────────────────────────┬─────────┬────────┬───────────┬──────────┐
│ id │ name                     │ mode    │ pid    │ status    │ memory   │
├────┼──────────────────────────┼─────────┼────────┼───────────┼──────────┤
│ 0  │ trade-assistant-agent    │ cluster │ 5238   │ online    │ ~40MB    │
│ 1  │ trade-assistant-web      │ cluster │ 4984   │ online    │ ~75MB    │
└────┴──────────────────────────┴─────────┴────────┴───────────┴──────────┘
```

## 🛠️ 配置说明

### 环境变量

主要配置在 `.env.local` 文件中:

```env
# 阿里云通义千问API
DASHSCOPE_API_KEY=sk-demo-key-placeholder
DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1

# 服务端口
PORT=3001
HOST=0.0.0.0

# API服务地址  
AGENT_API_URL=http://localhost:3001
```

⚠️ **重要**: 为了使AI功能正常工作，需要配置真实的通义千问API密钥。

### API接口

- `GET /api/agent/health` - 服务健康检查
- `POST /api/agent/chat` - 普通聊天接口
- `POST /api/agent/chat/stream` - 流式聊天接口

## 🚀 快速开始使用

1. **访问前端界面**: [https://3000-ibr8pve55krqf22np4xrh-6532622b.e2b.dev](https://3000-ibr8pve55krqf22np4xrh-6532622b.e2b.dev)

2. **体验AI助手**: [https://3000-ibr8pve55krqf22np4xrh-6532622b.e2b.dev/agent](https://3000-ibr8pve55krqf22np4xrh-6532622b.e2b.dev/agent)

3. **查看客户管理**: 浏览mock客户数据和统计信息

4. **测试对话功能**: 在AI助手页面与智能助手对话

## 🔮 后续开发

### 待实现功能
- [ ] Excel数据导入
- [ ] 真实客户数据管理
- [ ] 线索评分算法
- [ ] RAG知识库集成
- [ ] 多语言开发信生成
- [ ] 数据分析报表

### 技术升级
- [ ] 数据库集成 (PostgreSQL)
- [ ] 缓存系统 (Redis)
- [ ] 用户认证授权
- [ ] 向量数据库 (RAG)
- [ ] 监控告警系统

## 📞 技术支持

- **项目仓库**: [GitHub Repository](https://github.com/Skylovingsky/foreignmarketingassist)
- **问题反馈**: 通过GitHub Issues提交
- **文档更新**: 随项目开发持续更新

---

**🎉 恭喜！您的外贸小助手已成功部署上线，开始您的智能化客户开发之旅吧！**