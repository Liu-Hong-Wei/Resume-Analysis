import { useState, useRef, useEffect } from "react";

// API配置
const API_BASE_URL = "http://localhost:3001/api";

// 默认快捷问题
export const DEFAULT_SUGGESTED_QUESTIONS = [
  "你好，请介绍一下你自己",
  "你能帮我做什么？",
  "有什么有趣的话题可以聊吗？",
  "请给我一些建议",
  "谢谢你的帮助",
];

export const useChat = (options = {}) => {
  const {
    apiEndpoint = "/chat",
    initialMessage = "",
    suggestedQuestions = DEFAULT_SUGGESTED_QUESTIONS,
    contextData = null, // 可选的上下文数据（如简历文本）
  } = options;

  // 状态管理
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  // 发送消息API调用
  const sendMessage = async (message = currentMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    setConversationHistory((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsSending(true);
    setError(null);

    try {
      const requestBody = {
        message: message,
        conversationHistory: conversationHistory,
      };

      // 如果有上下文数据，添加到请求中
      if (contextData) {
        requestBody.contextData = contextData;
      }

      const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: "assistant",
          content: data.response,
        };

        setConversationHistory((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "发送失败");
      }
    } catch (error) {
      console.error("发送错误:", error);
      const errorMessage = {
        role: "assistant",
        content: `❌ 抱歉，发送消息时出现错误: ${error.message}`,
      };
      setConversationHistory((prev) => [...prev, errorMessage]);
      setError("发送失败: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  // 处理消息变化
  const handleMessageChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  // 键盘事件处理
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 快捷问题点击处理
  const handleSuggestedQuestionClick = (question) => {
    sendMessage(question);
  };

  // 发送当前消息
  const handleSendMessage = () => {
    sendMessage();
  };

  // 清空对话历史
  const clearHistory = () => {
    setConversationHistory([]);
    setError(null);
  };

  // 添加系统消息
  const addSystemMessage = (content) => {
    const systemMessage = {
      role: "assistant",
      content: content,
    };
    setConversationHistory((prev) => [...prev, systemMessage]);
  };

  // 设置初始消息
  useEffect(() => {
    if (initialMessage) {
      addSystemMessage(initialMessage);
    }
  }, [initialMessage]);

  return {
    // 状态
    conversationHistory,
    currentMessage,
    isSending,
    error,
    messagesEndRef,
    suggestedQuestions,

    // 方法
    sendMessage,
    handleMessageChange,
    handleKeyDown,
    handleSuggestedQuestionClick,
    handleSendMessage,
    clearHistory,
    addSystemMessage,
    setCurrentMessage,
  };
};
