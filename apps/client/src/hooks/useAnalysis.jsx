import { useState, useCallback } from "react";
import apiClient from "../services/apiService";

const useAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisType, setAnalysisType] = useState("evaluate");
  const [fileId, setFileId] = useState(null);
  const [error, setError] = useState(null);

  // 处理文件选择
  const handleFileChange = useCallback(async (file) => {
    try {
      if (file) {
        setSelectedFile(file);
        const fileId = await apiClient.uploadFile(file);
        setFileId(fileId);
        setError(null);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // 处理分析类型变更
  const handleAnalysisTypeChange = useCallback((type) => {
    setAnalysisType(type);
    setError(null);
  }, []);

  // 处理错误关闭
  const handleErrorClose = useCallback(() => {
    setError(null);
  }, []);

  // 重置分析状态
  const resetAnalysis = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  return {
    // 状态
    selectedFile,
    analysisType,
    error,
    fileId,

    // 方法
    handleFileChange,
    handleAnalysisTypeChange,
    handleErrorClose,
    resetAnalysis,
  };
};

export { useAnalysis };
