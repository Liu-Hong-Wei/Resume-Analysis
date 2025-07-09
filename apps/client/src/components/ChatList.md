# ChatList 组件

ChatList 是一个用于展示聊天对话列表的 React 组件，提供了对话管理的基本功能。

## 功能特性

- 📝 显示对话列表，包含标题、最后消息和时间戳
- ➕ 创建新对话
- 🗑️ 删除对话
- 🎯 选择对话
- 📱 响应式设计，适配移动端和桌面端
- 🎨 基于 DaisyUI 的美观界面

## 基本用法

```jsx
import React from "react";
import ChatList from "./ChatList";

const MyComponent = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const handleNewConversation = () => {
    // 创建新对话的逻辑
  };

  const handleConversationSelect = (conversationId) => {
    setSelectedConversationId(conversationId);
  };

  const handleDeleteConversation = (conversationId) => {
    // 删除对话的逻辑
  };

  return (
    <ChatList
      conversations={conversations}
      selectedConversationId={selectedConversationId}
      onConversationSelect={handleConversationSelect}
      onNewConversation={handleNewConversation}
      onDeleteConversation={handleDeleteConversation}
    />
  );
};
```

## 使用 useChatList Hook

推荐使用 `useChatList` Hook 来管理聊天状态：

```jsx
import React from "react";
import ChatList from "./ChatList";
import useChatList from "../hooks/useChatList";

const MyComponent = () => {
  const {
    conversations,
    selectedConversationId,
    currentConversation,
    createConversation,
    selectConversation,
    deleteConversation,
    addMessage,
    updateConversationTitle,
  } = useChatList(initialConversations);

  return (
    <ChatList
      conversations={conversations}
      selectedConversationId={selectedConversationId}
      onConversationSelect={selectConversation}
      onNewConversation={() => createConversation("新对话")}
      onDeleteConversation={deleteConversation}
    />
  );
};
```

## Props

| 属性名                   | 类型                               | 必填 | 默认值 | 描述                 |
| ------------------------ | ---------------------------------- | ---- | ------ | -------------------- |
| `conversations`          | `Conversation[]`                   | ✅   | `[]`   | 对话列表数据         |
| `selectedConversationId` | `string \| null`                   | ❌   | `null` | 当前选中的对话ID     |
| `onConversationSelect`   | `(conversationId: string) => void` | ✅   | -      | 选择对话的回调函数   |
| `onNewConversation`      | `() => void`                       | ✅   | -      | 创建新对话的回调函数 |
| `onDeleteConversation`   | `(conversationId: string) => void` | ✅   | -      | 删除对话的回调函数   |
| `className`              | `string`                           | ❌   | `""`   | 额外的 CSS 类名      |

## 数据结构

### Conversation 接口

```typescript
interface Conversation {
  id: string; // 对话唯一标识
  title: string; // 对话标题
  messages: Message[]; // 消息列表
  createdAt: string; // 创建时间 (ISO 字符串)
  updatedAt: string; // 更新时间 (ISO 字符串)
  isArchived?: boolean; // 是否已归档
  tags?: string[]; // 标签列表
}
```

### Message 接口

```typescript
interface Message {
  role: "user" | "assistant" | "system"; // 消息角色
  content: string; // 消息内容
  timestamp?: string; // 时间戳
}
```

## 样式定制

组件使用 DaisyUI 的样式类，可以通过以下方式定制：

1. **修改主题色**：在 DaisyUI 配置中修改 `primary` 和 `secondary` 颜色
2. **自定义类名**：通过 `className` 属性添加额外的样式
3. **响应式布局**：组件默认使用 `lg:grid-cols-4` 布局，可以根据需要调整

## 示例

查看 `ChatListDemo.jsx` 文件获取完整的使用示例。

## 注意事项

1. 确保项目中已安装并配置了 DaisyUI
2. 时间格式化使用中文 locale，确保浏览器支持
3. 删除操作会弹出确认对话框，可以根据需要自定义
4. 组件会自动处理空状态和加载状态
