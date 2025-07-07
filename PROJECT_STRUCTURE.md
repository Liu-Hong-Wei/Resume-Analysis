# 简历分析系统项目结构

## 项目概述

这是一个基于React + Node.js的AI简历分析系统，支持上传简历文件并与AI助手进行智能对话。

## 目录结构

```
resume-analysis/
├── apps/
│   ├── client/                 # 前端React应用
│   │   ├── src/
│   │   │   ├── components/     # 可复用组件
│   │   │   │   ├── ResumeUpload.jsx      # 文件上传组件
│   │   │   │   ├── AnalysisTypeSelector.jsx  # 分析类型选择组件
│   │   │   │   ├── ChatInterface.jsx     # 对话界面组件
│   │   │   │   ├── ResumePreview.jsx     # 简历预览组件
│   │   │   │   └── ErrorAlert.jsx        # 错误提示组件
│   │   │   ├── hooks/          # 自定义Hook
│   │   │   │   └── useResumeAnalysis.js  # 简历分析逻辑Hook
│   │   │   ├── pages/          # 页面组件
│   │   │   │   └── Analysis.jsx          # 主分析页面
│   │   │   ├── App.jsx         # 应用根组件
│   │   │   └── main.jsx        # 应用入口
│   │   ├── package.json        # 前端依赖
│   │   └── vite.config.js      # Vite配置
│   └── server/                 # 后端Node.js应用
│       ├── index.js            # 服务器入口
│       ├── api-docs.md         # API文档
│       └── package.json        # 后端依赖
├── package.json                # 工作区配置
└── pnpm-workspace.yaml         # pnpm工作区配置
```

## 前端架构

### 组件分解

1. **ResumeUpload**: 处理文件上传功能
2. **AnalysisTypeSelector**: 选择分析类型
3. **ChatInterface**: AI对话界面
4. **ResumePreview**: 简历内容预览
5. **ErrorAlert**: 错误信息展示

### 自定义Hook

- **useResumeAnalysis**: 封装所有简历分析相关的状态管理和API调用逻辑

### 状态管理

- 使用React Hooks进行状态管理
- 通过自定义Hook集中管理复杂状态
- 组件间通过props传递数据和回调函数

## 后端架构

### API接口

1. **POST /api/analyze-resume**: 简历文件分析
2. **POST /api/chat-analysis**: AI对话接口
3. **GET /api/health**: 健康检查

### 中间件

- CORS跨域处理
- 文件上传处理 (multer)
- 错误处理中间件
- 请求大小限制

### 待实现功能

- 文件文本提取 (PDF, Word, TXT)
- LLM服务集成
- 数据持久化
- 用户认证

## 数据流

### 前端数据流

1. 用户上传文件 → ResumeUpload组件
2. 选择分析类型 → AnalysisTypeSelector组件
3. 点击分析按钮 → useResumeAnalysis Hook
4. API调用 → 后端服务器
5. 显示分析结果 → ChatInterface组件
6. 用户提问 → 继续对话

### 后端数据流

1. 接收文件上传 → multer中间件
2. 文件格式验证 → 文件过滤器
3. 文本提取 → 文件处理函数
4. LLM分析 → AI服务调用
5. 返回结果 → JSON响应

## 技术栈

### 前端

- **React 18**: 用户界面框架
- **Vite**: 构建工具
- **DaisyUI**: UI组件库
- **Tailwind CSS**: 样式框架

### 后端

- **Node.js**: 运行时环境
- **Express**: Web框架
- **Multer**: 文件上传处理
- **CORS**: 跨域资源共享

### 开发工具

- **pnpm**: 包管理器
- **ESLint**: 代码检查
- **Git**: 版本控制

## 开发指南

### 启动开发环境

```bash
# 安装依赖
pnpm install

# 启动前端 (端口5173)
cd apps/client && pnpm dev

# 启动后端 (端口3001)
cd apps/server && pnpm dev
```

### 代码规范

- 使用函数组件和Hooks
- 组件职责单一，可复用
- 使用TypeScript类型定义 (可选)
- 遵循ESLint规则

### 测试策略

- 组件单元测试
- API接口测试
- 端到端测试 (可选)

## 部署说明

### 前端部署

- 构建静态文件: `pnpm build`
- 部署到CDN或静态服务器

### 后端部署

- 使用PM2或Docker部署
- 配置环境变量
- 设置反向代理

## 扩展计划

### 功能扩展

- 用户注册登录
- 简历模板管理
- 分析历史记录
- 导出分析报告

### 技术扩展

- 数据库集成 (MongoDB/PostgreSQL)
- 缓存系统 (Redis)
- 消息队列 (RabbitMQ)
- 监控日志 (ELK Stack)
