import React from "react";

/**
 * 消息框组件
 */
const MessageBox = ({ message, isOwn, timestamp, isStreaming = false }) => {
  const isUser = isOwn || message.role === "user";
  const isSystem = message.role === "system";
  const isError = message.metadata?.isError;
  const isTyping = message.metadata?.isTyping || isStreaming;
  const displayTimestamp = timestamp || message.timestamp;
  const formattedTime = new Date(displayTimestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // 系统消息样式
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-base-200 text-base-content/60 px-4 py-2 rounded-full text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  // 错误消息样式
  if (isError) {
    return (
      <div className="chat chat-start">
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <div className="bg-error text-error-content flex items-center justify-center">
              <span className="text-sm">⚠️</span>
            </div>
          </div>
        </div>
        <div className="chat-header opacity-50 text-xs">
          AI 助手 • {formattedTime}
        </div>
        <div className="chat-bubble chat-bubble-error">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat ${isUser ? "chat-end" : "chat-start"}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          {isUser ? (
            <div className="bg-primary text-primary-content flex items-center justify-center">
              <span className="text-sm font-semibold">我</span>
            </div>
          ) : (
            <div className="bg-secondary text-secondary-content flex items-center justify-center">
              <span className="text-sm">AI</span>
            </div>
          )}
        </div>
      </div>
      <div className="chat-header opacity-50 text-xs">
        {isUser ? "您" : "AI 助手"} • {formattedTime}
      </div>
      <div
        className={`chat-bubble ${isUser ? "chat-bubble-primary" : "chat-bubble-secondary"}`}
      >
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">
            {message.content}
            {isTyping && (
              <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1"></span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
