# 聊天组件重构说明

## 概述

本次重构将ChatInterface的聊天功能抽象为独立的组件，实现了更好的代码复用性和模块化。现在可以随时与LLM聊天，不需要保证简历已经上传。

## 组件结构

### 1. ChatList.jsx

**功能**: 聊天对话列表组件
**特性**:

- 显示对话列表，包含标题、最后消息和时间戳
- 支持创建新对话
- 支持删除对话
- 支持选择对话
- 响应式设计，适配移动端和桌面端
- 基于 DaisyUI 的美观界面

**Props**:

- `conversations`: 对话列表数据
- `selectedConversationId`: 当前选中的对话ID
- `onConversationSelect`: 选择对话的回调函数
- `onNewConversation`: 创建新对话的回调函数
- `onDeleteConversation`: 删除对话的回调函数
- `className`: 额外的 CSS 类名 (可选)

### 2. MessageBox.jsx

**功能**: 显示单条消息的组件
**特性**:

- 支持用户和AI的不同样式
- 支持打字状态显示
- 自动换行和格式化

**Props**:

- `message`: 消息对象 `{role: 'user'|'assistant', content: string}`
- `isTyping`: 是否显示打字状态 (可选)

### 3. ChatSendButton.jsx

**功能**: 发送按钮组件
**特性**:

- 支持加载状态
- 禁用状态处理
- 统一的按钮样式

**Props**:

- `onSend`: 发送回调函数
- `disabled`: 是否禁用 (可选)
- `isSending`: 是否正在发送 (可选)

### 4. ChatInput.jsx

**功能**: 聊天输入区域组件
**特性**:

- 消息输入框
- 快捷问题按钮
- 发送按钮集成
- 键盘事件处理

**Props**:

- `currentMessage`: 当前消息内容
- `onMessageChange`: 消息变化回调
- `onSendMessage`: 发送消息回调
- `onKeyPress`: 键盘事件回调
- `onSuggestedQuestionClick`: 快捷问题点击回调
- `suggestedQuestions`: 快捷问题数组 (可选)
- `isSending`: 是否正在发送 (可选)
- `disabled`: 是否禁用 (可选)
- `showSuggestedQuestions`: 是否显示快捷问题 (可选)

### 5. ChatInterface.jsx

**功能**: 完整的聊天界面组件
**特性**:

- 消息列表显示
- 输入区域集成
- 自动滚动
- 空状态处理
- 高度可定制

**Props**:

- `conversationHistory`: 对话历史数组
- `currentMessage`: 当前消息内容
- `isSending`: 是否正在发送
- `messagesEndRef`: 消息列表底部引用
- `onMessageChange`: 消息变化回调
- `onSendMessage`: 发送消息回调
- `onKeyPress`: 键盘事件回调
- `onSuggestedQuestionClick`: 快捷问题点击回调
- `suggestedQuestions`: 快捷问题数组 (可选)
- `className`: 自定义样式类 (可选)
- `title`: 标题 (可选)
- `emptyStateMessage`: 空状态消息 (可选)
- `showEmptyState`: 是否显示空状态 (可选)

## Hooks

### useChatList.js

**功能**: 聊天列表状态管理hook
**特性**:

- 对话列表管理
- 对话选择状态
- 创建、删除、更新对话
- 消息管理
- 归档功能

**返回值**:

- `conversations`: 对话列表
- `selectedConversationId`: 当前选中的对话ID
- `currentConversation`: 当前选中的对话对象
- `createConversation`: 创建新对话
- `selectConversation`: 选择对话
- `deleteConversation`: 删除对话
- `addMessage`: 添加消息
- `updateConversationTitle`: 更新对话标题
- `archiveConversation`: 归档对话

### useChat.js

**功能**: 通用的聊天状态管理hook
**特性**:

- 消息发送和接收
- 对话历史管理
- 错误处理
- 自动滚动
- 快捷问题支持
- 上下文数据支持

**参数**:

- `apiEndpoint`: API端点 (默认: "/chat")
- `initialMessage`: 初始消息 (可选)
- `suggestedQuestions`: 快捷问题数组 (可选)
- `contextData`: 上下文数据 (可选)

**返回值**:

- 所有聊天相关的状态和方法

## 使用示例

### 聊天列表界面

```jsx
import ChatList from "./components/ChatList";
import useChatList from "../hooks/useChatList";

const ChatListPage = () => {
  const {
    conversations,
    selectedConversationId,
    createConversation,
    selectConversation,
    deleteConversation,
  } = useChatList(initialConversations);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-1">
        <ChatList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onConversationSelect={selectConversation}
          onNewConversation={() => createConversation("新对话")}
          onDeleteConversation={deleteConversation}
        />
      </div>
      <div className="lg:col-span-3">
        {/* 聊天内容区域 */}
      </div>
    </div>
  );
};
```

### 基本聊天界面

```jsx
import ChatInterface from "./components/ChatInterface";
import { useChat } from "./hooks/useChat";

const MyChat = () => {
  const chatHook = useChat();

  return (
    <ChatInterface
      {...chatHook}
      title="我的聊天"
      emptyStateMessage="开始聊天吧！"
    />
  );
};
```

### 带上下文的聊天

```jsx
const chatHook = useChat({
  apiEndpoint: "/chat-analysis",
  contextData: resumeText,
  suggestedQuestions: ["分析我的技能", "优化建议"],
});
```

### 自定义快捷问题

```jsx
const customQuestions = ["你好", "今天天气怎么样？", "请给我一些建议"];

const chatHook = useChat({
  suggestedQuestions: customQuestions,
});
```

## 优势

1. **模块化**: 每个组件职责单一，易于维护
2. **可复用**: 可以在不同场景下使用相同的组件
3. **可定制**: 通过props可以灵活配置组件行为
4. **独立**: 聊天功能不再依赖简历上传
5. **类型安全**: 清晰的props接口定义

## 迁移指南

### 从旧版本迁移

1. 更新import语句，使用新的组件
2. 使用useChat hook替代原有的聊天逻辑
3. 移除对resumeText的依赖检查
4. 更新props传递方式

### 新功能使用

1. 创建独立的聊天页面
2. 使用通用聊天API端点
3. 配置自定义快捷问题
4. 添加上下文数据支持
