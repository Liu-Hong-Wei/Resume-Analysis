import React from "react";
import { SUGGESTED_QUESTIONS } from "../hooks/useResumeAnalysis";

const ChatInterface = ({
  resumeText,
  conversationHistory,
  currentMessage,
  isSending,
  messagesEndRef,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  onSuggestedQuestionClick,
}) => {
  return (
    <div className="card bg-base-100 shadow-xl h-[600px] flex flex-col">
      <div className="card-body flex flex-col h-full">
        <h2 className="card-title">AI助手对话</h2>

        {/* 对话区域 */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {!resumeText ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-base-content/70">请先上传简历文件开始对话</p>
            </div>
          ) : conversationHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-base-content/70">
                点击"开始AI分析"按钮开始对话
              </p>
            </div>
          ) : (
            conversationHistory.map((message, index) => (
              <div
                key={index}
                className={`chat ${message.role === "user" ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    {message.role === "user" ? (
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
                    message.role === "user"
                      ? "chat-bubble-primary"
                      : "chat-bubble-secondary"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))
          )}

          {isSending && (
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full bg-secondary text-secondary-content flex items-center justify-center">
                  🤖
                </div>
              </div>
              <div className="chat-bubble chat-bubble-secondary">
                <span className="loading loading-dots loading-sm"></span>
                AI正在思考中...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        {resumeText && (
          <div className="space-y-4">
            {/* 快捷问题 */}
            {conversationHistory.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestedQuestionClick(question)}
                    className="btn btn-outline btn-sm"
                    disabled={isSending}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {/* 消息输入 */}
            <div className="flex gap-2">
              <textarea
                value={currentMessage}
                onChange={onMessageChange}
                onKeyPress={onKeyPress}
                placeholder="输入您的问题..."
                className="textarea textarea-bordered flex-1"
                rows="2"
                disabled={isSending}
              />
              <button
                onClick={onSendMessage}
                disabled={!currentMessage.trim() || isSending}
                className="btn btn-primary"
              >
                {isSending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "发送"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
