import React, { useState, useRef, useEffect, useCallback } from "react";
import ChatInput from "./ChatInput";
import ChatSendButton from "./ChatSendButton";
import MessageBox from "./MessageBox";

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * 聊天界面组件
 */
const ChatInterface = ({
  messages = [],
  onSendMessage,
  streamingContent,
  isStreaming,
  file,
  onFileSelect,
  onRemoveFile,
  currentConversation,
  analysisType,
  error,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // 调试信息：跟踪状态变化
  useEffect(() => {
    console.log("ChatInterface 状态变化:", {
      isStreaming,
      streamingContent: streamingContent ? streamingContent.length : 0,
      messagesCount: messages.length,
    });
  }, [isStreaming, streamingContent, messages.length]);

  // 自动滚动到底部（防抖版本）
  const scrollToBottom = useCallback(
    debounce(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100),
    []
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping || isStreaming) return;

    const messageToSend = inputValue.trim();
    const fileToSend = file;

    setIsTyping(true);
    setInputValue("");

    try {
      if (fileToSend) {
        await onSendMessage(messageToSend, fileToSend);
      } else {
        await onSendMessage(messageToSend);
      }
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
    <div className="flex flex-col h-[90vh] bg-white">
      {/* 聊天头部 */}
      <div className="flex-shrink-0 p-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI 助手对话</h2>
          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <span className="loading loading-spinner loading-xs"></span>
              <span>AI 正在思考...</span>
            </div>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingContent && !isStreaming && (
          <div className="flex items-center justify-center h-[70vh] text-center text-base-content/60 select-none ">
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
        {messages.map((message, index) => (
          <MessageBox
            key={message.id || index}
            message={message}
            isOwn={message.role === "user"}
            timestamp={message.timestamp}
          />
        ))}

        {/* 流式内容显示 */}
        {streamingContent && (
          <MessageBox
            message={{
              role: "assistant",
              content: streamingContent,
              timestamp: new Date().toISOString(),
            }}
            isOwn={false}
            isStreaming={true}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="flex gap-4 p-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          disabled={isStreaming || isTyping}
          onFileSelect={onFileSelect}
          file={file}
          onRemoveFile={onRemoveFile}
          multiline
        />
        <ChatSendButton
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isStreaming || isTyping}
          isLoading={isStreaming || isTyping}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
