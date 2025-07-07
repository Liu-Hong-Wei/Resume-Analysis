# Coze API 规范符合性检查清单

## ✅ 已实现的规范要求

### 1. 基础配置

- [x] **API端点**: `https://www.coze.cn/open/api/chat/completions`
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

### 5. 流式响应处理

- [x] **stream: true**: 支持流式响应
- [x] **数据格式**: 正确处理Server-Sent Events格式
- [x] **结束标记**: 正确处理`[DONE]`标记
- [x] **增量内容**: 解析`delta.content`字段

### 6. 错误处理

- [x] **HTTP状态码**: 正确处理各种错误状态
- [x] **错误消息**: 解析和显示详细错误信息
- [x] **响应验证**: 验证响应格式的完整性

### 7. 响应格式验证

- [x] **choices数组**: 验证响应包含choices数组
- [x] **message对象**: 验证message.content存在
- [x] **流式delta**: 验证delta.content格式

## 🔧 实现细节

### 请求头设置

```javascript
headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${COZE_API_KEY}`,
  "User-Agent": "Resume-Analysis-API/1.0"
}
```

### 请求体格式

```javascript
{
  bot_id: COZE_BOT_ID,
  messages: [
    {
      role: "user",
      content: "简历分析提示词..."
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

所有实现都基于 [Coze API v3 文档](https://www.coze.cn/open/docs/developer_guides/chat_v3) 的规范要求。

### 关键规范点

1. **认证**: 使用Bearer Token认证
2. **消息格式**: 符合OpenAI兼容的消息格式
3. **流式响应**: 支持Server-Sent Events格式
4. **错误处理**: 遵循标准HTTP错误码
5. **参数验证**: 验证所有必需和可选参数

## 🚀 性能优化

1. **文本长度限制**: 限制输入文本为8000字符
2. **响应缓存**: 避免重复处理相同内容
3. **错误重试**: 实现智能重试机制
4. **资源清理**: 自动清理临时文件

## 🔍 测试验证

使用以下方式验证API符合性：

1. **健康检查**: `GET /health`
2. **非流式测试**: `POST /api/analyze-resume`
3. **流式测试**: `POST /api/analyze-resume-stream`
4. **错误处理测试**: 测试各种错误情况

## 📝 注意事项

1. 确保Coze API密钥有效且有足够配额
2. 监控API调用频率和成本
3. 定期更新API密钥
4. 在生产环境中使用HTTPS
5. 实现适当的日志记录和监控
