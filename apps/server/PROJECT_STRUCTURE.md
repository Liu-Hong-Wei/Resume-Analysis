# 服务器项目结构

## 概述

本项目已按逻辑功能重构，将原来的单一文件分离成多个独立的模块，提高了代码的可维护性和可扩展性。现在支持直接上传PDF文件到Coze大模型进行分析，同时保留文本提取模式作为备用方案。

## 目录结构

```
apps/server/
├── config/                 # 配置文件
│   └── index.js           # 服务器配置、Coze API配置
├── middleware/            # 中间件
│   ├── upload.js          # 文件上传中间件
│   └── errorHandler.js    # 错误处理中间件
├── routes/                # 路由处理
│   ├── health.js          # 健康检查路由
│   └── resume-evaluate.js # 简历分析路由
├── services/              # 业务逻辑服务
│   └── cozeService.js     # Coze API服务
├── utils/                 # 工具函数
│   └── pdfExtractor.js    # PDF处理工具
├── index.js               # 主入口文件
└── uploads/               # 文件上传目录（自动创建）
```

## 模块说明

### 1. 配置模块 (`config/`)

- **功能**: 集中管理所有配置信息
- **包含**: 服务器配置、Coze API配置、环境变量验证
- **文件**: `config/index.js`

### 2. 中间件模块 (`middleware/`)

- **upload.js**: 文件上传处理

  - multer配置
  - 文件类型过滤
  - 文件大小限制
  - 上传错误处理

- **errorHandler.js**: 全局错误处理
  - 统一错误响应格式
  - 404错误处理
  - 开发环境错误信息

### 3. 路由模块 (`routes/`)

- **health.js**: 健康检查端点

  - `GET /health` - 服务器状态检查

- **resume-evaluate.js**: 简历分析端点
  - `POST /api/analyze-resume` - 非流式简历分析
  - `POST /api/analyze-resume-stream` - 流式简历分析

### 4. 服务模块 (`services/`)

- **cozeService.js**: Coze API服务
  - **文件上传模式**: 直接上传PDF文件到Coze
  - **文本模式**: 提取PDF文本后发送到Coze
  - 非流式API调用
  - 流式API调用
  - 错误处理和响应验证
  - 请求体构建

### 5. 工具模块 (`utils/`)

- **pdfExtractor.js**: PDF处理工具
  - PDF文本提取（备用模式）
  - PDF文件验证
  - PDF转Base64编码
  - 文本内容验证

## API接口保持不变

重构后的API接口完全保持原有功能，但现在优先使用文件上传模式：

### 健康检查

```
GET /health
```

### 简历分析（非流式）

```
POST /api/analyze-resume
Content-Type: multipart/form-data
Body: resume (PDF文件)
```

### 简历分析（流式）

```
POST /api/analyze-resume-stream
Content-Type: multipart/form-data
Body: resume (PDF文件)
```

## 新的分析模式

### 文件上传模式（优先）

- 直接将PDF文件转换为Base64编码
- 使用Coze API的文件上传功能
- 保持PDF的原始格式和布局
- 更好的分析效果

### 文本提取模式（备用）

- 提取PDF文本内容
- 发送文本到Coze API
- 当文件上传模式失败时自动回退
- 确保系统的稳定性

## 响应格式

### 非流式响应

```json
{
  "success": true,
  "message": "简历分析完成",
  "data": {
    "analysis": "分析结果内容",
    "fileName": "文件名.pdf",
    "fileSize": 12345,
    "uploadTime": "2024-01-01T00:00:00.000Z",
    "analysisMode": "file" // "file" 或 "text"
  }
}
```

### 流式响应

```
data: {"choices":[{"delta":{"content":"分析内容片段"},"index":0}]}

data: [DONE]
```

## 优势

1. **更好的分析效果**: 直接上传PDF文件保持原始格式
2. **双重保障**: 文件上传失败时自动回退到文本模式
3. **模块化**: 每个功能都有独立的模块，便于维护
4. **可扩展性**: 新增功能只需添加相应的模块
5. **可测试性**: 每个模块可以独立测试
6. **代码复用**: 通用功能可以在多个地方复用
7. **配置集中**: 所有配置集中管理，便于修改
8. **错误处理**: 统一的错误处理机制

## 启动方式

启动方式保持不变：

```bash
npm start
# 或
node index.js
```

## 环境变量

需要在 `.env` 文件中配置：

```
COZE_API_KEY=your_coze_api_key
COZE_BOT_ID=your_coze_bot_id
PORT=3001 (可选，默认3001)
```

## 技术实现

### Coze API文件上传格式

根据 [Coze API 文档](https://www.coze.cn/open/docs/developer_guides/)，文件上传使用以下格式：

```json
{
  "bot_id": "your_bot_id",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "分析指令"
        },
        {
          "type": "file",
          "file": {
            "type": "application/pdf",
            "data": "base64_encoded_pdf_content"
          }
        }
      ]
    }
  ],
  "stream": false
}
```

### 错误处理策略

1. 优先尝试文件上传模式
2. 如果文件上传失败，自动回退到文本提取模式
3. 如果两种模式都失败，返回详细错误信息
4. 确保系统在各种情况下都能正常工作
