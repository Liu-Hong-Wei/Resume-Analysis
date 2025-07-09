import { COZE_CONFIG } from "../config/index.js";

/**
 * Coze API 客户端类
 */
class CozeClient {
  constructor(config = COZE_CONFIG) {
    this.config = config;
    this.baseURL = config.BASE_URL;
    this.apiKey = config.API_KEY;
    this.botId = config.BOT_ID;
  }

  /**
   * 创建 HTTP 请求头
   * @param {Object} additionalHeaders - 额外的请求头
   * @returns {Object} 请求头对象
   */
  createHeaders(additionalHeaders = {}) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": "Resume-Analysis-API/1.0",
      ...additionalHeaders,
    };
  }

  /**
   * 发送 HTTP 请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise<Response>} 响应对象
   */
  async request(url, options = {}) {
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
   * 处理 API 错误响应
   * @param {Response} response - fetch响应对象
   * @returns {Promise<Error>} 错误对象
   */
  async handleError(response) {
    const errorText = await response.text();
    let errorMessage = `Coze API 请求失败: ${response.status} ${response.statusText}`;

    // 记录错误详情
    console.error(`Coze API 错误响应:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: errorText.substring(0, 500),
    });

    // 检查是否是HTML响应（通常表示URL错误或服务器错误）
    if (
      errorText.trim().toLowerCase().startsWith("<!doctype") ||
      errorText.trim().toLowerCase().startsWith("<html")
    ) {
      errorMessage += " (服务器返回HTML页面，可能是API URL错误或服务器问题)";
      return new Error(errorMessage);
    }

    // 尝试解析JSON错误响应
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error) {
        errorMessage += ` - ${errorData.error.message || errorData.error}`;
      } else if (errorData.message) {
        errorMessage += ` - ${errorData.message}`;
      }
    } catch (e) {
      errorMessage += ` - 响应内容: ${errorText.substring(0, 200)}`;
    }

    // 根据HTTP状态码添加更详细的错误信息
    const statusMessages = {
      400: "请求参数错误",
      401: "认证失败，请检查API密钥",
      403: "权限不足",
      404: "资源不存在，请检查API URL",
      429: "请求频率超限",
      500: "服务器内部错误",
      502: "服务器暂时不可用",
      503: "服务器暂时不可用",
      504: "服务器暂时不可用",
    };

    if (statusMessages[response.status]) {
      errorMessage += ` (${statusMessages[response.status]})`;
    }

    return new Error(errorMessage);
  }

  /**
   * 创建对话
   * @returns {Promise<string>} 对话ID
   */
  async createConversation() {
    try {
      console.log("创建 Coze 对话...");

      const response = await this.request(this.config.API_URL, {
        method: "POST",
        body: JSON.stringify({
          bot_id: this.botId,
        }),
      });

      const data = await response.json();
      console.log("对话创建成功:", data);

      if (!data.data?.id) {
        throw new Error("创建对话失败：未返回对话ID");
      }

      return data.data.id;
    } catch (error) {
      console.error("创建对话失败:", error);
      throw error;
    }
  }

  /**
   * 上传文件
   * @param {Buffer} fileBuffer - 文件Buffer内容
   * @param {string} fileName - 文件名
   * @param {string} mimeType - 文件MIME类型
   * @returns {Promise<string>} 文件ID
   */
  async uploadFile(fileBuffer, fileName, mimeType = "application/pdf") {
    try {
      const uploadUrl = `${this.baseURL}/v1/files/upload`;

      console.log("开始上传文件到 Coze:", {
        fileName,
        mimeType,
        fileSize: fileBuffer.length,
      });

      const formData = new FormData();
      formData.append("file", fileBuffer, {
        filename: fileName,
        contentType: mimeType,
      });

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "User-Agent": "Resume-Analysis-API/1.0",
          ...formData.getHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      const data = await response.json();
      console.log("文件上传成功:", {
        file_id: data.data?.id,
        filename: fileName,
        bytes: data.data?.bytes,
      });

      if (!data.data?.id) {
        throw new Error("文件上传失败：未返回文件ID");
      }

      return data.data.id;
    } catch (error) {
      console.error("文件上传失败:", error);
      throw error;
    }
  }

  /**
   * 构建消息对象
   * @param {string|Array} content - 消息内容
   * @param {string} contentType - 内容类型 (text|object_string)
   * @returns {Object} 消息对象
   */
  buildMessage(content, contentType = "text") {
    return {
      role: "user",
      content_type: contentType,
      type: "question",
      content: typeof content === "string" ? content : JSON.stringify(content),
    };
  }

  /**
   * 构建文本消息
   * @param {string} text - 文本内容
   * @returns {Object} 消息对象
   */
  buildTextMessage(text) {
    // 限制文本长度
    const truncatedText =
      text.length > this.config.MAX_TEXT_LENGTH
        ? text.substring(0, this.config.MAX_TEXT_LENGTH) + "..."
        : text;

    return this.buildMessage(truncatedText, "text");
  }

  /**
   * 构建文件消息
   * @param {string} fileId - 文件ID
   * @param {string} text - 文本内容（可选）
   * @returns {Object} 消息对象
   */
  buildFileMessage(fileId, text = null) {
    const textContent = text || "请按照预设的分析模板分析以下简历PDF文件";

    const objectContent = [
      { type: "text", text: textContent },
      { type: "file", file_id: fileId },
    ];

    return this.buildMessage(objectContent, "object_string");
  }

  /**
   * 发送聊天请求
   * @param {string} conversationId - 对话ID
   * @param {Object} message - 消息对象
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  async sendChatRequest(conversationId, message, options = {}) {
    const {
      stream = false,
      customVariables = {},
      autoSaveHistory = true,
    } = options;

    const requestBody = {
      bot_id: this.botId,
      user_id: "resume_analysis_user",
      stream,
      auto_save_history: autoSaveHistory,
      additional_messages: [message],
      custom_variables: customVariables,
    };

    console.log("发送 Coze API 请求:", {
      conversation_id: conversationId,
      stream,
      message_type: message.content_type,
      custom_variables: customVariables,
    });

    const response = await this.request(
      `${this.baseURL}/v3/chat?conversation_id=${conversationId}`,
      {
        method: "POST",
        headers: {
          Accept: stream ? "text/event-stream" : "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );
    console.log("response: ", response);

    return response;
  }

  /**
   * 获取聊天消息
   * @param {string} chatId - 聊天ID
   * @param {string} conversationId - 对话ID
   * @returns {Promise<string>} 消息内容
   */
  async getChatMessages(chatId, conversationId) {
    const maxRetries = 5;
    const retryDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`获取聊天消息 (尝试 ${attempt}/${maxRetries})`);

        const response = await this.request(
          `${this.baseURL}/v3/chat/message/list?chat_id=${chatId}&conversation_id=${conversationId}`,
          { method: "GET" }
        );

        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          // 查找 assistant 消息
          const assistantMessage = data.data.find(
            (msg) => msg.role === "assistant" && msg.content
          );

          if (assistantMessage) {
            console.log("找到 assistant 消息:", {
              id: assistantMessage.id,
              type: assistantMessage.type,
              content_length: assistantMessage.content.length,
            });
            return assistantMessage.content;
          }
        }

        if (attempt === maxRetries) {
          throw new Error("未找到 assistant 消息内容");
        }

        console.log(`等待 ${retryDelay}ms 后重试...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } catch (error) {
        console.error(`获取聊天消息失败 (尝试 ${attempt}):`, error);

        if (attempt === maxRetries) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  /**
   * 处理流式响应
   * @param {Response} response - 响应对象
   * @param {Function} onData - 数据回调函数
   * @returns {Promise<void>}
   */
  async handleStreamResponse(response, onData) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("event:conversation.message.delta")) {
            continue;
          } else if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              onData({ type: "end", success: true });
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.role === "assistant" && parsed.content) {
                onData({
                  type: "content",
                  content: parsed.content,
                });
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 分析简历（非流式）- 文本模式
   * @param {string} text - 文本内容
   * @param {Object} customVariables - 自定义变量
   * @returns {Promise<string>} 分析结果
   */
  async analyzeText(text, customVariables = {}) {
    try {
      const conversationId = await this.createConversation();
      const message = this.buildTextMessage(text);

      const response = await this.sendChatRequest(conversationId, message, {
        stream: false,
        customVariables,
      });

      const data = await response.json();
      const chatId = data.data?.id || data.id;

      if (!chatId) {
        throw new Error("Coze API 响应格式错误：无法找到 Chat ID");
      }

      console.log("Coze API 响应成功:", {
        conversation_id: conversationId,
        chat_id: chatId,
      });

      return await this.getChatMessages(chatId, conversationId);
    } catch (error) {
      console.error("文本分析失败:", error);
      throw error;
    }
  }

  /**
   * 分析简历（非流式）- 文件模式
   * @param {Buffer} fileBuffer - 文件Buffer
   * @param {string} fileName - 文件名
   * @param {string} text - 文本内容（可选）
   * @param {Object} customVariables - 自定义变量
   * @returns {Promise<string>} 分析结果
   */
  async analyzeFile(fileBuffer, fileName, text = null, customVariables = {}) {
    try {
      const fileId = await this.uploadFile(fileBuffer, fileName);
      const conversationId = await this.createConversation();
      const message = this.buildFileMessage(fileId, text);

      const response = await this.sendChatRequest(conversationId, message, {
        stream: false,
        customVariables,
      });

      const data = await response.json();
      const chatId = data.data?.id || data.id;

      if (!chatId) {
        throw new Error("Coze API 响应格式错误：无法找到 Chat ID");
      }

      console.log("Coze API 文件分析响应成功:", {
        conversation_id: conversationId,
        chat_id: chatId,
        file_id: fileId,
      });

      return await this.getChatMessages(chatId, conversationId);
    } catch (error) {
      console.error("文件分析失败:", error);
      throw error;
    }
  }

  /**
   * 分析简历（流式）- 文本模式
   * @param {string} text - 文本内容
   * @param {Response} res - Express响应对象
   * @param {Object} customVariables - 自定义变量
   * @returns {Promise<void>}
   */
  async analyzeTextStream(text, res, customVariables = {}) {
    try {
      const conversationId = await this.createConversation();
      const message = this.buildTextMessage(text);

      const response = await this.sendChatRequest(conversationId, message, {
        stream: true,
        customVariables,
      });

      // 设置流式响应头
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      });

      await this.handleStreamResponse(response, (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      });
    } catch (error) {
      console.error("文本流式分析失败:", error);
      res.write(
        `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
      );
      res.write("data: [DONE]\n\n");
    }
  }

  /**
   * 分析简历（流式）- 文件模式
   * @param {Buffer} fileBuffer - 文件Buffer
   * @param {Response} res - Express响应对象
   * @param {string} fileName - 文件名
   * @param {string} text - 文本内容（可选）
   * @param {Object} customVariables - 自定义变量
   * @returns {Promise<void>}
   */
  async analyzeFileStream(
    fileBuffer,
    res,
    fileName,
    text = null,
    customVariables = {}
  ) {
    try {
      const fileId = await this.uploadFile(fileBuffer, fileName);
      const conversationId = await this.createConversation();
      const message = this.buildFileMessage(fileId, text);

      const response = await this.sendChatRequest(conversationId, message, {
        stream: true,
        customVariables,
      });

      // 设置流式响应头
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      });

      await this.handleStreamResponse(response, (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      });
    } catch (error) {
      console.error("文件流式分析失败:", error);
      res.write(
        `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
      );
      res.write("data: [DONE]\n\n");
    }
  }
}

// 创建默认客户端实例
const cozeClient = new CozeClient();

// 导出兼容性函数（保持向后兼容）
export async function analyzeResumeWithCoze(
  userQuestion,
  customVariables = {}
) {
  return cozeClient.analyzeText(userQuestion, customVariables);
}

export async function analyzeResumeWithCozeFile(
  pdfBuffer,
  fileName = "resume.pdf",
  userQuestion = null,
  customVariables = {}
) {
  return cozeClient.analyzeFile(
    pdfBuffer,
    fileName,
    userQuestion,
    customVariables
  );
}

export async function analyzeResumeWithCozeStream(
  userQuestion,
  res,
  customVariables = {}
) {
  return cozeClient.analyzeTextStream(userQuestion, res, customVariables);
}

export async function analyzeResumeWithCozeFileStream(
  pdfBuffer,
  res,
  fileName = "resume.pdf",
  userQuestion = null,
  customVariables = {}
) {
  return cozeClient.analyzeFileStream(
    pdfBuffer,
    res,
    fileName,
    userQuestion,
    customVariables
  );
}

// 导出客户端类
export { CozeClient, cozeClient };
