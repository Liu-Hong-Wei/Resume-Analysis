import React from "react";
import { useResumeAnalysis } from "../hooks/useResumeAnalysis";
import ResumeUpload from "../components/ResumeUpload";
import AnalysisTypeSelector from "../components/AnalysisTypeSelector";
import ChatInterface from "../components/ChatInterface";
import ResumePreview from "../components/ResumePreview";
import ErrorAlert from "../components/ErrorAlert";

function Analysis() {
  // 使用useResumeAnalysis hook
  const resumeAnalysis = useResumeAnalysis();

  // 解构所有需要的状态和方法
  const {
    // 状态
    selectedFile,
    analysisType,
    isAnalyzing,
    resumeText,
    streamingContent,
    conversationHistory,
    currentMessage,
    isSending,
    streamingResponse,
    error,
    messagesEndRef,
    suggestedQuestions,

    // 方法
    setAnalysisType,
    setCurrentMessage,
    handleFileChange,
    analyzeResumeStream,
    sendMessage,
    handleKeyDown,
    setError,
    handleSuggestedQuestionClick,
  } = resumeAnalysis;

  // 处理错误关闭
  const handleErrorClose = () => {
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-[90vh] mx-auto pt-6 px-6">
      {/* 页面标题 */}
      <div className="hero bg-base-200 basis-1/12">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">AI简历分析</h1>
            <p className="py-2">上传您的简历，与AI助手进行智能对话</p>
          </div>
        </div>
      </div>

      {/* 页面内容 */}
      <div className="flex xl:flex-row flex-col gap-4 basis-11/12 flex-1">
        {/* 左侧：上传和分析设置 */}
        <div className="xl:w-1/4 space-y-6">
          {/* 错误提示 */}
          <ErrorAlert error={error} onClose={handleErrorClose} />

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
            onClick={analyzeResumeStream}
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

          {/* 流式内容显示 */}
          {streamingContent && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">实时分析</h2>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{streamingContent}</p>
                </div>
              </div>
            </div>
          )}

          {/* 简历预览 */}
          <ResumePreview resumeText={resumeText} />
        </div>

        {/* 右侧：对话栏 */}
        <div className="xl:w-3/4">
          <ChatInterface
            resumeText={resumeText}
            conversationHistory={conversationHistory}
            currentMessage={currentMessage}
            isSending={isSending}
            streamingResponse={streamingResponse}
            messagesEndRef={messagesEndRef}
            onMessageChange={(e) => setCurrentMessage(e.target.value)}
            onSendMessage={sendMessage}
            onKeyDown={handleKeyDown}
            onSuggestedQuestionClick={handleSuggestedQuestionClick}
            suggestedQuestions={suggestedQuestions}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}

export default Analysis;
