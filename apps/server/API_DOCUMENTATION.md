# 简历分析API文档

## 概述

这是一个基于Express.js的简历分析API，支持PDF文件上传并通过Coze大模型API进行智能评估。

## 环境配置

### 1. 环境变量设置

创建 `.env` 文件并配置以下变量：

```env
PORT=3001
COZE_API_KEY=your_coze_api_key_here
COZE_BOT_ID=your_coze_bot_id_here
NODE_ENV=development
```

### 2. 获取Coze API密钥

1. 访问 [Coze开放平台](https://www.coze.cn/open)
2. 注册并创建应用
3. 获取API密钥和Bot ID

## API端点

### 1. 健康检查

**GET** `/health`

检查服务器运行状态

**响应示例：**

```json
{
  "status": "ok",
  "message": "服务器运行正常"
}
```

### 2. 简历分析（非流式）

**POST** `/api/analyze-resume`

上传PDF简历文件并获取分析结果

**请求参数：**

- `resume`: PDF文件（multipart/form-data）

**请求示例：**

```bash
curl -X POST http://localhost:3001/api/analyze-resume \
  -F "resume=@path/to/your/resume.pdf"
```

**成功响应：**

```json
{
  "success": true,
  "message": "简历分析完成",
  "data": {
    "originalText": "简历文本预览...",
    "analysis": "Coze AI分析结果...",
    "fileName": "resume.pdf",
    "fileSize": 1024000,
    "uploadTime": "2024-01-01T12:00:00.000Z"
  }
}
```

**错误响应：**

```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误描述"
}
```

### 3. 简历分析（流式响应）

**POST** `/api/analyze-resume-stream`

上传PDF简历文件并获取流式分析结果

**请求参数：**

- `resume`: PDF文件（multipart/form-data）

**请求示例：**

```bash
curl -X POST http://localhost:3001/api/analyze-resume-stream \
  -F "resume=@path/to/your/resume.pdf"
```

**流式响应格式：**

```
data: {"choices":[{"delta":{"content":"分析内容..."},"finish_reason":null}]}

data: {"choices":[{"delta":{"content":"继续分析..."},"finish_reason":null}]}

data: [DONE]
```

## 功能特性

### 1. 文件处理

- 支持PDF格式文件
- 文件大小限制：10MB
- 自动文件清理
- 安全的文件命名

### 2. 文本提取

- 使用pdf-parse库提取PDF文本
- 支持中文内容
- 错误处理和验证

### 3. AI分析

- 集成Coze大模型API（符合[Coze API v3规范](https://www.coze.cn/open/docs/developer_guides/chat_v3)）
- 支持流式和非流式响应
- 结构化分析报告
- 包含以下评估维度：
  - 个人信息评估
  - 工作经验分析
  - 技能匹配度
  - 教育背景
  - 整体评价和建议
- 完善的错误处理和响应验证
- 支持API参数调优（temperature, top_p, presence_penalty, frequency_penalty）

### 4. 安全特性

- CORS支持
- 文件类型验证
- 错误处理中间件
- 环境变量配置

## 安装和运行

### 1. 安装依赖

```bash
cd apps/server
pnpm install
```

### 2. 配置环境变量

```bash
cp env.example .env
# 编辑 .env 文件，填入实际的API密钥
```

### 3. 启动服务器

```bash
# 开发模式
pnpm run dev

# 生产模式
pnpm start
```

## 错误代码

| 状态码 | 说明                             |
| ------ | -------------------------------- |
| 200    | 请求成功                         |
| 400    | 请求参数错误（文件格式、大小等） |
| 404    | 接口不存在                       |
| 500    | 服务器内部错误                   |

## 注意事项

1. 确保Coze API密钥有效且有足够配额
2. PDF文件必须是可读的文本格式
3. 建议在生产环境中配置HTTPS
4. 定期清理uploads目录中的临时文件
5. 监控API调用频率和成本

## 前端集成示例

### 非流式响应

```javascript
// 使用FormData上传文件
const formData = new FormData();
formData.append("resume", file);

const response = await fetch("http://localhost:3001/api/analyze-resume", {
  method: "POST",
  body: formData,
});

const result = await response.json();
if (result.success) {
  console.log("分析结果:", result.data.analysis);
} else {
  console.error("分析失败:", result.message);
}
```

### 流式响应

```javascript
// 使用FormData上传文件
const formData = new FormData();
formData.append("resume", file);

const response = await fetch("http://localhost:3001/api/analyze-resume-stream", {
  method: "POST",
  body: formData,
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      
      if (data === '[DONE]') {
        console.log('分析完成');
        break;
      }
      
      try {
        const parsed = JSON.parse(data);
        if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
          console.log('收到内容:', parsed.choices[0].delta.content);
        }
      } catch (e) {
        // 忽略解析错误
      }
    }
  }
}
```
