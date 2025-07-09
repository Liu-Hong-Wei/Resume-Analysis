import React from "react";

/**
 * 消息框组件
 */
const MessageBox = ({ message }) => {
  const isUser = message.role === "user";
  const timestamp = new Date(message.timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
        {isUser ? "您" : "AI 助手"} • {timestamp}
      </div>
      <div
        className={`chat-bubble ${isUser ? "chat-bubble-primary" : "chat-bubble-secondary"}`}
      >
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
