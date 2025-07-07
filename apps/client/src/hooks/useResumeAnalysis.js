import { useState, useRef, useEffect } from "react";

// API配置
const API_BASE_URL = "http://localhost:3001/api";

// 分析类型配置
export const ANALYSIS_TYPES = [
  {
    id: "comprehensive",
    title: "全面分析",
    description: "对简历进行全方位分析，包括技能匹配、经验评估等",
    icon: "🔍",
  },
  {
    id: "skills",
    title: "技能分析",
    description: "重点分析技能匹配度和技能展示效果",
    icon: "💡",
  },
  {
    id: "experience",
    title: "经验分析",
    description: "深度分析工作经验的相关性和描述质量",
    icon: "📈",
  },
  {
    id: "optimization",
    title: "优化建议",
    description: "提供具体的简历优化建议和改进方案",
    icon: "✨",
  },
];

// 快捷问题
export const SUGGESTED_QUESTIONS = [
  "我的技能描述如何改进？",
  "工作经验部分有什么问题？",
  "如何提高简历的竞争力？",
  "教育背景部分需要优化吗？",
  "有什么具体的修改建议？",
];

export const useResumeAnalysis = () => {
  // 状态管理
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisType, setAnalysisType] = useState("comprehensive");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [initialAnalysis, setInitialAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  // 文件处理
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setResumeText("");
    setConversationHistory([]);
    setInitialAnalysis(null);
    setError(null);
  };

  // 简历分析API调用
  const analyzeResume = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("analysisType", analysisType);

      const response = await fetch(`${API_BASE_URL}/analyze-resume`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResumeText(data.originalText);

        // 解析LLM返回的JSON结果
        let parsedResult;
        try {
          parsedResult = JSON.parse(data.result);
        } catch (e) {
          parsedResult = { analysis: data.result };
        }

        setInitialAnalysis(parsedResult);

        // 添加初始分析消息到对话历史
        const initialMessage = {
          role: "assistant",
          content: `📊 **简历分析完成！**

**整体评分**: ${parsedResult.overallScore || "N/A"} / 100
**技能匹配度**: ${parsedResult.skillMatch || "N/A"}
**经验相关性**: ${parsedResult.experienceRelevance || "N/A"}

**详细分析**:
${parsedResult.analysis || "分析内容加载中..."}

**优化建议**:
${parsedResult.suggestions ? parsedResult.suggestions.map((s) => `• ${s}`).join("\n") : "暂无具体建议"}

您可以继续向我提问关于简历的任何问题，我会为您提供更详细的分析和建议！`,
        };

        setConversationHistory([initialMessage]);
      } else {
        throw new Error(data.error || "分析失败");
      }
    } catch (error) {
      console.error("分析错误:", error);
      setError("分析失败: " + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 发送消息API调用
  const sendMessage = async () => {
    if (!currentMessage.trim() || !resumeText) return;

    const userMessage = {
      role: "user",
      content: currentMessage,
    };

    setConversationHistory((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chat-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          resumeText: resumeText,
          conversationHistory: conversationHistory,
        }),
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

  // 键盘事件处理
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 重置状态
  const resetAnalysis = () => {
    setSelectedFile(null);
    setResumeText("");
    setConversationHistory([]);
    setInitialAnalysis(null);
    setCurrentMessage("");
    setError(null);
  };

  return {
    // 状态
    selectedFile,
    analysisType,
    isAnalyzing,
    resumeText,
    conversationHistory,
    currentMessage,
    isSending,
    initialAnalysis,
    error,
    messagesEndRef,

    // 方法
    setSelectedFile,
    setAnalysisType,
    setCurrentMessage,
    handleFileChange,
    analyzeResume,
    sendMessage,
    handleKeyPress,
    resetAnalysis,
  };
};
