import { useState, useMemo } from "react";
import { useChat } from "./useChat";
import { apiService } from "../services/apiService";

// 分析类型配置 - 与server保持一致
export const ANALYSIS_TYPES = [
  {
    id: "evaluate",
    title: "简历评估",
    description: "分析简历内容，提供改进建议",
    icon: "🔍",
  },
  {
    id: "generate",
    title: "简历生成",
    description: "根据用户需求生成简历内容",
    icon: "✨",
  },
  {
    id: "mock",
    title: "模拟面试",
    description: "基于简历进行模拟面试",
    icon: "💬",
  },
];

// 快捷问题 - 根据分析类型调整
export const SUGGESTED_QUESTIONS = {
  evaluate: [
    "我的技能描述如何改进？",
    "工作经验部分有什么问题？",
    "如何提高简历的竞争力？",
    "教育背景部分需要优化吗？",
    "有什么具体的修改建议？",
  ],
  generate: [
    "请帮我生成一份技术简历",
    "如何突出我的项目经验？",
    "简历格式有什么建议？",
    "如何描述我的技能？",
    "请帮我优化简历结构",
  ],
  mock: [
    "请模拟面试官提问",
    "如何回答技术问题？",
    "面试中需要注意什么？",
    "如何展示我的优势？",
    "请给我一些面试建议",
  ],
};

export const useResumeAnalysis = () => {
  // 基本状态管理
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisType, setAnalysisType] = useState("evaluate");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [streamingContent, setStreamingContent] = useState("");

  // 计算当前分析类型的快捷问题
  const currentSuggestedQuestions = useMemo(() => {
    return SUGGESTED_QUESTIONS[analysisType] || SUGGESTED_QUESTIONS.evaluate;
  }, [analysisType]);

  // 使用useMemo来稳定useChat的参数
  const chatOptions = useMemo(
    () => ({
      apiEndpoint: "/analyze",
      suggestedQuestions: currentSuggestedQuestions,
      contextData: resumeText,
      analysisType: analysisType,
    }),
    [currentSuggestedQuestions, resumeText, analysisType]
  );

  // 使用通用聊天hook
  const chatHook = useChat(chatOptions);

  // 文件处理
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setResumeText("");
    setStreamingContent("");
    chatHook.clearHistory();
  };

  // 流式分析API调用
  const analyzeResumeStream = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    chatHook.setError(null);
    setStreamingContent("");

    try {
      let finalContent = "";

      await apiService.analyzeStream(
        {
          analysis_type: analysisType,
          file: selectedFile,
        },
        (data) => {
          if (data.type === "content") {
            finalContent += data.content;
            setStreamingContent(finalContent);
          } else if (data.type === "error") {
            throw new Error(data.error);
          }
        }
      );

      // 流式响应结束
      setStreamingContent("");

      // 添加分析结果到对话历史
      const analysisMessage = `📊 **${ANALYSIS_TYPES.find((t) => t.id === analysisType)?.title}完成！**

${finalContent}

您可以继续向我提问关于简历的任何问题，我会为您提供更详细的分析和建议！`;

      chatHook.addSystemMessage(analysisMessage);
    } catch (error) {
      console.error("分析错误:", error);
      chatHook.setError("分析失败: " + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 非流式分析API调用（备用方案）
  const analyzeResume = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    chatHook.setError(null);

    try {
      const data = await apiService.analyze({
        analysis_type: analysisType,
        file: selectedFile,
      });

      if (data.success) {
        setResumeText(data.originalText || "");

        // 添加分析结果到对话历史
        const analysisMessage = `📊 **${ANALYSIS_TYPES.find((t) => t.id === analysisType)?.title}完成！**

${data.result}

您可以继续向我提问关于简历的任何问题，我会为您提供更详细的分析和建议！`;

        chatHook.addSystemMessage(analysisMessage);
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
    setStreamingContent("");
    chatHook.clearHistory();
  };

  // 返回所有状态和方法
  return {
    // 状态
    selectedFile,
    analysisType,
    isAnalyzing,
    resumeText,
    streamingContent,
    ...chatHook, // 展开聊天hook的所有状态和方法

    // 方法
    setSelectedFile,
    setAnalysisType,
    handleFileChange,
    analyzeResume,
    analyzeResumeStream,
    resetAnalysis,
  };
};
