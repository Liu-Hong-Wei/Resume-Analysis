# 简历分析服务 API 文档

## 概述

这是一个基于 Express.js 的简历分析服务，提供简历评估、简历生成和模拟面试功能。服务集成了 Coze API 进行智能分析。

**基础URL**: `http://localhost:3001`

## 服务器信息

- **端口**: 3001 (可通过环境变量 PORT 配置)
- **文件上传限制**: 25MB
- **支持的文件类型**: PDF, JPEG, PNG, GIF
- **流式响应**: 支持 Server-Sent Events (SSE)

## 分析类型

服务支持三种分析类型：

- `evaluate`: 简历评估 - 分析简历内容，提供改进建议
- `generate`: 简历生成 - 根据用户需求生成简历内容
- `mock`: 模拟面试 - 基于简历进行模拟面试

## API 端点

### 1. 健康检查

#### GET /health

检查服务器运行状态。

**请求**:

```http
GET /health
```

**响应**:

```json
{
  "status": "ok",
  "message": "服务器运行正常",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 获取支持的分析类型

#### GET /api/analysis-types

获取所有支持的分析类型。

**请求**:

```http
GET /api/analysis-types
```

**响应**:

```json
{
  "success": true,
  "analysis_types": {
    "evaluate": "简历评估",
    "generate": "简历生成",
    "mock": "模拟面试"
  }
}
```

### 3. 通用分析 API

#### POST /api/analyze

通用分析端点，通过参数指定分析类型。

**请求参数**:

- `analysis_type` (必需): 分析类型 - `evaluate` | `generate` | `mock`
- `question` (可选): 用户问题
- `file` (可选): 上传的PDF文件 (multipart/form-data)

**请求示例**:

```bash
# 带文件上传
curl -X POST http://localhost:3001/api/analyze \
  -F "analysis_type=evaluate" \
  -F "question=请分析我的简历" \
  -F "file=@resume.pdf"

# 仅文本分析
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "analysis_type": "evaluate",
    "question": "请分析我的简历"
  }'
