# 🌍 外贸小助手 - AI驱动的客户开发平台

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.24-lightgrey.svg)](https://www.fastify.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

基于AI的外贸客户发现、分析和联系工具，采用模块化架构，支持从Excel导入到AI对话的完整业务流程。集成阿里云通义千问大模型，提供智能化的客户开发解决方案。

## ✨ 核心功能

- 🤖 **智能AI助手** - 基于Qwen-Plus的流式对话，支持外贸业务咨询
- 📊 **客户数据管理** - Excel批量导入，智能数据标准化和验证
- 🔍 **智能线索评分** - 多维度评分模型，精准识别高价值客户
- ✍️ **多语言内容生成** - 自动生成开发信、跟进邮件等商务内容
- 📈 **数据分析报表** - 客户分布、转化率等业务指标可视化
- 🌐 **RAG智能检索** - 基于公司数据的语义搜索和知识问答

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 
- **操作系统**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

### 1️⃣ 克隆项目

```bash
git clone https://github.com/your-repo/foreign-trade-assistant.git
cd foreign-trade-assistant
```

### 2️⃣ 安装依赖

```bash
# 安装所有workspace依赖
pnpm install

# 验证安装
pnpm --version
node --version
```

### 3️⃣ 环境配置

```bash
# 复制环境变量模板
cp env.example .env.local

# 编辑配置文件
nano .env.local  # 或使用你喜欢的编辑器
```

**必填配置项**:
```env
# 阿里云DashScope API密钥 (必填)
DASHSCOPE_API_KEY=sk-your-api-key-here

# API端点选择 (根据地区)
# 海外用户 (推荐)
DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
# 国内用户
# DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 应用配置
NODE_ENV=development
PORT=3000
```

### 4️⃣ 启动开发环境

```bash
# 一键启动所有服务
pnpm dev

# 或者分别启动
pnpm --filter @trade-assistant/service-agent dev  # Agent服务
pnpm --filter @trade-assistant/web dev            # Web前端
```

启动成功后，您将看到：
```
✅ 开发环境启动完成！
🌐 前端界面: http://localhost:3000
💬 AI助手: http://localhost:3000/agent
🏢 客户管理: http://localhost:3000/companies
🔍 Agent API: http://localhost:3001/api/agent/health
```

### 5️⃣ 验证部署

```bash
# 检查Agent服务状态
curl http://localhost:3001/api/agent/health

# 测试AI对话功能
curl -X POST http://localhost:3001/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "你好，请介绍一下你的功能"}],
    "useRag": true
  }'
```

## 📁 项目架构

### 总体结构
```
foreign-trade-assistant/
├── 📁 apps/                          # 应用程序
│   ├── 📁 web/                       # Next.js 前端应用
│   └── 📁 service-agent/             # Fastify Agent服务
├── 📁 packages/                      # 共享包
│   ├── 📁 dto/                       # 数据传输对象和类型定义
│   ├── 📁 clients/                   # 服务客户端 (预留)
│   ├── 📁 providers/                 # 插件提供者 (预留)
│   └── 📁 utilities/                 # 公共工具库 (预留)
├── 📁 docs/                          # 项目文档
│   └── 📁 api/                       # API文档
├── 📁 scripts/                       # 构建和部署脚本
├── 📁 ops/                          # 运维配置 (预留)
├── 📄 docker-compose.yml            # Docker编排配置
├── 📄 Dockerfile.agent              # Agent服务Docker镜像
├── 📄 turbo.json                    # Turbo构建配置
├── 📄 pnpm-workspace.yaml           # pnpm工作区配置
└── 📄 package.json                  # 根项目配置
```

### 前端应用 (`apps/web/`)

基于 **Next.js 14** 构建的现代化单页应用，采用 App Router 和 TypeScript。

```
apps/web/
├── 📁 src/
│   ├── 📁 app/                       # Next.js App Router页面
│   │   ├── 📄 layout.tsx             # 全局布局组件
│   │   ├── 📄 page.tsx               # 首页 - 客户列表和搜索
│   │   ├── 📄 globals.css            # 全局样式 (Tailwind CSS)
│   │   ├── 📁 agent/                 # AI助手页面
│   │   │   └── 📄 page.tsx           # 智能对话界面
│   │   ├── 📁 companies/             # 客户管理
│   │   │   ├── 📄 page.tsx           # 客户列表页
│   │   │   └── 📁 [id]/              # 动态路由
│   │   │       └── 📄 page.tsx       # 客户详情页 (评分/联系人/证据)
│   │   ├── 📁 demo/                  # 功能演示
│   │   │   └── 📄 page.tsx           # Demo展示页面
│   │   ├── 📁 import/                # 数据导入
│   │   │   └── 📄 page.tsx           # Excel上传和处理
│   │   └── 📁 reports/               # 数据报表
│   │       └── 📄 page.tsx           # 统计图表和分析
│   ├── 📁 components/                # React组件库
│   │   ├── 📁 agent/                 # AI助手相关组件
│   │   │   └── 📄 AgentPanel.tsx     # 聊天界面主组件
│   │   ├── 📁 common/                # 通用组件
│   │   │   └── 📄 StatusPill.tsx     # 状态标签组件
│   │   ├── 📁 compose/               # 内容生成组件
│   │   │   └── 📄 MessageComposer.tsx # 邮件/消息撰写器
│   │   ├── 📁 evidence/              # 证据展示组件
│   │   │   ├── 📄 EvidenceList.tsx   # 证据源列表
│   │   │   └── 📄 EvidencePreview.tsx # 证据内容预览
│   │   ├── 📁 import/                # 数据导入组件
│   │   │   └── 📄 FileDropzone.tsx   # 文件拖拽上传
│   │   ├── 📁 layout/                # 布局组件
│   │   │   └── 📄 Navigation.tsx     # 顶部导航栏
│   │   ├── 📁 people/                # 联系人组件
│   │   │   ├── 📄 ContactCard.tsx    # 联系人卡片
│   │   │   └── 📄 ContactList.tsx    # 联系人列表
│   │   ├── 📁 score/                 # 评分组件
│   │   │   └── 📄 ScoreGauge.tsx     # 评分仪表盘
│   │   └── 📁 table/                 # 表格组件
│   │       └── 📄 LeadsTable.tsx     # 客户线索表格
│   ├── 📁 lib/                       # 工具库
│   │   ├── 📄 api.ts                 # API客户端和Mock数据
│   │   └── 📄 utils.ts               # 通用工具函数
│   └── 📁 types/                     # TypeScript类型定义
│       └── 📄 index.ts               # 前端类型汇总
├── 📄 package.json                   # 依赖和脚本配置
├── 📄 next.config.js                 # Next.js配置
├── 📄 tailwind.config.js             # Tailwind CSS配置
├── 📄 postcss.config.js              # PostCSS配置
└── 📄 tsconfig.json                  # TypeScript配置
```

**主要技术栈**:
- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS + HeadlessUI
- **状态管理**: React Hooks + Context API
- **HTTP客户端**: Fetch API
- **表单处理**: React Hook Form
- **文件上传**: React Dropzone

### Agent服务 (`apps/service-agent/`)

基于 **Fastify** 构建的高性能API服务，集成阿里云通义千问大模型。

```
apps/service-agent/
├── 📁 src/
│   ├── 📄 index.ts                   # 服务启动入口
│   ├── 📁 lib/                       # 核心业务逻辑
│   │   ├── 📄 qwen.ts                # 通义千问API封装
│   │   ├── 📄 rag.ts                 # RAG检索系统 (占位实现)
│   │   └── 📁 __tests__/             # 单元测试
│   │       └── 📄 rag.test.ts        # RAG功能测试
│   └── 📁 routes/                    # API路由定义
│       └── 📄 agent.ts               # Agent相关路由
├── 📄 package.json                   # 依赖配置
├── 📄 tsconfig.json                  # TypeScript配置
└── 📄 jest.config.js                 # Jest测试配置
```

**API端点**:
- `GET /api/agent/health` - 服务健康检查
- `POST /api/agent/chat` - 普通聊天接口
- `POST /api/agent/chat/stream` - 流式聊天接口

**主要技术栈**:
- **框架**: Fastify 4.x
- **AI集成**: OpenAI SDK (兼容通义千问)
- **类型验证**: Zod schemas
- **测试框架**: Jest
- **开发工具**: tsx (TypeScript执行器)

### 共享包 (`packages/`)

#### DTO包 (`packages/dto/`)
统一的数据传输对象和类型定义，确保前后端类型安全。

```
packages/dto/src/
├── 📄 index.ts                       # 导出汇总
├── 📄 agent.ts                       # Agent相关类型
├── 📄 chat.ts                        # 聊天消息类型
├── 📄 company.ts                     # 公司数据类型
└── 📄 events.ts                      # 事件埋点类型
```

**主要类型**:
- `Company` - 公司基础信息
- `Contact` - 联系人信息
- `LeadScore` - 线索评分数据
- `AgentMessage` - AI对话消息
- `BatchUploadResult` - 批量上传结果

### 配置文件详解

#### 根目录配置
- **`package.json`** - 项目元信息、脚本命令、开发依赖
- **`pnpm-workspace.yaml`** - pnpm工作区配置，定义子包路径
- **`turbo.json`** - Turbo构建系统配置，定义任务依赖关系
- **`.env.example`** - 环境变量模板文件
- **`.gitignore`** - Git忽略规则
- **`.prettierignore`** - Prettier格式化忽略规则

#### 部署配置
- **`docker-compose.yml`** - Docker编排配置，定义服务依赖
- **`Dockerfile.agent`** - Agent服务的Docker镜像构建文件

#### 开发工具
- **`scripts/dev.js`** - 开发环境启动脚本，并行启动多个服务

## 🛠 开发指南

### 添加新功能

1. **定义数据类型**
   ```bash
   # 在packages/dto/src/中添加新的类型定义
   echo "export interface NewFeature { ... }" >> packages/dto/src/new-feature.ts
   ```

2. **实现后端API**
   ```bash
   # 在apps/service-agent/src/routes/中添加路由
   # 在apps/service-agent/src/lib/中添加业务逻辑
   ```

3. **开发前端组件**
   ```bash
   # 在apps/web/src/components/中添加组件
   # 在apps/web/src/app/中添加页面
   ```

4. **编写测试**
   ```bash
   # 运行测试
   pnpm test
   
   # 类型检查
   pnpm type-check
   ```

### 常用开发命令

```bash
# 开发环境
pnpm dev                              # 启动所有服务
pnpm --filter @trade-assistant/web dev          # 仅启动前端
pnpm --filter @trade-assistant/service-agent dev # 仅启动Agent服务

# 构建和部署
pnpm build                            # 构建所有项目
pnpm start                            # 启动生产环境

# 代码质量
pnpm lint                             # ESLint检查
pnpm format                           # Prettier格式化
pnpm type-check                       # TypeScript类型检查

# 测试
pnpm test                             # 运行所有测试
pnpm test:watch                       # 监视模式测试

# Docker
pnpm docker:build                     # 构建Docker镜像
pnpm docker:up                        # 启动容器
pnpm docker:down                      # 停止容器
```

### 调试技巧

1. **查看实时日志**
   ```bash
   # 开发模式会显示彩色日志
   # 🔵 Agent服务日志
   # 🟢 Web前端日志
   ```

2. **API测试**
   ```bash
   # 使用curl测试API
   curl -X POST http://localhost:3001/api/agent/chat \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"role": "user", "content": "测试"}]}'
   ```

3. **性能监控**
   - Agent服务: http://localhost:3001/api/agent/health
   - 前端开发服务器: 控制台网络面板

## 🤖 AI功能详解

### 通义千问集成

项目集成了阿里云**通义千问-Plus**大模型，提供以下能力：

- **流式对话**: 实时响应，提升用户体验
- **上下文记忆**: 支持多轮对话，理解对话历史
- **专业知识**: 针对外贸业务场景优化
- **多语言支持**: 中英文无缝切换

### RAG检索系统 (开发中)

基于向量数据库的智能检索系统：

- **语义搜索**: 理解用户意图，精准匹配相关信息
- **文档切片**: 自动分割长文档，提高检索效率  
- **上下文融合**: 将检索结果融入AI对话
- **实时更新**: 新数据自动索引，保持信息时效性

### 当前功能状态

| 功能模块 | 状态 | 描述 |
|---------|------|------|
| ✅ AI对话 | 已完成 | 基于Qwen-Plus的流式对话 |
| ✅ 会话管理 | 已完成 | 多轮对话上下文保持 |
| 🔄 RAG检索 | 占位实现 | 预留接口，待向量数据库集成 |
| 🔄 工具调用 | 规划中 | 邮件生成、数据分析等工具 |
| 🔄 多模态 | 规划中 | 图片、文档理解能力 |

## 📊 功能模块详解

### 1. 客户数据管理

- **Excel导入**: 支持.xlsx/.csv格式，自动数据验证
- **数据清洗**: 去重、格式标准化、缺失值处理
- **批量处理**: 支持大文件分片上传，进度实时显示
- **错误报告**: 详细的数据质量分析和修复建议

### 2. 智能线索评分

多维度评分模型，综合评估客户价值：

| 评分维度 | 权重 | 说明 |
|---------|------|------|
| 个人邮箱质量 | 30% | 个人邮箱vs通用邮箱 |
| 直线电话 | 20% | 是否有直接联系电话 |
| 网站活跃度 | 15% | 网站更新频率和内容质量 |
| 公司规模 | 20% | 员工数量、年收入等指标 |
| 采购意向 | 15% | 网站内容显示的采购需求 |

### 3. 内容生成系统

基于AI的多语言内容生成：

- **开发信模板**: 针对不同行业和地区的个性化邮件
- **跟进话术**: 电话、WhatsApp、LinkedIn等渠道
- **产品介绍**: 根据客户需求自动调整重点
- **文化适配**: 考虑不同国家的商务文化差异

### 4. 数据分析报表

可视化业务数据，支持决策制定：

- **客户分布图**: 按地区、行业、规模分析
- **转化漏斗**: 从线索到成交的全流程追踪
- **ROI分析**: 投入产出比和成本效益
- **趋势预测**: 基于历史数据的业务预测

## 🔮 开发路线图

### Phase 1: 核心数据流 (开发中)
- [ ] **Excel上传系统** - 支持大文件、数据验证、错误处理
- [ ] **网页抓取引擎** - Google搜索集成、反爬虫策略
- [ ] **信息提取AI** - 联系人、邮箱、电话自动识别
- [ ] **评分算法** - 多维度评分模型实现
- [ ] **证据链系统** - 评分依据可追溯性

### Phase 2: RAG智能增强 (规划中)
- [ ] **向量数据库** - pgvector或Qdrant集成
- [ ] **文本嵌入** - 阿里云文本嵌入API
- [ ] **混合检索** - 向量搜索+关键词匹配
- [ ] **工具函数** - 邮件生成、市场分析等AI工具
- [ ] **多语言支持** - 跨语言语义搜索

### Phase 3: 生产优化 (规划中)
- [ ] **数据库设计** - PostgreSQL schema优化
- [ ] **缓存系统** - Redis集成，提升性能
- [ ] **任务队列** - 异步处理大批量任务
- [ ] **监控告警** - 应用性能监控和异常告警
- [ ] **安全加固** - 认证授权、数据加密

### Phase 4: 高级功能 (规划中)
- [ ] **A/B测试框架** - 策略效果对比分析
- [ ] **多模态AI** - 图片、PDF文档处理
- [ ] **CRM集成** - Salesforce、HubSpot等
- [ ] **移动端适配** - PWA支持、移动端优化
- [ ] **API开放平台** - 第三方集成接口

## 🚨 常见问题

### 环境配置问题

**Q: Agent服务显示 `API_KEY: undefined`**
```bash
# 检查环境变量是否正确加载
cat .env.local | grep DASHSCOPE_API_KEY

# 确保文件在项目根目录
ls -la .env.local

# 重启服务
pnpm dev
```

**Q: 前端显示网络错误**
```bash
# 确认Agent服务运行状态
curl http://localhost:3001/api/agent/health

# 检查端口占用
netstat -an | grep :3001
```

**Q: pnpm安装依赖失败**
```bash
# 清理缓存重新安装
pnpm store prune
rm -rf node_modules
pnpm install
```

### 开发调试问题

**Q: TypeScript类型错误**
```bash
# 运行类型检查
pnpm type-check

# 查看具体错误信息
pnpm --filter @trade-assistant/web type-check
```

**Q: 构建失败**
```bash
# 清理构建缓存
pnpm clean
pnpm build

# 查看详细日志
pnpm build --verbose
```

### 功能使用问题

**Q: AI对话没有响应**
- 检查DASHSCOPE_API_KEY是否有效
- 确认网络连接正常
- 查看控制台错误日志

**Q: Excel导入失败**
- 确认文件格式为.xlsx或.csv
- 检查文件大小是否超限
- 验证数据格式是否正确

## 🤝 贡献指南

### 开发流程

1. **Fork项目** 并创建功能分支
2. **遵循代码规范** - ESLint + Prettier
3. **编写测试** - 确保测试覆盖率
4. **提交PR** - 详细描述变更内容

### 代码规范

```bash
# 格式化代码
pnpm format

# 检查代码质量
pnpm lint

# 运行测试
pnpm test
```

### 提交信息规范

```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建工具或辅助工具的变动
```

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [阿里云通义千问](https://dashscope.aliyun.com/) - AI大模型支持
- [Next.js](https://nextjs.org/) - React全栈框架
- [Fastify](https://www.fastify.io/) - 高性能Node.js框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架

## 📞 技术支持

- **文档**: [项目Wiki](https://github.com/your-repo/foreign-trade-assistant/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/foreign-trade-assistant/issues)
- **讨论**: [GitHub Discussions](https://github.com/your-repo/foreign-trade-assistant/discussions)

---

**⚠️ 重要提醒**: 
1. 请妥善保管您的API密钥，不要将其提交到版本控制系统
2. 生产环境请使用HTTPS和适当的安全措施
3. 遵守相关法律法规，合规使用数据抓取功能

**🎯 项目愿景**: 构建最智能、最易用的外贸客户开发工具，让每个外贸人都能享受AI技术带来的效率提升。