/**
 * 分析页面组件
 */
import React from "react";
import { useResumeAnalysis } from "../hooks/useResumeAnalysis";
import ResumeUpload from "../components/sidebar/ResumeUpload";
import FileInfo from "../components/sidebar/FileInfo";
import AnalysisTypeSelector from "../components/sidebar/AnalysisTypeSelector";
import ErrorAlert from "../components/sidebar/ErrorAlert";
import ChatInterface from "../components/chatBox/ChatInterface";

function Analysis() {
  const {
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
  } = useResumeAnalysis();

  return (
    <div className="flex flex-col min-h-[90vh] mx-auto pt-6 px-6">
      {/* 页面标题 */}
      <div className="hero bg-base-200 basis-1/12 rounded-lg mb-6">
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

          {/* 文件信息 */}
          <FileInfo file={selectedFile} onRemove={resetAnalysis} />

          {/* 分析类型选择 */}
          <AnalysisTypeSelector
            analysisType={analysisType}
            onAnalysisTypeChange={handleAnalysisTypeChange}
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
        </div>

        {/* 右侧：对话栏 */}
        <div className="xl:w-3/4">
          <div className="card bg-base-100 shadow-lg h-full">
            <div className="card-body p-0">
              <ChatInterface
                messages={messages}
                onSendMessage={sendMessage}
                streamingContent={streamingContent}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
