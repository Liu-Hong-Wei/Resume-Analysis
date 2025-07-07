import React from "react";
import { useResumeAnalysis } from "../hooks/useResumeAnalysis";
import ResumeUpload from "../components/ResumeUpload";
import AnalysisTypeSelector from "../components/AnalysisTypeSelector";
import ChatInterface from "../components/ChatInterface";
import ResumePreview from "../components/ResumePreview";
import ErrorAlert from "../components/ErrorAlert";

function Analysis() {
  const {
    // 状态
    selectedFile,
    analysisType,
    isAnalyzing,
    resumeText,
    conversationHistory,
    currentMessage,
    isSending,
    error,
    messagesEndRef,

    // 方法
    setAnalysisType,
    setCurrentMessage,
    handleFileChange,
    analyzeResume,
    sendMessage,
    handleKeyPress,
  } = useResumeAnalysis();

  // 处理快捷问题点击
  const handleSuggestedQuestionClick = (question) => {
    setCurrentMessage(question);
  };

  // 处理错误关闭
  const handleErrorClose = () => {
    // 这里可以添加清除错误的逻辑
  };

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="hero bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">AI简历分析</h1>
            <p className="py-6">
              上传您的简历，与AI助手进行智能对话，获得专业的分析和优化建议
            </p>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      <ErrorAlert error={error} onClose={handleErrorClose} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：上传和分析设置 */}
        <div className="space-y-6">
          {/* 文件上传区域 */}
          <ResumeUpload
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
          />

          {/* 分析类型选择 */}
          <AnalysisTypeSelector
            analysisType={analysisType}
            onAnalysisTypeChange={setAnalysisType}
          />

          {/* 开始分析按钮 */}
          <button
            onClick={analyzeResume}
            disabled={!selectedFile || isAnalyzing}
            className="btn btn-primary btn-block btn-lg"
          >
            {isAnalyzing ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                AI分析中...
              </>
            ) : (
              "开始AI分析"
            )}
          </button>

          {/* 简历预览 */}
          <ResumePreview resumeText={resumeText} />
        </div>

        {/* 右侧：对话栏 */}
        <ChatInterface
          resumeText={resumeText}
          conversationHistory={conversationHistory}
          currentMessage={currentMessage}
          isSending={isSending}
          messagesEndRef={messagesEndRef}
          onMessageChange={(e) => setCurrentMessage(e.target.value)}
          onSendMessage={sendMessage}
          onKeyPress={handleKeyPress}
          onSuggestedQuestionClick={handleSuggestedQuestionClick}
        />
      </div>
    </div>
  );
}

export default Analysis;
