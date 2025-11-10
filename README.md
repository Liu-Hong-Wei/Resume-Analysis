# 简历分析系统

一个基于AI的智能简历分析平台，支持简历评估、简历生成和模拟面试功能。

## 🚀 功能特性

### 核心功能

- **简历评估** - 智能分析简历内容，提供专业建议和改进意见
- **简历生成** - 基于用户信息自动生成优化的简历内容
- **模拟面试** - AI驱动的面试模拟，提供真实的面试体验
- **多格式支持** - 支持PDF、Word文档等多种简历格式
- **实时对话** - 流式响应，提供流畅的交互体验

### 技术特性

- **用户认证** - 基于Clerk的安全用户认证系统
- **响应式设计** - 支持桌面端和移动端的现代化UI
- **实时聊天** - 支持流式响应的对话界面
- **文件管理** - 安全的文件上传和处理系统
- **错误处理** - 完善的错误处理和用户提示

## 🛠️ 技术栈

### 前端 (Client)

- **React 19** - 现代化的React框架
- **Vite** - 快速的构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **DaisyUI** - Tailwind CSS组件库
- **React Router** - 客户端路由
- **Clerk** - 用户认证服务
- **React Markdown** - Markdown渲染

### 后端 (Server)

- **Node.js** - JavaScript运行时
- **Express.js** - Web应用框架
- **Prisma** - 数据库ORM
- **Multer** - 文件上传中间件
- **PDF-Parse** - PDF文档解析
- **Mammoth** - Word文档解析
- **CORS** - 跨域资源共享

### 开发工具

- **pnpm** - 包管理器
- **ESLint** - 代码质量检查
- **Concurrently** - 并发运行脚本

## 📦 项目结构

```
resume-analysis/
├── apps/
│   ├── client/                 # 前端应用
│   │   ├── src/
│   │   │   ├── components/     # React组件
│   │   │   ├── pages/         # 页面组件
│   │   │   ├── hooks/         # 自定义Hooks
│   │   │   ├── services/      # API服务
│   │   │   └── Layout/        # 布局组件
│   │   └── public/            # 静态资源
│   └── server/                # 后端应用
│       ├── routes/            # API路由
│       ├── services/          # 业务服务
│       ├── middleware/        # 中间件
│       ├── config/           # 配置文件
│       └── utils/            # 工具函数
├── package.json              # 根包配置
└── pnpm-workspace.yaml      # pnpm工作区配置
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd resume-analysis

# 安装依赖
pnpm install
```

### 环境配置

1. **前端配置** (apps/client/.env)

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:3001
```

2. **后端配置** (apps/server/.env)

```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
COZE_API_KEY=your_coze_api_key
COZE_BOT_ID=your_coze_bot_id
DATABASE_URL=your_database_url
```

### 启动开发服务器

```bash
# 同时启动前端和后端
pnpm dev

# 或者分别启动
pnpm dev:client  # 前端 (http://localhost:5173)
pnpm dev:server  # 后端 (http://localhost:3001)
```

## 📖 使用指南

### 1. 用户注册/登录

- 访问应用首页，点击登录按钮
- 使用Clerk提供的认证服务完成注册/登录

### 2. 简历分析

- 在分析页面选择分析类型（简历评估/简历生成/模拟面试）
- 上传简历文件（支持PDF、Word格式）
- 开始与AI进行对话，获取专业的分析和建议

### 3. 对话管理

- 查看历史对话记录
- 切换不同的对话会话
- 删除不需要的对话

## 🔧 开发指南

### 代码规范

- 使用ESLint进行代码质量检查
- 遵循React Hooks最佳实践
- 使用TypeScript进行类型检查（可选）

### 添加新功能

1. 在`apps/server/routes/`中添加新的API路由
2. 在`apps/client/src/components/`中创建新的React组件
3. 更新相关的类型定义和文档

### 测试

```bash
# 运行前端测试
cd apps/client && pnpm test

# 运行后端测试
cd apps/server && pnpm test
```

## 🚀 部署

### 构建生产版本

```bash
# 构建前端
cd apps/client && pnpm build

# 构建后端
cd apps/server && pnpm build
```

### 环境变量

确保在生产环境中正确配置所有必需的环境变量：

- `COZE_API_KEY` - Coze API密钥
- `COZE_BOT_ID` - Coze机器人ID
- `DATABASE_URL` - 数据库连接URL
- `CLERK_SECRET_KEY` - Clerk密钥

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持

如果您遇到任何问题或有建议，请：

- 提交Issue到GitHub仓库
- 联系开发团队

## 🔄 更新日志

### v1.0.0

- 初始版本发布
- 支持简历评估、生成和模拟面试
- 集成Clerk用户认证
- 实现流式对话响应
