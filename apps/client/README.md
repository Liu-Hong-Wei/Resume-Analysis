# 简历分析客户端

这是一个基于React的简历分析客户端应用，支持与AI助手进行实时对话分析。

## 主要功能

- 📄 简历文件上传和分析
- 💬 实时流式对话体验
- 🔄 智能错误处理和重连机制
- 🗂️ 多对话管理
- 📱 响应式设计

## 技术架构

### 流式响应系统

应用采用了基于Server-Sent Events (SSE) 的流式响应系统，完全替代了传统的轮询机制：

#### 事件类型支持

- `conversation.chat.created` - 对话创建
- `conversation.chat.in_progress` - 对话进行中
- `conversation.message.delta` - 消息增量更新
- `conversation.message.completed` - 消息完成
- `conversation.chat.completed` - 对话完成
- `conversation.chat.failed` - 对话失败

#### 核心组件

**ApiClient (`src/services/apiService.js`)**

- 处理SSE流式响应
- 事件类型解析和转换
- 错误处理和重连逻辑

**useChat Hook (`src/hooks/useChat.jsx`)**

- 统一的聊天状态管理
- 流式数据处理
- 自动重试机制
- 对话生命周期管理

**ChatInterface (`src/components/chatBox/ChatInterface.jsx`)**

- 实时消息显示
- 流式内容渲染
- 状态指示器
- 错误提示和重连按钮

### 状态管理

应用使用了完善的状态管理系统：

- `chatStatus`: 'idle' | 'in_progress' | 'completed' | 'failed'
- `isStreaming`: 是否正在接收流式数据
- `streamingContent`: 当前流式内容
- `retryCount`: 重试次数
- `isRetrying`: 是否正在重试

### 错误处理

实现了多层级的错误处理机制：

1. **网络错误**: 自动重试机制，最多重试3次
2. **服务器错误**: 根据HTTP状态码决定是否重试
3. **用户取消**: 优雅处理用户主动取消的请求
4. **解析错误**: 忽略JSON解析错误，继续处理其他数据

### 用户体验优化

- **实时反馈**: 流式响应提供即时的AI回复
- **状态指示**: 清晰的视觉状态指示器
- **错误恢复**: 一键重连功能
- **请求控制**: 支持取消正在进行的请求

## 开发指南

### 启动开发环境

```bash
npm install
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 项目结构

```
src/
├── components/
│   ├── chatBox/
│   │   ├── ChatInterface.jsx    # 主聊天界面
│   │   ├── ChatInput.jsx        # 消息输入框
│   │   ├── ChatSendButton.jsx   # 发送/取消按钮
│   │   └── MessageBox.jsx       # 消息显示组件
│   └── sidebar/
│       ├── ResumeUpload.jsx     # 文件上传
│       ├── ChatList.jsx         # 对话列表
│       └── ...
├── hooks/
│   ├── useChat.jsx              # 聊天状态管理
│   └── useAnalysis.jsx          # 分析状态管理
├── services/
│   └── apiService.js            # API客户端
└── pages/
    └── Analysis.jsx             # 分析页面
```

## API集成

### 流式响应格式

客户端支持标准的SSE格式：

```
event: conversation.chat.created
data: {"id":"123","conversation_id":"456","status":"created"}

event: conversation.message.delta
data: {"id":"789","role":"assistant","content":"Hello","type":"answer"}

event: conversation.chat.completed
data: {"id":"123","status":"completed","usage":{"token_count":100}}

event: done
data: [DONE]
```

### 错误处理

API错误会被自动转换为用户友好的错误消息，并根据错误类型决定是否进行重试。

## 性能优化

- 使用React.memo优化组件渲染
- 实现了合理的状态更新策略
- 减少了不必要的重新渲染
- 优化了内存使用

## 未来改进

- [ ] 添加消息搜索功能
- [ ] 实现对话导出功能
- [ ] 支持多种文件格式
- [ ] 添加快捷键支持
- [ ] 实现离线模式
