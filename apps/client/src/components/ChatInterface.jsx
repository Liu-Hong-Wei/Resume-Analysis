import React from "react";
import MessageBox from "./MessageBox";
import ChatInput from "./ChatInput";

const ChatInterface = ({
  conversationHistory = [],
  currentMessage = "",
  isSending = false,
  messagesEndRef,
  onMessageChange,
  onSendMessage,
  onKeyDown,
  onSuggestedQuestionClick,
  suggestedQuestions = [],
  className = "",
  title = "AI助手对话",
  emptyStateMessage = "开始与AI助手对话吧！",
  showEmptyState = true,
}) => {
  const hasMessages = conversationHistory.length > 0;

  return (
    <div
      className={`card ${className} bg-base-100 shadow-xl h-full flex flex-col`}
    >
      <div className="card-body flex flex-col h-full">
        <h2 className="card-title">{title}</h2>

        {/* 对话区域 */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {showEmptyState && !hasMessages ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-base-content/70">{emptyStateMessage}</p>
            </div>
          ) : (
            <>
              {conversationHistory.map((message, index) => (
                <MessageBox key={index} message={message} />
              ))}

              {isSending && (
                <MessageBox
                  message={{ role: "assistant", content: "" }}
                  isTyping={true}
                />
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <ChatInput
          currentMessage={currentMessage}
          onMessageChange={onMessageChange}
          onSendMessage={onSendMessage}
          onKeyDown={onKeyDown}
          onSuggestedQuestionClick={onSuggestedQuestionClick}
          suggestedQuestions={suggestedQuestions}
          isSending={isSending}
          showSuggestedQuestions={hasMessages}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
