# AI简历分析系统

一个基于LLM的智能简历分析系统，支持多种文档格式，提供对话式分析和优化建议。

## 功能特性

- 📄 支持多种文档格式：PDF、Word、TXT
- 🤖 基于OpenAI GPT的智能分析
- 💬 对话式交互界面
- 📊 多维度分析：全面分析、技能分析、经验分析、优化建议
- 🎯 个性化优化建议
- 💻 现代化Web界面

## 技术栈

### 前端

- React 18
- Vite
- DaisyUI (Tailwind CSS)
- 响应式设计

### 后端

- Node.js
- Express.js
- OpenAI API
- Multer (文件上传)
- PDF解析 (pdf-parse)
- Word文档解析 (mammoth)

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖
pnpm install

# 或者分别安装
cd apps/client && pnpm install
cd apps/server && pnpm install
```

### 2. 配置环境变量

在 `apps/server/` 目录下创建 `.env` 文件：

```env
# OpenAI API配置
OPENAI_API_KEY=your-openai-api-key-here

# 服务器配置
PORT=3001
NODE_ENV=development
```

**注意：** 您需要从 [OpenAI](https://platform.openai.com/api-keys) 获取API密钥。

### 3. 启动服务

```bash
# 启动后端服务器
cd apps/server
pnpm dev

# 启动前端开发服务器
cd apps/client
pnpm dev
```

### 4. 访问应用

- 前端：http://localhost:5173
- 后端：http://localhost:3001

## 使用说明

### 上传简历

1. 点击"选择文件"按钮
2. 选择您的简历文件（支持PDF、Word、TXT格式）
3. 选择分析类型（全面分析、技能分析、经验分析、优化建议）
4. 点击"开始AI分析"按钮

### 对话式分析

1. 分析完成后，您可以在右侧对话栏与AI助手交互
2. 使用快捷问题按钮快速提问
3. 或直接在输入框中输入您的问题
4. AI会根据您的简历内容提供专业的分析和建议

### 分析类型说明

- **全面分析**：对简历进行全方位分析，包括技能匹配、经验评估等
- **技能分析**：重点分析技能匹配度和技能展示效果
- **经验分析**：深度分析工作经验的相关性和描述质量
- **优化建议**：提供具体的简历优化建议和改进方案

## API接口

### 上传并分析简历

```
POST /api/analyze-resume
Content-Type: multipart/form-data

参数：
- resume: 简历文件
- analysisType: 分析类型 (comprehensive|skills|experience|optimization)
```

### 对话式分析

```
POST /api/chat-analysis
Content-Type: application/json

参数：
{
  "message": "用户消息",
  "resumeText": "简历文本内容",
  "conversationHistory": [对话历史]
}
```

## 项目结构

```
resume-analysis/
├── apps/
│   ├── client/                 # 前端应用
│   │   ├── src/
│   │   │   ├── pages/         # 页面组件
│   │   │   ├── Layout/        # 布局组件
│   │   │   └── ...
│   │   └── ...
│   └── server/                # 后端应用
│       ├── index.js           # 服务器入口
│       ├── package.json       # 后端依赖
│       └── ...
├── package.json               # 工作区配置
└── pnpm-workspace.yaml        # pnpm工作区配置
```

## 开发说明

### 添加新的分析类型

1. 在 `apps/client/src/pages/Analysis.jsx` 中的 `analysisTypes` 数组添加新类型
2. 在 `apps/server/index.js` 中的 `analysisPrompts` 对象添加对应的提示词

### 自定义LLM模型

在 `apps/server/index.js` 中修改 `openai.chat.completions.create` 的 `model` 参数。

### 扩展文件格式支持

在 `apps/server/index.js` 的 `extractTextFromFile` 函数中添加新的文件格式处理逻辑。

## 注意事项

1. **API密钥安全**：请妥善保管您的OpenAI API密钥，不要提交到版本控制系统
2. **文件大小限制**：建议上传的简历文件不超过10MB
3. **网络连接**：需要稳定的网络连接以访问OpenAI API
4. **API配额**：请注意OpenAI API的使用配额和费用

## 故障排除

### 常见问题

1. **文件上传失败**

   - 检查文件格式是否支持
   - 确认文件大小是否超限

2. **分析失败**

   - 检查OpenAI API密钥是否正确
   - 确认网络连接正常
   - 查看服务器日志获取详细错误信息

3. **对话功能异常**
   - 确认简历已成功上传
   - 检查浏览器控制台是否有错误信息

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！
