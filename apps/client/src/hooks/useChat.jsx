import { useState, useCallback, useEffect, useRef } from "react";
import { apiClient } from "../services/apiService";

const useChat = (userId) => {
  const [conversationIds, setConversationIds] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  // 请求控制
  const abortControllerRef = useRef(null);

  // 处理错误关闭
  const handleErrorClose = useCallback(() => {
    setError(null);
  }, []);

  // 获取用户的对话列表
  const fetchConversations = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      console.log("获取用户对话列表:", userId);

      const conversations = await apiClient.getUserConversations(userId, {
        limit: 20,
        order: "desc",
      });

      console.log("用户对话列表获取成功:", conversations);
      setConversationIds(conversations.map((conv) => conv.id));

      // 如果没有对话，设置为null
      if (conversations.length === 0) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("获取对话列表失败:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 获取对话消息
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setError(null);
      console.log("获取对话消息:", conversationId);

      const result = await apiClient.getConversationMessages(conversationId, {
        limit: 50,
        order: "asc",
      });

      console.log("对话消息获取成功:", result);
      setMessages(result.messages || []);
    } catch (err) {
      console.error("获取对话消息失败:", err);
      setError(err.message);
    }
  }, []);

  // 切换对话
  const switchConversation = useCallback(
    async (conversationId) => {
      setCurrentConversationId(conversationId);
      await fetchMessages(conversationId);
    },
    [fetchMessages]
  );

  // 处理流式数据
  const handleStreamData = useCallback(
    (data) => {
      console.log("收到流式数据:", data);

      switch (data.type) {
        case "conversation_created":
          if (data.conversation_id) {
            console.log("收到新对话ID:", data.conversation_id);
            setCurrentConversationId(data.conversation_id);
            // 将新对话ID添加到对话列表
            setConversationIds((prev) => {
              if (!prev.includes(data.conversation_id)) {
                return [data.conversation_id, ...prev];
              }
              return prev;
            });
          }
          break;

        case "status":
          console.log("收到状态更新:", data.status);
          if (data.status === "in_progress") {
            setIsStreaming(true);
          }
          break;

        case "content":
          if (data.content) {
            console.log("收到增量内容:", data.content);
            setStreamingContent((prev) => prev + data.content);
          }
          break;

        case "content_complete":
          if (data.content) {
            console.log("收到完整内容:", data.content);
            // 创建助手消息
            const assistantMessage = {
              id: data.message_id || Date.now().toString(),
              role: "assistant",
              content: data.content,
              timestamp: new Date().toISOString(),
              contentType: data.content_type || "text",
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setStreamingContent("");
          }
          break;

        case "verbose":
          console.log("收到详细信息:", data.content);
          // 可以选择是否显示详细信息
          break;

        case "suggestion":
          console.log("收到建议问题:", data.content);
          // 可以在这里处理建议问题显示
          break;

        case "chat_completed":
          console.log("对话完成:", data.chat_id);
          setIsStreaming(false);
          setStreamingContent("");
          console.log("聊天状态已重置");
          break;

        case "error":
          console.error("收到错误:", data.error);
          setError(data.error);
          setIsStreaming(false);
          setStreamingContent("");
          break;

        case "end":
          console.log("流式响应结束");
          setIsStreaming(false);
          if (streamingContent) {
            setStreamingContent("");
          }
          break;

        default:
          console.log("未知数据类型:", data.type);
          break;
      }
    },
    [streamingContent]
  );

  // 发送消息
  const sendMessage = useCallback(
    async (message, analysisType = "evaluate", file = null) => {
      try {
        console.log("开始发送消息:", {
          message,
          analysisType,
          currentConversationId,
          file: file ? file.name : null,
        });

        // 重置状态
        setIsStreaming(true);
        setStreamingContent("");
        setError(null);

        // 创建新的AbortController
        abortControllerRef.current = new AbortController();

        // 添加用户消息到本地
        if (message?.trim() || file) {
          const userMessage = {
            id: Date.now().toString(),
            role: "user",
            content: message || (file ? `[文件: ${file.name}]` : ""),
            timestamp: new Date().toISOString(),
            contentType: file ? "file" : "text",
          };
          setMessages((prev) => [...prev, userMessage]);
        }

        // 发送消息到后端
        console.log("调用API发送消息，文件:", file ? file.name : "无");
        const result = await apiClient.sendMessageToConversation(
          currentConversationId,
          message,
          analysisType,
          handleStreamData,
          abortControllerRef.current.signal,
          file
        );

        console.log("消息发送完成:", result);
        return result;
      } catch (err) {
        console.error("发送消息失败:", err);

        // 处理特定的错误类型
        if (err.name === "AbortError" || err.message.includes("取消")) {
          console.log("请求被用户取消");
          return;
        }
      }
    },
    [currentConversationId, handleStreamData]
  );

  // 初始化：获取对话列表
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 当切换对话时，获取消息
  useEffect(() => {
    if (currentConversationId) {
      fetchMessages(currentConversationId);
    }
  }, [currentConversationId, fetchMessages]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // 状态
    conversationIds,
    currentConversationId,
    messages,
    isLoading,
    error,
    isStreaming,
    streamingContent,

    // 方法
    fetchConversations,
    switchConversation,
    sendMessage,
    handleErrorClose,
  };
};

export default useChat;
