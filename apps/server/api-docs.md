# 简历分析系统 API 文档

## 基础信息

- 基础URL: `http://localhost:3001/api`
- 内容类型: `application/json` (除文件上传外)
- 文件上传: `multipart/form-data`

## API 接口

### 1. 简历分析接口

**接口地址**: `POST /api/analyze-resume`

**功能描述**: 上传简历文件并进行AI分析

**请求参数**:

```javascript
// FormData 格式
{
  resume: File,           // 简历文件 (PDF, DOC, DOCX, TXT)
  analysisType: String    // 分析类型: "comprehensive", "skills", "experience", "optimization"
}
```

**响应格式**:

```javascript
{
  success: true,
  originalText: String,   // 提取的简历文本内容
  result: String,         // LLM返回的JSON格式分析结果
  error: String          // 错误信息 (仅在失败时)
}
```

**LLM返回的JSON格式示例**:

```javascript
{
  "overallScore": 85,           // 整体评分 (0-100)
  "skillMatch": "良好",         // 技能匹配度
  "experienceRelevance": "相关", // 经验相关性
  "analysis": "详细的分析内容...", // 详细分析
  "suggestions": [              // 优化建议数组
    "建议1",
    "建议2",
    "建议3"
  ]
}
```

### 2. 对话分析接口

**接口地址**: `POST /api/chat-analysis`

**功能描述**: 与AI助手进行简历相关对话

**请求参数**:

```javascript
{
  message: String,                    // 用户消息
  resumeText: String,                 // 简历文本内容
  conversationHistory: Array          // 对话历史
}
```

**对话历史格式**:

```javascript
[
  {
    role: "user", // "user" 或 "assistant"
    content: String, // 消息内容
  },
];
```

**响应格式**:

```javascript
{
  success: true,
  response: String,      // AI助手回复内容
  error: String         // 错误信息 (仅在失败时)
}
```

## 错误处理

### 通用错误响应格式

```javascript
{
  success: false,
  error: "错误描述信息"
}
```

### 常见错误码

- `400`: 请求参数错误
- `413`: 文件过大
- `415`: 不支持的文件格式
- `500`: 服务器内部错误
- `503`: LLM服务不可用

## 文件格式支持

### 支持的文件类型

- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- 纯文本 (.txt)

### 文件大小限制

- 最大文件大小: 10MB

## 实现建议

### 后端实现要点

1. **文件处理**: 使用 `multer` 处理文件上传
2. **文本提取**: 使用 `pdf-parse` 处理PDF，`mammoth` 处理Word文档
3. **LLM集成**: 集成OpenAI API或其他LLM服务
4. **错误处理**: 完善的错误处理和日志记录
5. **CORS配置**: 允许前端跨域访问

### 安全考虑

1. **文件验证**: 验证文件类型和大小
2. **内容过滤**: 过滤恶意内容
3. **API限流**: 防止滥用
4. **敏感信息**: 注意处理简历中的个人信息

### 性能优化

1. **异步处理**: 长时间分析任务异步处理
2. **缓存**: 缓存分析结果
3. **文件存储**: 考虑文件存储策略
4. **并发控制**: 控制并发请求数量
