// API 配置
import { configManager } from "../../../server/config/index";

/**
 * API 客户端类
 */
class ApiClient {
  constructor() {
    this.baseURL = configManager.server.API_BASE_URL;
    this.apiKey = configManager.coze.API_KEY;
  }

  /**
   * 创建请求头
   * @param {Object} additionalHeaders - 额外的请求头
   * @param {boolean} isFormData - 是否为FormData请求
   * @returns {Object} 请求头对象
   */
  createHeaders(additionalHeaders = {}, isFormData = false) {
    const headers = { ...additionalHeaders };

    // 只有在非FormData请求时才设置Content-Type
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  /**
   * 发送 HTTP 请求
   * @param {string} endpoint - API 端点
   * @param {Object} options - 请求选项
   * @returns {Promise<Response>} 响应对象
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // 检查是否为FormData请求
    const isFormData = options.body instanceof FormData;

    const response = await fetch(url, {
      ...options,
      headers: this.createHeaders(options.headers, isFormData),
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
      const response = await this.request("/api/analysis-types");
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
      const response = await this.request("/api/health");
      return await response.json();
    } catch (error) {
      console.error("健康检查失败:", error);
      throw error;
    }
  }

  /**
   * 聊天对话 API（流式）
   * @param {string} question - 用户问题
   * @param {string} analysisType - 分析类型（可选，默认为evaluate）
   * @param {Function} onData - 数据回调函数
   * @param {AbortSignal} signal - 取消信号（可选）
   * @param {string} conversationId - 对话ID（可选）
   * @returns {Promise<Object>} 流式响应处理结果
   */
  async chat(
    question,
    analysisType = "evaluate",
    onData,
    signal = null,
    conversationId = null
  ) {
    try {
      const requestBody = {
        analysis_type: analysisType,
        question,
      };

      if (conversationId) {
        requestBody.conversation_id = conversationId;
      }

      const response = await this.request("/api/analyze", {
        method: "POST",
        body: JSON.stringify(requestBody),
        signal,
      });

      return await this.handleStreamResponse(response, onData, signal);
    } catch (error) {
      console.error("聊天对话失败:", error);
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
      const { analysis_type, question, file, conversation_id } = data;

      if (file) {
        // 文件上传模式
        const formData = new FormData();
        formData.append("file", file);
        formData.append("analysis_type", analysis_type);
        if (question) {
          formData.append("question", question);
        }
        if (conversation_id) {
          formData.append("conversation_id", conversation_id);
        }

        const response = await this.request(`/api/analyze`, {
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
        const requestBody = {
          analysis_type,
          question,
        };

        if (conversation_id) {
          requestBody.conversation_id = conversation_id;
        }

        const response = await this.request(`/api/analyze`, {
          method: "POST",
          body: JSON.stringify(requestBody),
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
    console.log("前端开始处理流式响应");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let currentEvent = null;

    try {
      while (true) {
        // 检查是否被取消
        if (signal && signal.aborted) {
          console.log("流式请求被取消");
          throw new Error("请求已取消");
        }

        const { done, value } = await reader.read();
        console.log("读取流式数据:", {
          done,
          valueLength: value ? value.length : 0,
        });

        if (done) {
          console.log("流式数据读取完成，发送结束信号");
          if (onData) {
            onData({ type: "end", success: true });
          }
          break;
        }

        // 解码当前块并添加到缓冲区
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // 按行分割并处理
        const lines = buffer.split("\n");
        // 保留最后一行（可能不完整）
        buffer = lines.pop() || "";

        console.log("处理行数:", lines.length);

        for (const line of lines) {
          if (!line.trim()) continue;

          console.log("--------------------------------");
          console.log("处理Coze API行:", line);
          console.log("当前事件类型:", currentEvent);
          console.log("--------------------------------");

          // 处理事件类型行
          if (line.startsWith("event:")) {
            currentEvent = line.slice(6).trim();
            console.log("当前事件类型:", currentEvent);
            continue;
          }

          // 处理数据行
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            console.log("提取的数据:", data);

            if (data === "[DONE]") {
              console.log("收到结束信号");
              if (onData) {
                onData({ type: "end", success: true });
              }
              return { done: true, success: true };
            }

            try {
              const parsedData = JSON.parse(data);
              console.log("解析的JSON数据:", parsedData);

              if (onData) {
                // 根据SSE事件类型和数据内容进行处理
                this.processSSEEvent(currentEvent, parsedData, onData);
              }
            } catch (e) {
              console.warn("JSON 解析错误:", e, "原始数据:", data);
              // 忽略 JSON 解析错误，继续处理
            }
          }
        }
      }
    } catch (error) {
      console.error("流式响应处理错误:", error);
      if (signal && signal.aborted) {
        throw new Error("请求已取消");
      }
      throw error;
    } finally {
      console.log("释放流式读取器");
      reader.releaseLock();
    }
  }

  /**
   * 处理SSE事件
   * @param {string} eventType - 事件类型
   * @param {Object} data - 数据
   * @param {Function} onData - 数据回调函数
   */
  processSSEEvent(eventType, data, onData) {
    console.log("处理SSE事件:", { eventType, data });

    // 根据事件类型处理
    switch (eventType) {
      case "conversation.chat.created":
        onData({
          type: "conversation_created",
          conversation_id: data.conversation_id,
          chat_id: data.id,
          status: data.status,
        });
        break;

      case "conversation.chat.in_progress":
        onData({
          type: "status",
          status: "in_progress",
          chat_id: data.id,
        });
        break;

      case "conversation.message.delta":
        if (data.role === "assistant" && data.content) {
          onData({
            type: "content",
            content: data.content,
            message_id: data.id,
            is_delta: true,
          });
        }
        break;

      case "conversation.message.completed":
        if (data.role === "assistant") {
          if (data.type === "answer" && data.content) {
            onData({
              type: "content_complete",
              content: data.content,
              message_id: data.id,
              content_type: data.content_type,
            });
          } else if (data.type === "verbose") {
            onData({
              type: "verbose",
              content: data.content,
              message_id: data.id,
            });
          } else if (data.type === "follow_up") {
            onData({
              type: "suggestion",
              content: data.content,
              message_id: data.id,
            });
          }
        }
        break;

      case "conversation.chat.completed":
        onData({
          type: "chat_completed",
          chat_id: data.id,
          usage: data.usage,
          status: data.status,
          completed_at: data.completed_at,
        });
        break;

      case "conversation.chat.failed":
        onData({
          type: "error",
          error: data.last_error?.msg || "对话处理失败",
          code: data.last_error?.code,
          chat_id: data.id,
        });
        break;

      case "done":
        onData({ type: "end", success: true });
        break;

      default:
        // 处理后端自定义的事件类型或未知事件
        if (data.type) {
          // 如果数据包含type字段，使用它
          onData(data);
        } else {
          // 否则包装为unknown_event
          onData({
            type: "unknown_event",
            event: eventType,
            data: data,
          });
        }
        break;
    }
  }

  /**
   * 获取用户的对话列表
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @param {number} options.limit - 限制返回的对话数量
   * @param {string} options.order - 排序方式 (asc/desc)
   * @returns {Promise<Array>} 对话列表
   */
  async getUserConversations(userId, options = {}) {
    try {
      console.log("获取用户对话列表:", { userId, options });

      const requestBody = {
        limit: options.limit || 20,
        order: options.order || "desc",
        user_id: userId,
      };

      const response = await this.request("/api/conversations", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("用户对话列表获取成功:", data);

      // 转换对话格式以适配前端
      const conversations =
        data.data?.map((conv) => ({
          id: conv.conversation_id,
          title: conv.title || `对话 ${conv.conversation_id.slice(-6)}`,
          createdAt: new Date(conv.created_at * 1000).toISOString(),
          updatedAt: new Date(conv.updated_at * 1000).toISOString(),
          messageCount: conv.message_count || 0,
          status: conv.status || "active",
        })) || [];

      return conversations;
    } catch (error) {
      console.error("获取用户对话列表失败:", error);
      throw error;
    }
  }

  /**
   * 获取对话消息
   * @param {string} conversationId - 对话ID
   * @param {Object} options - 查询选项
   * @param {number} options.limit - 限制返回的消息数量
   * @param {string} options.order - 排序方式 (asc/desc)
   * @param {string} options.chatId - 聊天ID
   * @param {string} options.beforeId - 在指定ID之前的消息
   * @returns {Promise<Object>} 消息列表和分页信息
   */
  async getConversationMessages(conversationId, options = {}) {
    try {
      console.log("获取对话消息:", { conversationId, options });

      const requestBody = {
        limit: options.limit || null,
        order: options.order || "asc",
        ...(options.chatId && { chat_id: options.chatId }),
        ...(options.beforeId && { before_id: options.beforeId }),
      };

      const response = await this.request(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      console.log("对话消息获取成功:", data);

      // 转换消息格式以适配前端
      const messages =
        data.data?.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          contentType: msg.content_type,
          timestamp: new Date(msg.created_at * 1000).toISOString(),
          conversationId: msg.conversation_id,
          chatId: msg.chat_id,
          type: msg.type,
          metaData: msg.meta_data,
        })) || [];

      return {
        messages,
        pagination: {
          firstId: data.first_id,
          lastId: data.last_id,
          hasMore: data.has_more,
        },
        detail: data.detail,
      };
    } catch (error) {
      console.error("获取对话消息失败:", error);
      throw error;
    }
  }

  /**
   * 上传文件
   * @param {File} file - 文件内容
   * @param {string} fileName - 文件名
   * @param {string} mimeType - 文件MIME类型（可选，会自动推断）
   * @returns {Promise<string>} 文件ID
   */
  async uploadFile(file, fileName, mimeType = null) {
    try {
      const uploadUrl = `https://api.coze.cn/v1/files/upload`;

      // 如果没有提供MIME类型，尝试从文件名推断
      const finalMimeType = mimeType || this.inferMimeType(fileName);

      // 验证 MIME 类型是否支持
      const supportedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "text/plain",
      ];

      if (!supportedTypes.includes(finalMimeType)) {
        throw new Error(
          `不支持的文件类型：${finalMimeType}。支持的格式：${supportedTypes.join(", ")}`
        );
      }

      console.log("开始上传文件到 Coze:", {
        fileName,
        mimeType: finalMimeType,
        fileSize: file.size,
      });

      // 发送请求 - 使用指定的请求头格式
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": `multipart/form-data`,
        },
        body: file,
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      const data = await response.json();

      // 根据官方文档，检查响应的code字段
      if (data.code !== 0) {
        const errorMsg = data.msg || data.message || "文件上传失败";
        throw new Error(`Coze API 错误 (code: ${data.code}): ${errorMsg}`);
      }

      console.log("文件上传成功:", {
        file_id: data.data?.id,
        filename: data.data?.file_name || fileName,
        bytes: data.data?.bytes,
        created_at: data.data?.created_at,
      });

      if (!data.data?.id) {
        throw new Error("文件上传失败：响应中未返回文件ID");
      }

      return data.data.id;
    } catch (error) {
      console.error("文件上传失败:", {
        fileName,
        fileSize: fileBuffer.length,
        error: error.message,
        stack: error.stack,
      });

      // 提供更友好的错误信息
      if (
        error.message.includes("413") ||
        error.message.includes("Payload Too Large")
      ) {
        throw new Error(
          `文件太大，无法上传。最大支持 20MB，当前文件: ${Math.round((fileBuffer.length / 1024 / 1024) * 100) / 100}MB`
        );
      } else if (
        error.message.includes("401") ||
        error.message.includes("认证失败")
      ) {
        throw new Error("API 密钥无效，请检查 Coze API 配置");
      } else if (
        error.message.includes("415") ||
        error.message.includes("Unsupported Media Type")
      ) {
        throw new Error(
          `不支持的文件类型。支持的格式: PDF、图片（JPG、PNG、GIF、BMP、WEBP）、TXT`
        );
      }

      throw error;
    }
  }

  /**
   * 发送消息到对话（流式）
   * @param {string} conversationId - 对话ID
   * @param {string} message - 消息内容
   * @param {string} analysisType - 分析类型
   * @param {Function} onData - 数据回调函数
   * @param {AbortSignal} signal - 取消信号
   * @param {File} file - 可选的文件对象
   * @returns {Promise<Object>} 流式响应处理结果
   */
  async sendMessageToConversation(
    conversationId,
    message,
    analysisType = "evaluate",
    onData,
    signal = null,
    file = null
  ) {
    try {
      if (file) {
        // 文件上传模式
        const formData = new FormData();
        const fileId = await this.uploadFile(file, file.name, file.type);
        formData.append("file_id", fileId);
        formData.append("analysis_type", analysisType);
        if (message) {
          formData.append("question", message);
        }
        if (conversationId) {
          formData.append("conversation_id", conversationId);
        }

        const response = await this.request(`/api/analyze`, {
          method: "POST",
          body: formData,
          signal,
        });

        if (!response.ok) {
          throw await this.handleError(response);
        }

        return await this.handleStreamResponse(response, onData, signal);
      } else {
        // 纯文本模式
        const requestBody = {
          analysis_type: analysisType,
          question: message,
        };

        // 只有在 conversationId 存在时才加到请求体
        if (conversationId) {
          requestBody.conversation_id = conversationId;
        }

        const response = await this.request("/api/analyze", {
          method: "POST",
          body: JSON.stringify(requestBody),
          signal,
        });

        return await this.handleStreamResponse(response, onData, signal);
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      throw error;
    }
  }
}

// 创建默认客户端实例
const apiClient = new ApiClient();

// 导出兼容性对象（保持向后兼容）
export const apiService = {
  getAnalysisTypes: () => apiClient.getAnalysisTypes(),
  analyze: (data) => apiClient.analyze(data),
  analyzeStream: (data, onData, signal) =>
    apiClient.analyzeStream(data, onData, signal),
  chat: (question, analysisType, onData, signal, conversationId) =>
    apiClient.chat(question, analysisType, onData, signal, conversationId),
  healthCheck: () => apiClient.healthCheck(),
};

// 导出新的服务实例
export { ApiClient, apiClient };

// 默认导出
export default apiService;
