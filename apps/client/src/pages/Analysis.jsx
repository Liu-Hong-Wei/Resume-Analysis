/**
 * 分析页面组件
 */
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAnalysis } from "../hooks/useAnalysis";
import useChat from "../hooks/useChat";
import { apiClient } from "../services/apiService";
import ResumeUpload from "../components/sidebar/ResumeUpload";
import FileInfo from "../components/sidebar/FileInfo";
import AnalysisTypeSelector from "../components/sidebar/AnalysisTypeSelector";
import ErrorAlert from "../components/sidebar/ErrorAlert";
import ChatList from "../components/sidebar/ChatList";
import ChatInterface from "../components/chatBox/ChatInterface";

export const ANALYSIS_TYPES = [
  {
    id: "evaluate",
    title: "简历评估",
    description: "分析简历内容",
    icon: "👤",
  },
  {
    id: "generate",
    title: "简历生成",
    description: "生成简历内容",
    icon: "✏️",
  },
  {
    id: "mock",
    title: "模拟面试",
    description: "模拟面试内容",
    icon: "🤖",
  },
];

function Analysis() {
  // 使用Clerk hooks获取用户信息
  const { user, isLoaded } = useUser();

  // 如果用户信息还在加载中，显示加载状态
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // 使用hooks
  const {
    selectedFile,
    analysisType,
    error: analysisError,
    fileId,

    handleFileChange,
    handleAnalysisTypeChange,
    handleErrorClose: handleAnalysisErrorClose,
    resetAnalysis,
  } = useAnalysis();

  const {
    conversationIds,
    currentConversationId,
    messages,
    isLoading,
    error: chatError,
    isStreaming,
    streamingContent,
    switchConversation,
    sendMessage,
    handleErrorClose: handleChatErrorClose,
  } = useChat(user?.id);

  // 处理错误
  const error = analysisError || chatError;
  const handleErrorClose = () => {
    handleAnalysisErrorClose();
    handleChatErrorClose();
  };

  useEffect(() => {
    console.log("messages", messages);
    console.log("streamingContent", streamingContent);
  }, [messages, streamingContent]);

  // 处理对话切换
  const handleSwitchConversation = async (conversationId) => {
    await switchConversation(conversationId);
  };

  // 处理对话删除
  const handleDeleteConversation = async (conversationId) => {
    // TODO: 实现删除对话的逻辑
    console.log("删除对话:", conversationId);
  };

  return (
    <div className="flex flex-col min-h-[92vh] mx-auto px-4 pt-4 xl:flex-row gap-2 basis-11/12 flex-1">
      {/* 左侧：上传和分析设置 */}
      <div className="xl:w-1/4 space-y-2">
        {/* 错误提示 */}
        <ErrorAlert error={error} onClose={handleErrorClose} />

        {/* 分析类型选择 */}
        <AnalysisTypeSelector
          analysisType={analysisType}
          onAnalysisTypeChange={handleAnalysisTypeChange}
        />

        {/* 文件上传区域 */}
        <ResumeUpload
          selectedFile={selectedFile}
          onFileChange={handleFileChange}
          fileId={fileId}
        />

        {/* 文件信息 */}
        <FileInfo file={selectedFile} onRemove={resetAnalysis} />

        {/* 对话列表 */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-lg">对话历史</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : (
              <ChatList
                conversations={conversationIds.map((id) => ({
                  id,
                  title: `对话 ${id.slice(-6)}`,
                }))}
                currentConversationId={currentConversationId}
                onSwitchConversation={handleSwitchConversation}
                onDeleteConversation={handleDeleteConversation}
              />
            )}
          </div>
        </div>
      </div>

      {/* 右侧：对话栏 */}
      <div className="xl:w-3/4 min-h-[90vh]">
        <div className="card bg-base-100 shadow-lg h-full">
          <div className="card-body p-0">
            <ChatInterface
              messages={messages}
              onSendMessage={(message, selectedFile) =>
                sendMessage(message, analysisType, selectedFile || null)
              }
              streamingContent={streamingContent}
              isStreaming={isStreaming}
              analysisType={analysisType}
              file={selectedFile}
              onFileSelect={handleFileChange}
              onRemoveFile={resetAnalysis}
              currentConversation={
                currentConversationId ? { id: currentConversationId } : null
              }
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
