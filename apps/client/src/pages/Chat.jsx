import React from "react";
import ChatInterface from "../components/ChatInterface";
import { useChat } from "../hooks/useChat";

const Chat = () => {
  const {
    conversationHistory,
    currentMessage,
    isSending,
    error,
    messagesEndRef,
    suggestedQuestions,
    handleMessageChange,
    handleKeyDown,
    handleSuggestedQuestionClick,
    handleSendMessage,
    clearHistory,
  } = useChat({
    initialMessage:
      "👋 你好！我是AI助手，很高兴为您服务。我可以帮助您解答问题、提供建议或进行有趣的对话。请随时向我提问！",
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI助手对话</h1>
        <p className="text-base-content/70">
          与AI助手进行自由对话，无需上传任何文件
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 聊天界面 */}
        <div className="lg:col-span-3">
          <ChatInterface
            conversationHistory={conversationHistory}
            currentMessage={currentMessage}
            isSending={isSending}
            messagesEndRef={messagesEndRef}
            onMessageChange={handleMessageChange}
            onSendMessage={handleSendMessage}
            onKeyDown={handleKeyDown}
            onSuggestedQuestionClick={handleSuggestedQuestionClick}
            suggestedQuestions={suggestedQuestions}
            title="AI助手对话"
            emptyStateMessage="开始与AI助手对话吧！"
          />
        </div>

        {/* 侧边栏 */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">操作面板</h3>

              <div className="space-y-4">
                <button
                  onClick={clearHistory}
                  className="btn btn-outline btn-sm w-full"
                  disabled={conversationHistory.length === 0}
                >
                  清空对话
                </button>

                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}

                <div className="text-sm text-base-content/70">
                  <p>💡 提示：</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>点击快捷问题快速开始对话</li>
                    <li>按Enter发送消息，Shift+Enter换行</li>
                    <li>可以询问任何问题或寻求建议</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
