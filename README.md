# 简历分析服务 v2.0

一个基于 Express.js 的现代化简历分析服务，采用面向对象的设计模式，参考 Coze JS 官方示例的最佳实践。服务集成了 Coze API 进行智能分析，提供简历评估、简历生成和模拟面试功能。

## 🚀 新版本特性

### v2.0.0 主要改进

- 🏗️ **面向对象架构**: 重构为类基础的设计模式
- 🔧 **统一配置管理**: ConfigManager 统一管理所有配置项
- 🚀 **改进的服务器启动**: 优雅启动和关闭流程
- 📊 **更好的错误处理**: 统一的错误处理机制
- 🔄 **向后兼容**: 保持旧版本 API 的兼容性
- 📚 **完善文档**: 详细的技术文档和使用示例

## 🏗️ 架构设计

### 核心组件

- **ConfigManager**: 配置管理类，统一管理所有配置项
- **CozeClient**: Coze API 客户端类，封装所有 API 调用
- **AnalysisService**: 分析服务类，处理业务逻辑
- **RouteManager**: 路由管理类，统一管理 API 路由
- **Server**: 服务器应用类，管理整个应用生命周期

### 设计原则

- **面向对象**: 使用类封装相关功能
- **单一职责**: 每个类只负责特定功能
- **依赖注入**: 通过构造函数注入依赖
- **错误处理**: 统一的错误处理机制
- **向后兼容**: 保持旧版本 API 的兼容性

## 📋 功能特性

### 分析类型

- **简历评估**: 分析简历内容，提供改进建议
- **简历生成**: 根据用户需求生成简历内容
- **模拟面试**: 基于简历进行模拟面试

### 支持格式

- **文件上传**: PDF, JPEG, PNG, GIF (最大 20MB)
- **文本分析**: 纯文本内容分析
- **流式响应**: Server-Sent Events (SSE) 支持

## 🛠️ 技术栈

- **后端**: Node.js, Express.js
- **AI 服务**: Coze API
- **文件处理**: Multer, FormData
- **流式响应**: Server-Sent Events
- **配置管理**: dotenv

## 📦 项目结构

```
resume-analysis/
├── apps/
│   ├── client/                 # 前端应用
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   └── apiService.js    # 现代化 API 客户端
│   │   │   └── ...
│   │   └── ...
│   └── server/                 # 后端服务
│       ├── config/
│       │   └── index.js        # 配置管理类
│       ├── services/
│       │   ├── cozeService.js  # Coze API 客户端类
│       │   └── analysisService.js # 分析服务类
│       ├── routes/
│       │   └── unified-analysis.js # 路由管理类
│       ├── index.js            # 服务器应用类
│       └── API_DOCUMENTATION.md # 详细 API 文档
└── ...
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐) 或 npm

### 安装依赖

```bash
# 安装 pnpm (如果未安装)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 环境配置

创建 `.env` 文件：

```bash
# Coze API 配置 (必需)
COZE_API_KEY=your_coze_api_key
COZE_BOT_ID=your_coze_bot_id

# 服务器配置 (可选)
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
```

### 启动服务

```bash
# 启动后端服务
pnpm dev:server

# 启动前端应用
pnpm dev:client

# 同时启动前后端
pnpm dev
```

## 📋 API 使用

### 基础端点

- `GET /health` - 健康检查
- `GET /api/analysis-types` - 获取分析类型
- `POST /api/analyze` - 通用分析 API
- `POST /api/analyze-stream` - 通用分析 API (流式)

### 客户端使用示例

```javascript
import { apiClient, analysisService } from "./services/apiService.js";

// 使用通用 API 客户端
const result = await apiClient.analyze({
  analysis_type: "evaluate",
  question: "请分析我的简历",
  file: fileObject,
});

// 使用特定分析服务
const evaluation = await analysisService.evaluateResume(
  fileObject,
  "请分析我的简历"
);

// 流式分析
await analysisService.evaluateResumeStream(
  fileObject,
  "请分析我的简历",
  (data) => {
    if (data.type === "content") {
      console.log("收到内容:", data.content);
    } else if (data.type === "end") {
      console.log("分析完成");
    }
  }
);
```

## 🔧 开发指南

### 新架构优势

1. **更好的可维护性**: 类封装使代码结构更清晰
2. **统一的错误处理**: 所有组件使用相同的错误处理机制
3. **配置集中管理**: 所有配置项统一管理
4. **优雅的启动流程**: 支持优雅启动和关闭
5. **向后兼容**: 保持旧版本 API 的兼容性

### 扩展新功能

1. **添加新的分析类型**:

   ```javascript
   // 在 config/index.js 中添加新类型
   analysisTypes: {
     EVALUATE: "evaluate",
     GENERATE: "generate",
     MOCK: "mock",
     NEW_TYPE: "new_type" // 新增
   }
   ```

2. **创建新的服务方法**:

   ```javascript
   // 在 services/analysisService.js 中添加
   async handleNewAnalysis(data) {
     // 实现新分析逻辑
   }
   ```

3. **注册新的路由**:
   ```javascript
   // 在 routes/unified-analysis.js 中添加
   // 路由会自动注册
   ```

## 📚 文档

- [API 文档](./apps/server/API_DOCUMENTATION.md) - 详细的 API 使用说明
- [架构设计](./docs/architecture.md) - 系统架构设计文档
- [开发指南](./docs/development.md) - 开发指南和最佳实践

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔄 更新日志

### v2.0.0 (2024-01-01)

- 🏗️ 重构为面向对象架构
- 🔧 引入配置管理类
- 🚀 改进的服务器启动流程
- 📊 更好的错误处理和日志记录
- 🔄 保持向后兼容性
- 📚 完善的技术文档

### v1.x.x

- 基础功能实现
- 简单的函数式架构
- 基本的错误处理

## 📞 支持

如有问题或建议，请：

1. 查看 [API 文档](./apps/server/API_DOCUMENTATION.md)
2. 搜索 [Issues](../../issues)
3. 创建新的 Issue

---

**注意**: 本项目需要有效的 Coze API 密钥才能正常运行。请确保在 `.env` 文件中正确配置了 `COZE_API_KEY` 和 `COZE_BOT_ID`。
