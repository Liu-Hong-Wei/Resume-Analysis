// API 配置
import { ConfigManager } from "../../../server/config";
const API_BASE_URL = ConfigManager.server.API_BASE_URL;

// 分析类型常量
import { ANALYSIS_TYPES } from "../hooks/useResumeAnalysis";

/**
 * API 客户端类
 */
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * 创建请求头
   * @param {Object} additionalHeaders - 额外的请求头
   * @returns {Object} 请求头对象
   */
  createHeaders(additionalHeaders = {}) {
    return {
      "Content-Type": "application/json",
      ...additionalHeaders,
    };
  }

  /**
   * 发送 HTTP 请求
   * @param {string} endpoint - API 端点
   * @param {Object} options - 请求选项
   * @returns {Promise<Response>} 响应对象
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: this.createHeaders(options.headers),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response;
  }

  /**
   * 处理错误响应
   * @param {Response} response - fetch 响应对象
   * @returns {Promise<Error>} 错误对象
   */
  async handleError(response) {
    let errorMessage = `API 请求失败: ${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // 如果无法解析 JSON，使用默认错误消息
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.statusText = response.statusText;
    return error;
  }

  /**
   * 获取支持的分析类型
   * @returns {Promise<Object>} 分析类型数据
   */
  async getAnalysisTypes() {
    try {
      const response = await this.request("/analysis-types");
      return await response.json();
    } catch (error) {
      console.error("获取分析类型失败:", error);
      throw error;
    }
  }

  /**
   * 健康检查
   * @returns {Promise<Object>} 健康状态数据
   */
  async healthCheck() {
    try {
      const response = await this.request("/health");
      return await response.json();
    } catch (error) {
      console.error("健康检查失败:", error);
      throw error;
    }
  }


  /**
   * 通用分析 API（流式）
   * @param {Object} data - 分析数据
   * @param {Function} onData - 数据回调函数
   * @param {AbortSignal} signal - 取消信号（可选）
   * @returns {Promise<Object>} 流式响应处理结果
   */
  async analyzeStream(data, onData, signal = null) {
    try {
      const { analysis_type, question, file } = data;

      if (file) {
        // 文件上传模式
        const formData = new FormData();
        formData.append("file", file);
        formData.append("analysis_type", analysis_type);
        if (question) {
          formData.append("question", question);
        }

        const response = await fetch(`${this.baseURL}/analyze-stream`, {
          method: "POST",
          body: formData,
          signal, // 添加 AbortSignal
        });

        if (!response.ok) {
          throw await this.handleError(response);
        }

        return await this.handleStreamResponse(response, onData, signal);
      } else {
        // 纯文本模式
        const response = await this.request("/analyze-stream", {
          method: "POST",
          body: JSON.stringify({
            analysis_type,
            question,
          }),
          signal, // 添加 AbortSignal
        });

        return await this.handleStreamResponse(response, onData, signal);
      }
    } catch (error) {
      console.error("流式分析失败:", error);
      throw error;
    }
  }

  /**
   * 处理流式响应
   * @param {Response} response - 响应对象
   * @param {Function} onData - 数据回调函数
   * @param {AbortSignal} signal - 取消信号（可选）
   * @returns {Promise<Object>} 处理结果
   */
  async handleStreamResponse(response, onData, signal = null) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        // 检查是否被取消
        if (signal && signal.aborted) {
          throw new Error("请求已取消");
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              if (onData) {
                onData({ type: "end" });
              }
              return { done: true };
            }

            try {
              const parsedData = JSON.parse(data);
              if (onData) {
                onData(parsedData);
              }
            } catch (e) {
              // 忽略 JSON 解析错误，继续处理
              console.warn("JSON 解析错误:", e);
            }
          }
        }
      }
    } catch (error) {
      if (signal && signal.aborted) {
        throw new Error("请求已取消");
      }
      throw error;
    } finally {
      reader.releaseLock();
    }
  }
}

// 创建默认客户端实例
const apiClient = new ApiClient();

/**
 * 分析服务类
 * 提供特定分析类型的便捷方法
 */
class AnalysisService {
  constructor(client = apiClient) {
    this.client = client;
  }

  /**
   * 简历评估
   * @param {File} file - 文件对象（可选）
   * @param {string} question - 问题内容（可选）
   * @returns {Promise<Object>} 分析结果
   */
  async evaluateResume(file = null, question = null) {
    return this.client.analyze({
      analysis_type: ANALYSIS_TYPES.EVALUATE,
      file,
      question,
    });
  }

  /**
   * 简历评估（流式）
   * @param {File} file - 文件对象（可选）
   * @param {string} question - 问题内容（可选）
   * @param {Function} onData - 数据回调函数
   * @param {AbortSignal} signal - 取消信号（可选）
   * @returns {Promise<Object>} 流式响应处理结果
   */
  async evaluateResumeStream(
    file = null,
    question = null,
    onData,
    signal = null
  ) {
    return this.client.analyzeStream(
      {
        analysis_type: ANALYSIS_TYPES.EVALUATE,
        file,
        question,
      },
      onData,
      signal
    );
  }

  /**
   * 简历生成
   * @param {File} file - 文件对象（可选）
   * @param {string} question - 问题内容（可选）
   * @returns {Promise<Object>} 分析结果
   */
  async generateResume(file = null, question = null) {
    return this.client.analyze({
      analysis_type: ANALYSIS_TYPES.GENERATE,
      file,
      question,
    });
  }

  /**
   * 简历生成（流式）
   * @param {File} file - 文件对象（可选）
   * @param {string} question - 问题内容（可选）
   * @param {Function} onData - 数据回调函数
   * @param {AbortSignal} signal - 取消信号（可选）
   * @returns {Promise<Object>} 流式响应处理结果
   */
  async generateResumeStream(
    file = null,
    question = null,
    onData,
    signal = null
  ) {
    return this.client.analyzeStream(
      {
        analysis_type: ANALYSIS_TYPES.GENERATE,
        file,
        question,
      },
      onData,
      signal
    );
  }

  /**
   * 模拟面试
   * @param {File} file - 文件对象（可选）
   * @param {string} question - 问题内容（可选）
   * @returns {Promise<Object>} 分析结果
   */
  async mockInterview(file = null, question = null) {
    return this.client.analyze({
      analysis_type: ANALYSIS_TYPES.MOCK,
      file,
      question,
    });
  }

  /**
   * 模拟面试（流式）
   * @param {File} file - 文件对象（可选）
   * @param {string} question - 问题内容（可选）
   * @param {Function} onData - 数据回调函数
   * @param {AbortSignal} signal - 取消信号（可选）
   * @returns {Promise<Object>} 流式响应处理结果
   */
  async mockInterviewStream(
    file = null,
    question = null,
    onData,
    signal = null
  ) {
    return this.client.analyzeStream(
      {
        analysis_type: ANALYSIS_TYPES.MOCK,
        file,
        question,
      },
      onData,
      signal
    );
  }
}

// 创建分析服务实例
const analysisService = new AnalysisService();

// 导出兼容性对象（保持向后兼容）
export const apiService = {
  getAnalysisTypes: () => apiClient.getAnalysisTypes(),
  analyze: (data) => apiClient.analyze(data),
  analyzeStream: (data, onData) => apiClient.analyzeStream(data, onData),
  healthCheck: () => apiClient.healthCheck(),
};

// 导出新的服务实例
export { ApiClient, AnalysisService, apiClient, analysisService };

// 默认导出
export default apiService;