```

**响应**:

```json
{
  "success": true,
  "analysis_type": "evaluate",
  "result": "分析结果内容...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### POST /api/analyze-stream

通用分析端点（流式响应）。

**请求参数**: 同 `/api/analyze`

**响应格式**: Server-Sent Events (SSE)

```
data: {"type": "start", "analysis_type": "evaluate"}

data: {"type": "content", "content": "分析内容片段..."}

data: {"type": "end", "success": true}
```

### 4. 简历评估 API

#### POST /api/evaluate-resume

简历评估（非流式）- 上传PDF文件。

**请求**:

```http
POST /api/evaluate-resume
Content-Type: multipart/form-data

file: [PDF文件]
question: [可选问题]
```

**响应**:

```json
{
  "success": true,
  "analysis_type": "evaluate",
  "result": "简历评估结果...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### POST /api/evaluate-resume-stream

简历评估（流式响应）- 上传PDF文件。

**请求**: 同 `/api/evaluate-resume`

**响应**: SSE 格式

#### POST /api/evaluate-resume-question

简历评估（纯文本模式）- 仅用户提问。

**请求**:

```http
POST /api/evaluate-resume-question
Content-Type: application/json

{
  "question": "请分析我的简历"
}
```

#### POST /api/evaluate-resume-question-stream

简历评估（流式响应）- 仅用户提问。

**请求**: 同 `/api/evaluate-resume-question`

**响应**: SSE 格式

### 5. 简历生成 API

#### POST /api/generate-resume

简历生成（非流式）- 上传PDF文件。

**请求**:

```http
POST /api/generate-resume
Content-Type: multipart/form-data

file: [PDF文件]
question: [可选问题]
```

#### POST /api/generate-resume-stream

简历生成（流式响应）- 上传PDF文件。

#### POST /api/generate-resume-question

简历生成（纯文本模式）- 仅用户提问。

#### POST /api/generate-resume-question-stream

简历生成（流式响应）- 仅用户提问。

### 6. 模拟面试 API

#### POST /api/mock-interview

模拟面试（非流式）- 上传PDF文件。

**请求**:

```http
POST /api/mock-interview
Content-Type: multipart/form-data

file: [PDF文件]
question: [可选问题]
```

#### POST /api/mock-interview-stream

模拟面试（流式响应）- 上传PDF文件。

#### POST /api/mock-interview-question

模拟面试（纯文本模式）- 仅用户提问。

#### POST /api/mock-interview-question-stream

模拟面试（流式响应）- 仅用户提问。

### 7. 向后兼容 API

以下端点主要用于向后兼容，功能与统一分析API相同：

#### 简历评估兼容端点

- `POST /api/analyze-resume` - 简历评估（非流式）
- `POST /api/analyze-resume-stream` - 简历评估（流式）
- `POST /api/analyze-resume-question` - 简历评估（纯文本）
- `POST /api/analyze-resume-question-stream` - 简历评估（流式纯文本）

#### 简历生成兼容端点

- `POST /api/resume-generate` - 简历生成（非流式）
- `POST /api/resume-generate-stream` - 简历生成（流式）
- `POST /api/resume-generate-question` - 简历生成（纯文本）
- `POST /api/resume-generate-question-stream` - 简历生成（流式纯文本）

#### 模拟面试兼容端点

- `POST /api/mock-interview` - 模拟面试（非流式）
- `POST /api/mock-interview-stream` - 模拟面试（流式）
- `POST /api/mock-interview-question` - 模拟面试（纯文本）
- `POST /api/mock-interview-question-stream` - 模拟面试（流式纯文本）

## 错误处理

### 错误响应格式

```json
{
  "error": "错误描述",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 常见错误码

- `400 Bad Request`: 请求参数错误
- `413 Payload Too Large`: 文件大小超限
- `415 Unsupported Media Type`: 不支持的文件类型
- `500 Internal Server Error`: 服务器内部错误

### 错误示例

```json
{
  "error": "请提供有效的分析类型",
  "valid_types": ["evaluate", "generate", "mock"]
}
```

## 流式响应格式

流式响应使用 Server-Sent Events (SSE) 格式：

```
data: {"type": "start", "analysis_type": "evaluate"}

data: {"type": "content", "content": "分析内容片段..."}

data: {"type": "content", "content": "更多内容..."}

data: {"type": "end", "success": true}
```

### 事件类型

- `start`: 开始分析
- `content`: 内容片段
- `end`: 分析结束
- `error`: 错误信息

## 环境变量配置

服务需要以下环境变量：

```bash
# Coze API 配置
COZE_API_KEY=your_coze_api_key
COZE_BOT_ID=your_coze_bot_id

# 服务器配置（可选）
PORT=3001
```

## 使用示例

### JavaScript 客户端示例

```javascript
// 非流式请求
async function analyzeResume(file, question) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("question", question);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  return await response.json();
}

// 流式请求
function analyzeResumeStream(file, question, onData) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("question", question);

  const eventSource = new EventSource("/api/analyze-stream");

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onData(data);

    if (data.type === "end") {
      eventSource.close();
    }
  };
}
```

### cURL 示例

```bash
# 健康检查
curl http://localhost:3001/health

# 获取分析类型
curl http://localhost:3001/api/analysis-types

# 上传文件进行分析
curl -X POST http://localhost:3001/api/analyze \
  -F "analysis_type=evaluate" \
  -F "question=请分析我的简历" \
  -F "file=@resume.pdf"

# 纯文本分析
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "analysis_type": "evaluate",
    "question": "请分析我的简历"
  }'
```

## 注意事项

1. **文件大小限制**: 最大 25MB
2. **支持格式**: PDF, JPEG, PNG, GIF
3. **流式响应**: 需要客户端支持 SSE
4. **错误处理**: 所有端点都包含错误处理
5. **向后兼容**: 保留了旧版本API端点
6. **配置验证**: 启动时会验证必要的环境变量

## 开发说明

- 主要使用统一分析路由 (`/api/analyze`, `/api/analyze-stream`)
- 其他路由主要用于向后兼容
- 所有分析功能都基于 Coze API
- 支持文件上传和纯文本两种模式
- 提供流式和非流式两种响应方式
