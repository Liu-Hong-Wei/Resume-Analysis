import React from "react";
import ChatSendButton from "./ChatSendButton";

const ChatInput = ({
  currentMessage,
  onMessageChange,
  onSendMessage,
  onKeyDown,
  onSuggestedQuestionClick,
  suggestedQuestions = [],
  isSending = false,
  disabled = false,
  showSuggestedQuestions = true,
}) => {
  return (
    <div className="space-y-4">
      {/* 快捷问题 */}
      {showSuggestedQuestions && suggestedQuestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => onSuggestedQuestionClick(question)}
              className="btn btn-outline btn-xs rounded-full border-base-300 hover:bg-primary/10 hover:border-primary transition-all duration-150"
              disabled={isSending || disabled}
              style={{ fontSize: "0.92rem", padding: "0.3rem 0.9rem" }}
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* 消息输入 */}
      <div className="flex gap-2 h-20">
        <textarea
          value={currentMessage}
          onChange={onMessageChange}
          onKeyDown={onKeyDown}
          placeholder="输入您的问题..."
          className="textarea textarea-bordered flex-1 rounded-2xl border-base-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-lg shadow-sm transition-all duration-300 resize-none text-base"
          rows="2"
          disabled={isSending || disabled}
          style={{
            minHeight: "3rem",
            fontSize: "1.2rem",
            background: "#fafbfc",
            padding: "0.5rem",
          }}
        />
        <ChatSendButton
          onSend={onSendMessage}
          disabled={!currentMessage.trim() || isSending || disabled}
          isSending={isSending}
        />
      </div>
    </div>
  );
};

export default ChatInput;
