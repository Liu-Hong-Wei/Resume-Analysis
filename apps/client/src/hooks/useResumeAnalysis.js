import { useState, useRef, useEffect } from "react";
import { useChat } from "./useChat";

// API配置
const API_BASE_URL = "http://localhost:3001/api";

// 分析类型配置
export const ANALYSIS_TYPES = [
  {
    id: "comprehensive",
    title: "全面分析",
    description: "对简历进行全方位分析，包括技能匹配等",
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
  const [initialAnalysis, setInitialAnalysis] = useState(null);

  // 使用通用聊天hook
  const chatHook = useChat({
    apiEndpoint: "/chat-analysis",
    suggestedQuestions: SUGGESTED_QUESTIONS,
    contextData: resumeText, // 将简历文本作为上下文数据
  });

  // 文件处理
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setResumeText("");
    setInitialAnalysis(null);
    chatHook.clearHistory();
  };

  // 简历分析API调用
  const analyzeResume = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    chatHook.setError(null);

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
        const initialMessage = `📊 **简历分析完成！**

**整体评分**: ${parsedResult.overallScore || "N/A"} / 100
**技能匹配度**: ${parsedResult.skillMatch || "N/A"}
**经验相关性**: ${parsedResult.experienceRelevance || "N/A"}

**详细分析**:
${parsedResult.analysis || "分析内容加载中..."}

**优化建议**:
${parsedResult.suggestions ? parsedResult.suggestions.map((s) => `• ${s}`).join("\n") : "暂无具体建议"}

您可以继续向我提问关于简历的任何问题，我会为您提供更详细的分析和建议！`;

        chatHook.addSystemMessage(initialMessage);
      } else {
        throw new Error(data.error || "分析失败");
      }
    } catch (error) {
      console.error("分析错误:", error);
      chatHook.setError("分析失败: " + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 重置状态
  const resetAnalysis = () => {
    setSelectedFile(null);
    setResumeText("");
    setInitialAnalysis(null);
    chatHook.clearHistory();
  };

  return {
    // 状态
    selectedFile,
    analysisType,
    isAnalyzing,
    resumeText,
    initialAnalysis,
    ...chatHook, // 展开聊天hook的所有状态和方法

    // 方法
    setSelectedFile,
    setAnalysisType,
    handleFileChange,
    analyzeResume,
    resetAnalysis,
  };
};
