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
  isStreaming,
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

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping || isStreaming) return;

    const messageToSend = inputValue.trim();
    setIsTyping(true);
    setInputValue("");

    try {
      await onSendMessage(messageToSend);
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

  // 渲染状态指示器
  const renderStatusIndicator = () => {
    if (isStreaming) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-md">
          <div className="animate-pulse h-2 w-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-green-600">AI正在思考...</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 状态指示器 */}
      {renderStatusIndicator() && (
        <div className="p-4 border-b">{renderStatusIndicator()}</div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingContent && !isStreaming && (
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
      <div className="border-t p-4">
        <div className="flex gap-2">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            disabled={isStreaming || isTyping}
            multiline
          />
          <ChatSendButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isStreaming || isTyping}
            isLoading={isStreaming || isTyping}
          />
        </div>

        {/* 输入状态提示 */}
        {(isStreaming || isTyping) && (
          <div className="mt-2 text-sm text-gray-500">
            {isTyping && "正在发送..."}
            {isStreaming && !isTyping && "AI正在回复..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
