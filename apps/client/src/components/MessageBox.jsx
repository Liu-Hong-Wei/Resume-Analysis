import React from "react";

const MessageBox = ({ message, isTyping = false, isStreaming = false }) => {
  const isUser = message.role === "user";

  return (
    <div className={`chat ${isUser ? "chat-end" : "chat-start"}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          {isUser ? (
            <div className="bg-primary text-primary-content flex items-center justify-center">
              👤
            </div>
          ) : (
            <div className="bg-secondary text-secondary-content flex items-center justify-center">
              🤖
            </div>
          )}
        </div>
      </div>
      <div
        className={`chat-bubble ${
          isUser ? "chat-bubble-primary" : "chat-bubble-secondary"
        }`}
      >
        {isTyping ? (
          <div className="flex items-center gap-2">
            <span className="loading loading-dots loading-sm"></span>
            AI正在思考中...
          </div>
        ) : isStreaming ? (
          <div className="whitespace-pre-wrap">
            {message.content}
            <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1"></span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}
      </div>
    </div>
  );
};

export default MessageBox;
