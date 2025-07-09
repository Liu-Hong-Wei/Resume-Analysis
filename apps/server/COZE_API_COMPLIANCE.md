# Coze API 规范符合性检查清单

## ✅ 已实现的规范要求

### 1. 基础配置

- [x] **API端点**: `https://www.coze.cn/open/api/chat/completions`
- [x] **文件上传端点**: `https://www.coze.cn/open/api/files/upload`
- [x] **请求方法**: POST
- [x] **Content-Type**: `application/json`
- [x] **认证方式**: Bearer Token (`Authorization: Bearer {api_key}`)

### 2. 必需参数

- [x] **bot_id**: 机器人ID（从环境变量获取）
- [x] **messages**: 消息数组，包含role和content
- [x] **stream**: 支持false（非流式）和true（流式）

### 3. 可选参数

- [x] **temperature**: 设置为0.7（控制创造性）
- [x] **max_tokens**: 设置为2000（限制响应长度）
- [x] **top_p**: 设置为0.9（核采样参数）
- [x] **presence_penalty**: 设置为0.0（存在惩罚）
- [x] **frequency_penalty**: 设置为0.0（频率惩罚）

### 4. 消息格式

- [x] **role**: "user"（用户消息）
- [x] **content**: 字符串格式的简历内容
- [x] **文件消息**: 使用 `file_id` 引用上传的文件

### 5. 文件上传

- [x] **文件上传流程**: 先上传文件获取 `file_id`，再在消息中引用
- [x] **支持的文件类型**: PDF, JPEG, PNG, GIF
- [x] **文件大小限制**: 20MB
- [x] **Base64编码**: 正确处理文件编码

### 6. 流式响应处理

- [x] **stream: true**: 支持流式响应
- [x] **数据格式**: 正确处理Server-Sent Events格式
- [x] **结束标记**: 正确处理`[DONE]`标记
- [x] **增量内容**: 解析`delta.content`字段
- [x] **响应头设置**: 正确的SSE响应头

### 7. 错误处理

- [x] **HTTP状态码**: 正确处理各种错误状态
- [x] **错误消息**: 解析和显示详细错误信息
- [x] **响应验证**: 验证响应格式的完整性
- [x] **状态码映射**: 详细的错误状态码说明

### 8. 响应格式验证

- [x] **choices数组**: 验证响应包含choices数组
- [x] **message对象**: 验证message.content存在
- [x] **流式delta**: 验证delta.content格式

## 🔧 实现细节

### 请求头设置

```javascript
headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${COZE_API_KEY}`,
  "User-Agent": "Resume-Analysis-API/1.0",
  "Accept": "application/json" // 或 "text/event-stream" 用于流式
}
```

### 文件上传请求

```javascript
// 1. 上传文件
const uploadResponse = await fetch("https://www.coze.cn/open/api/files/upload", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${COZE_API_KEY}`,
  },
  body: JSON.stringify({
    file: base64Data,
    filename: fileName,
    type: mimeType,
  }),
});

// 2. 获取文件ID
const { file_id } = await uploadResponse.json();

// 3. 在消息中引用文件
{
  type: "file",
  file_id: file_id
}
```

### 请求体格式

```javascript
{
  bot_id: COZE_BOT_ID,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "分析提示词..."
        },
        {
          type: "file",
          file_id: "file_id_here"
        }
      ]
    }
  ],
  stream: false, // 或 true
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 0.9,
  presence_penalty: 0.0,
  frequency_penalty: 0.0
}
```

### 流式响应处理

```javascript
// 设置SSE响应头
res.writeHead(200, {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Cache-Control",
});

// 处理Server-Sent Events格式
if (line.startsWith('data: ')) {
  const data = line.slice(6);

  if (data === '[DONE]') {
    // 流式响应结束
    break;
  }

  const parsed = JSON.parse(data);
  if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
    // 处理增量内容
  }
}
```

## 📋 规范参考

所有实现都基于以下 Coze API 文档：

- [Coze API 概览](https://www.coze.cn/open/docs/developer_guides/coze_api_overview)
- [Chat v3 API](https://www.coze.cn/open/docs/developer_guides/chat_v3)
- [文件上传 API](https://www.coze.cn/open/docs/developer_guides/upload_files)
- [获取聊天响应](https://www.coze.cn/open/docs/developer_guides/get_chat_response)
- [创建对话](https://www.coze.cn/open/docs/developer_guides/create_conversation)

### 关键规范点

1. **认证**: 使用Bearer Token认证
2. **消息格式**: 符合OpenAI兼容的消息格式
3. **文件处理**: 先上传后引用的两步流程
4. **流式响应**: 支持Server-Sent Events格式
5. **错误处理**: 遵循标准HTTP错误码
6. **参数验证**: 验证所有必需和可选参数

## 🚀 性能优化

1. **文本长度限制**: 限制输入文本为8000字符
2. **文件大小限制**: 20MB文件大小限制
3. **响应缓存**: 避免重复处理相同内容
4. **错误重试**: 实现智能重试机制
5. **资源清理**: 自动清理临时文件

## 🔍 测试验证

使用以下方式验证API符合性：

1. **健康检查**: `GET /health`
2. **非流式测试**: `POST /api/analyze-resume`
3. **流式测试**: `POST /api/analyze-resume-stream`
4. **错误处理测试**: 测试各种错误情况
5. **文件上传测试**: 测试不同文件类型和大小

## 📝 注意事项

1. 确保Coze API密钥有效且有足够配额
2. 监控API调用频率和成本
3. 定期更新API密钥
4. 在生产环境中使用HTTPS
5. 实现适当的日志记录和监控
6. 文件上传需要两步流程：先上传获取file_id，再在消息中引用
7. 支持的文件类型：PDF, JPEG, PNG, GIF
8. 文件大小限制：20MB

## 🔄 更新日志

### v2.0.0 (最新)

- ✅ 修正文件上传流程，符合官方文档规范
- ✅ 添加文件上传API集成
- ✅ 更新文件消息格式使用 `file_id`
- ✅ 扩展支持的文件类型
- ✅ 改进错误处理和状态码映射
- ✅ 更新文件大小限制为20MB
- ✅ 添加详细的SSE响应头设置
