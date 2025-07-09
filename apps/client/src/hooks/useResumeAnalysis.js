import { useState, useCallback } from "react";
import { analysisService } from "../services/apiService";

// 分析类型配置
export const ANALYSIS_TYPES = [
  {
    id: "evaluate",
    title: "简历评估",
    description: "全面分析简历优缺点",
    icon: "📊",
  },
  {
    id: "generate",
    title: "简历优化",
    description: "AI生成改进建议",
    icon: "✨",
  },
  {
    id: "mock",
    title: "模拟面试",
    description: "基于简历进行面试",
    icon: "🎯",
  },
];

/**
 * 简历分析 Custom Hook
 * 参考 Coze JS 官方示例的最佳实践
 */
export const useResumeAnalysis = () => {
  // 基础状态
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisType, setAnalysisType] = useState("evaluate");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  // 文件处理
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setStreamingContent("");
      setMessages([]);
    }
  }, []);

  // 分析类型处理
  const handleAnalysisTypeChange = useCallback((type) => {
    setAnalysisType(type);
    setError(null);
    setStreamingContent("");
    setMessages([]);
  }, []);

  // 错误处理
  const handleErrorClose = useCallback(() => {
    setError(null);
  }, []);

  // 重置分析
  const resetAnalysis = useCallback(() => {
    setSelectedFile(null);
    setStreamingContent("");
    setMessages([]);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  // 流式分析处理
  const handleStreamData = useCallback((data) => {
    if (data.type === "content") {
      setStreamingContent((prev) => prev + data.content);
    } else if (data.type === "message") {
      setMessages((prev) => [...prev, data.message]);
    }
  }, []);

  // 开始分析
  const analyzeResumeStream = useCallback(async () => {
    if (!selectedFile) {
      setError("请先选择简历文件");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setStreamingContent("");
    setMessages([]);

    try {
      let result;

      switch (analysisType) {
        case "evaluate":
          result = await analysisService.evaluateResumeStream(
            selectedFile,
            null,
            handleStreamData,
          );
          break;
        case "generate":
          result = await analysisService.generateResumeStream(
            selectedFile,
            null,
            handleStreamData,
          );
          break;
        case "mock":
          result = await analysisService.mockInterviewStream(
            selectedFile,
            null,
            handleStreamData,
          );
          break;
        default:
          throw new Error("不支持的分析类型");
      }

      // 分析完成后的处理
      if (result && result.success) {
        console.log("分析完成:", result);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("分析已取消");
      } else {
        console.error("分析失败:", error);
        setError(error.message || "分析过程中发生错误");
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile, analysisType, handleStreamData]);


  // 发送消息到聊天
  const sendMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    const robotMessage = {
      id: Date.now(),
      role: "robot",
      content: "AI 助手正在分析中...",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, robotMessage]);

    // TODO: 这里可以添加发送消息到后端的逻辑
    // 暂时只是添加到本地消息列表
  }, []);

  return {
    // 状态
    selectedFile,
    analysisType,
    isAnalyzing,
    streamingContent,
    error,
    messages,

    // 方法
    handleFileChange,
    handleAnalysisTypeChange,
    handleErrorClose,
    resetAnalysis,
    analyzeResumeStream,
    sendMessage,

    // 常量
    ANALYSIS_TYPES,
  };
};
