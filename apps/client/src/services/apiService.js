// API配置
const API_BASE_URL = "http://localhost:3000/api";

// 分析类型常量
export const ANALYSIS_TYPES = {
  EVALUATE: "evaluate",
  GENERATE: "generate",
  MOCK: "mock",
};

// 通用API调用函数
export const apiService = {
  // 获取支持的分析类型
  async getAnalysisTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis-types`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("获取分析类型失败:", error);
      throw error;
    }
  },

  // 通用分析API（非流式）
  async analyze(data) {
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

        const response = await fetch(`${API_BASE_URL}/analyze`, {
          method: "POST",
          body: formData,
        });

        return await response.json();
      } else {
        // 纯文本模式
        const response = await fetch(`${API_BASE_URL}/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            analysis_type,
            question,
          }),
        });

        return await response.json();
      }
    } catch (error) {
      console.error("分析失败:", error);
      throw error;
    }
  },

  // 通用分析API（流式）
  async analyzeStream(data, onData) {
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

        const response = await fetch(`${API_BASE_URL}/analyze-stream`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return this.handleStreamResponse(response, onData);
      } else {
        // 纯文本模式
        const response = await fetch(`${API_BASE_URL}/analyze-stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            analysis_type,
            question,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return this.handleStreamResponse(response, onData);
      }
    } catch (error) {
      console.error("流式分析失败:", error);
      throw error;
    }
  },

  // 处理流式响应
  async handleStreamResponse(response, onData) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return { done: true };
          }

          try {
            const parsedData = JSON.parse(data);
            if (onData) {
              onData(parsedData);
            }
          } catch (e) {
            // 忽略JSON解析错误，继续处理
          }
        }
      }
    }
  },

  // 健康检查
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error("健康检查失败:", error);
      throw error;
    }
  },
};

// 特定分析类型的API调用
export const analysisService = {
  // 简历评估
  async evaluateResume(file, question) {
    return apiService.analyze({
      analysis_type: ANALYSIS_TYPES.EVALUATE,
      file,
      question,
    });
  },

  async evaluateResumeStream(file, question, onData) {
    return apiService.analyzeStream(
      {
        analysis_type: ANALYSIS_TYPES.EVALUATE,
        file,
        question,
      },
      onData
    );
  },

  // 简历生成
  async generateResume(file, question) {
    return apiService.analyze({
      analysis_type: ANALYSIS_TYPES.GENERATE,
      file,
      question,
    });
  },

  async generateResumeStream(file, question, onData) {
    return apiService.analyzeStream(
      {
        analysis_type: ANALYSIS_TYPES.GENERATE,
        file,
        question,
      },
      onData
    );
  },

  // 模拟面试
  async mockInterview(file, question) {
    return apiService.analyze({
      analysis_type: ANALYSIS_TYPES.MOCK,
      file,
      question,
    });
  },

  async mockInterviewStream(file, question, onData) {
    return apiService.analyzeStream(
      {
        analysis_type: ANALYSIS_TYPES.MOCK,
        file,
        question,
      },
      onData
    );
  },
};

export default apiService;
