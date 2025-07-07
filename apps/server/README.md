# 简历分析API服务器

这是一个基于Express.js的简历分析API服务器，支持PDF文件上传并通过Coze大模型API进行智能评估。

## 功能特性

- 📄 PDF文件上传和处理
- 🤖 集成Coze大模型API进行智能分析
- 🔒 安全的文件处理和验证
- 📊 结构化的分析报告
- 🛡️ 完善的错误处理

## 快速开始

### 1. 安装依赖

```bash
cd apps/server
pnpm install
```

### 2. 环境配置

复制环境变量示例文件并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件，填入您的Coze API配置：

```env
PORT=3001
COZE_API_KEY=your_coze_api_key_here
COZE_BOT_ID=your_coze_bot_id_here
NODE_ENV=development
```

### 3. 获取Coze API密钥

1. 访问 [Coze开放平台](https://www.coze.cn/open)
2. 注册并创建应用
3. 获取API密钥和Bot ID
4. 将密钥配置到 `.env` 文件中

### 4. 启动服务器

```bash
# 开发模式（自动重启）
pnpm run dev

# 生产模式
pnpm start
```

服务器将在 `http://localhost:3001` 启动。

## API使用

### 健康检查

```bash
curl http://localhost:3001/health
```

### 简历分析

```bash
curl -X POST http://localhost:3001/api/analyze-resume \
  -F "resume=@path/to/your/resume.pdf"
```

## 测试

运行测试脚本验证API功能：

```bash
pnpm test
```

## 项目结构

```
apps/server/
├── index.js              # 主服务器文件
├── test-api.js           # API测试脚本
├── API_DOCUMENTATION.md  # 详细API文档
├── env.example           # 环境变量示例
├── package.json          # 项目配置
└── uploads/              # 文件上传目录（自动创建）
```

## 技术栈

- **Express.js** - Web框架
- **Multer** - 文件上传处理
- **pdf-parse** - PDF文本提取
- **Coze API** - 大模型分析
- **CORS** - 跨域支持
- **dotenv** - 环境变量管理

## 分析报告内容

API将返回包含以下维度的详细分析报告：

1. **个人信息评估** - 基本信息完整性
2. **工作经验分析** - 工作经历质量和相关性
3. **技能匹配度** - 技能与职位要求的匹配程度
4. **教育背景** - 学历和培训经历
5. **整体评价和建议** - 综合评估和改进建议

## 安全特性

- 文件类型验证（仅支持PDF）
- 文件大小限制（10MB）
- 自动文件清理
- 安全的文件命名
- 错误处理中间件

## 注意事项

1. 确保Coze API密钥有效且有足够配额
2. PDF文件必须是可读的文本格式
3. 建议在生产环境中配置HTTPS
4. 定期监控API调用频率和成本

## 故障排除

### 常见问题

1. **API密钥错误**

   - 检查 `.env` 文件中的 `COZE_API_KEY` 和 `COZE_BOT_ID`
   - 确认密钥在Coze平台中有效

2. **文件上传失败**

   - 确保文件格式为PDF
   - 检查文件大小是否超过10MB
   - 验证文件是否损坏

3. **PDF解析失败**
   - 确保PDF包含可提取的文本内容
   - 避免使用扫描版PDF或图片版PDF

### 日志查看

服务器运行时会输出详细的日志信息，包括：

- 文件处理状态
- API调用结果
- 错误信息

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

ISC License
