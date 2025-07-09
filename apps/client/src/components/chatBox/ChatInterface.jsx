import React, { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatSendButton from "./ChatSendButton";
import MessageBox from "./MessageBox";

/**
 * 聊天界面组件
 */
const ChatInterface = ({
  messages = [],
  onSendMessage,
  streamingContent,
  isAnalyzing,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    setIsTyping(true);
    try {
      await onSendMessage(inputValue);
      setInputValue("");
    } catch (error) {
      console.error("发送消息失败:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 聊天头部 */}
      <div className="flex-shrink-0 p-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI 助手对话</h2>
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <span className="loading loading-spinner loading-xs"></span>
              <span>AI 分析中...</span>
            </div>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingContent && !isAnalyzing && (
          <div className="flex items-center justify-center h-full text-center text-base-content/60">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold mb-2">
                欢迎使用 AI 简历分析
              </h3>
              <p className="text-sm">
                上传您的简历后，AI 助手将为您提供专业的分析和建议。
                您也可以直接与 AI 助手对话，询问任何关于简历的问题。
              </p>
            </div>
          </div>
        )}

        {/* 显示消息 */}
        {messages.map((message) => (
          <MessageBox key={message.id} message={message} />
        ))}

        {/* 流式内容显示 */}
        {streamingContent && (
          <div className="chat chat-start">
            <div className="chat-bubble chat-bubble-primary">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{streamingContent}</p>
                {isAnalyzing && (
                  <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1"></span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 滚动到底部的锚点 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="flex-shrink-0 p-4 border-t border-base-300">
        <div className="flex gap-2">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题..."
            disabled={isTyping || isAnalyzing}
          />
          <ChatSendButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping || isAnalyzing}
            isLoading={isTyping}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
