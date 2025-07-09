import { useState, useRef, useEffect } from "react";
import { apiService } from "../services/apiService";

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
    apiEndpoint = "/analyze",
    initialMessage = "",
    suggestedQuestions = DEFAULT_SUGGESTED_QUESTIONS,
    contextData = null,
    analysisType = "evaluate",
  } = options;

  // 状态管理 - 所有hooks都在顶层调用
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [currentSuggestedQuestions, setCurrentSuggestedQuestions] =
    useState(suggestedQuestions);

  const messagesEndRef = useRef(null);

  // 当suggestedQuestions变化时更新状态
  useEffect(() => {
    setCurrentSuggestedQuestions(suggestedQuestions);
  }, [suggestedQuestions]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory, streamingResponse]);

  // 流式发送消息API调用
  const sendMessageStream = async (message = currentMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    setConversationHistory((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsSending(true);
    setError(null);
    setStreamingResponse("");

    try {
      let finalResponse = "";

      await apiService.analyzeStream(
        {
          analysis_type: analysisType,
          question: message,
          contextData: contextData,
        },
        (data) => {
          if (data.type === "content") {
            finalResponse += data.content;
            setStreamingResponse(finalResponse);
          } else if (data.type === "error") {
            throw new Error(data.error);
          }
        }
      );

      // 流式响应结束
      setStreamingResponse("");

      const assistantMessage = {
        role: "assistant",
        content: finalResponse,
      };

      setConversationHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("发送错误:", error);
      const errorMessage = {
        role: "assistant",
        content: `❌ 抱歉，发送消息时出现错误: ${error.message}`,
      };
      setConversationHistory((prev) => [...prev, errorMessage]);
      setError("发送失败: " + error.message);
      setStreamingResponse("");
    } finally {
      setIsSending(false);
    }
  };

  // 非流式发送消息API调用（备用方案）
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
      const data = await apiService.analyze({
        analysis_type: analysisType,
        question: message,
        contextData: contextData,
      });

      if (data.success) {
        const assistantMessage = {
          role: "assistant",
          content: data.result,
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
      sendMessageStream();
    }
  };

  // 快捷问题点击处理
  const handleSuggestedQuestionClick = (question) => {
    sendMessageStream(question);
  };

  // 发送当前消息
  const handleSendMessage = () => {
    sendMessageStream();
  };

  // 清空对话历史
  const clearHistory = () => {
    setConversationHistory([]);
    setError(null);
    setStreamingResponse("");
  };

  // 添加系统消息
  const addSystemMessage = (content) => {
    const systemMessage = {
      role: "assistant",
      content: content,
    };
    setConversationHistory((prev) => [...prev, systemMessage]);
  };

  return {
    // 状态
    conversationHistory,
    currentMessage,
    isSending,
    error,
    messagesEndRef,
    suggestedQuestions: currentSuggestedQuestions,
    streamingResponse,

    // 方法
    sendMessage,
    sendMessageStream,
    handleMessageChange,
    handleKeyDown,
    handleSuggestedQuestionClick,
    handleSendMessage,
    clearHistory,
    addSystemMessage,
    setCurrentMessage,
    setError,
  };
};
