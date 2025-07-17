import { COZE_CONFIG } from "../config/index.js";
import FormData from "form-data";
// import { jwtAuthService } from "./jwtAuthService.js";

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
   * @param {string} userId - 用户ID（用于OAuth JWT认证）
   * @param {string} sessionName - 会话名称（用于会话隔离）
   * @returns {Object} 请求头对象
   */
  createHeaders(additionalHeaders = {}, userId = null, sessionName = null) {
    const baseHeaders = {
      "Content-Type": "application/json",
      "User-Agent": "Resume-Analysis-API/1.0",
    };

    // 如果提供了userId，使用OAuth JWT认证
    if (userId) {
      try {
        const jwtHeaders = jwtAuthService.generateCozeAuthHeaders(
          userId,
          sessionName
        );
        return {
          ...baseHeaders,
          ...jwtHeaders,
          ...additionalHeaders,
        };
      } catch (error) {
        console.error("OAuth JWT认证失败，回退到API Key认证:", error);
        // 回退到原有的API Key认证方式
        return {
          ...baseHeaders,
          Authorization: `Bearer ${this.apiKey}`,
          ...additionalHeaders,
        };
      }
    } else {
      // 使用原有的API Key认证方式
      return {
        ...baseHeaders,
        Authorization: `Bearer ${this.apiKey}`,
        ...additionalHeaders,
      };
    }
  }

  /**
   * 发送 HTTP 请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @param {string} userId - 用户ID（用于OAuth JWT认证）
   * @param {string} sessionName - 会话名称（用于会话隔离）
   * @returns {Promise<Response>} 响应对象
   */
  async request(url, options = {}, userId = null, sessionName = null) {
    const response = await fetch(url, {
      ...options,
      headers: this.createHeaders(options.headers, userId, sessionName),
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
   * @param {string} userId - 用户ID（用于OAuth JWT认证）
   * @param {string} sessionName - 会话名称（用于会话隔离）
   * @returns {Promise<string>} 对话ID
   */
  async createConversation(userId = null, sessionName = null) {
    try {
      console.log("创建 Coze 对话...", { userId, sessionName });

      const response = await this.request(
        this.config.API_URL,
        {
          method: "POST",
          body: JSON.stringify({
            bot_id: this.botId,
          }),
        },
        userId,
        sessionName
      );

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
   * 根据文件名推断MIME类型
   * @param {string} fileName - 文件名
   * @returns {string} MIME类型
   */
  inferMimeType(fileName) {
    const extension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf("."));
    const mimeTypeMap = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".txt": "text/plain",
    };

    return mimeTypeMap[extension] || "application/octet-stream";
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
    return {
      role: "user",
      content: text,
      content_type: "text",
    };
  }

  /**
   * 构建文件消息
   * @param {string} fileId - 文件ID
   * @param {string} text - 文本内容（可选）
   * @param {string} fileType - 文件类型（image/document）
   * @returns {Object} 消息对象
   */
  buildFileMessage(fileId, text = null, fileType = "document") {
    const message = {
      role: "user",
      content_type: "object_string",
    };

    // 按照用户提供的格式构建多模态消息
    const content = [];

    if (text) {
      content.push({
        type: "text",
        text: text,
      });
    }

    if (fileType === "image") {
      // 图片类型
      content.push({
        type: "image",
        file_id: fileId,
      });
    } else {
      // 文档类型
      content.push({
        type: "file",
        file_id: fileId,
      });
    }

    message.content = JSON.stringify(content);
    return message;
  }

  /**
   * 发送聊天请求
   * @param {string} conversationId - 对话ID
   * @param {Object} message - 消息对象
   * @param {Object} options - 请求选项
   * @param {string} userId - 用户ID（用于OAuth JWT认证）
   * @param {string} sessionName - 会话名称（用于会话隔离）
   * @returns {Promise<Object>} 响应数据
   */
  async sendChatRequest(
    conversationId,
    message,
    options = {},
    userId = null,
    sessionName = null
  ) {
    const {
      stream = true,
      customVariables = {},
      autoSaveHistory = true,
    } = options;

    // 使用userId作为user_id，实现用户隔离
    const finalUserId = userId || "resume_analysis_user";

    const requestBody = {
      bot_id: this.botId,
      user_id: finalUserId,
      stream,
      auto_save_history: autoSaveHistory,
      additional_messages: [message],
    };

    // 如果有自定义变量，添加到请求体中
    if (Object.keys(customVariables).length > 0) {
      requestBody.custom_variables = customVariables;
    }

    // 如果有sessionName，添加到自定义变量中（扣子会话隔离要求）
    if (sessionName) {
      requestBody.custom_variables = {
        ...requestBody.custom_variables,
        session_name: sessionName,
      };
    }

    console.log("发送 Coze API 请求:", {
      conversation_id: conversationId,
      user_id: finalUserId,
      session_name: sessionName,
      stream,
      message_type: message.content_type,
      custom_variables: requestBody.custom_variables,
    });

    console.log(
      "发送请求到:",
      `${this.baseURL}/v3/chat?conversation_id=${conversationId}`
    );
    console.log("请求体:", JSON.stringify(requestBody, null, 2));

    const response = await this.request(
      `${this.baseURL}/v3/chat?conversation_id=${conversationId}`,
      {
        method: "POST",
        headers: {
          Accept: stream ? "text/event-stream" : "application/json",
        },
        body: JSON.stringify(requestBody),
      },
      userId,
      sessionName
    );
    console.log("response 状态:", response.status);
    console.log("response 状态文本:", response.statusText);
    console.log(
      "response headers:",
      Object.fromEntries(response.headers.entries())
    );

    return response;
  }

  /**
   * 获取对话详情
   * @param {string} conversationId - 对话ID
   * @param {string} userId - 用户ID（用于OAuth JWT认证）
   * @param {string} sessionName - 会话名称（用于会话隔离）
   * @returns {Promise<Object>} 对话详情
   */
  async getConversationDetail(
    conversationId,
    userId = null,
    sessionName = null
  ) {
    const response = await this.request(
      `${this.baseURL}/v1/conversations/retrieve?conversation_id=${conversationId}`,
      { method: "GET" },
      userId,
      sessionName
    );
    const data = await response.json();
    return data.data;
  }

  /**
   * 获取用户对话列表
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @param {string} sessionName - 会话名称（用于会话隔离）
   * @returns {Promise<Array>} 对话列表
   */
  async getUserConversations(userId, options = {}, sessionName = null) {
    try {
      console.log("获取用户对话列表:", { userId, options, sessionName });

      const queryParams = new URLSearchParams({
        bot_id: this.botId,
        page_num: 1,
        order: options.order?.toUpperCase() || "DESC",
      });

      const response = await this.request(
        `${this.baseURL}/v1/conversations?${queryParams.toString()}`,
        {
          method: "GET",
        },
        userId,
        sessionName
      );

      const data = await response.json();
      console.log("用户对话列表获取成功:", data);

      return data.data || [];
    } catch (error) {
      console.error("获取用户对话列表失败:", error);
      throw error;
    }
  }

  /**
   * 获取对话消息列表
   * @param {string} conversationId - 对话ID
   * @param {Object} options - 查询选项
   * @param {string} userId - 用户ID（用于OAuth JWT认证）
   * @param {string} sessionName - 会话名称（用于会话隔离）
   * @returns {Promise<Object>} 消息列表和分页信息
   */
  async getConversationMessages(
    conversationId,
    options = {},
    userId = null,
    sessionName = null
  ) {
    try {
      console.log("获取对话消息:", {
        conversationId,
        options,
        userId,
        sessionName,
      });

      const requestBody = {
        limit: options.limit || null,
        order: options.order || "asc",
        ...(options.chat_id && { chat_id: options.chat_id }),
        ...(options.before_id && { before_id: options.before_id }),
      };

      const response = await this.request(
        `${this.baseURL}/v1/conversation/message/list?conversation_id=${conversationId}`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
        userId,
        sessionName
      );

      const data = await response.json();
      console.log("对话消息获取成功:", data);

      return {
        data: data.data || [],
        first_id: data.first_id,
        last_id: data.last_id,
        has_more: data.has_more,
        detail: data.detail,
      };
    } catch (error) {
      console.error("获取对话消息失败:", error);
      throw error;
    }
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
    console.log("后端开始处理流式响应");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = ""; // 用于处理跨块的数据

    try {
      console.log("开始读取Coze API流式数据");
      let currentEvent = null;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("Coze API流式读取完成，发送结束信号");
          onData({ type: "end", success: true });
          break;
        }

        // 解码当前块并添加到缓冲区
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // 按行分割并处理
        const lines = buffer.split("\n");
        // 保留最后一行（可能不完整）
        buffer = lines.pop() || "";

        // 处理完整的行
        for (const line of lines) {
          if (!line.trim()) continue;

          console.log("--------------------------------");
          console.log("处理Coze API行:", line);
          console.log("--------------------------------");

          if (line.startsWith("event:")) {
            // 保存事件类型
            currentEvent = line.slice(6).trim();
            console.log("当前事件类型:", currentEvent);
          } else if (line.startsWith("data:")) {
            // 处理数据
            const data = line.slice(5).trim();

            if (data === "[DONE]") {
              console.log("收到Coze API结束信号");
              onData({ type: "end", success: true });
              return;
            }

            try {
              const parsed = JSON.parse(data);
              console.log("解析Coze API数据:", {
                event: currentEvent,
                data: parsed,
              });

              // 根据Coze API事件类型处理
              if (currentEvent) {
                this.processCozeEvent(currentEvent, parsed, onData);
              }
            } catch (e) {
              console.warn("JSON解析错误:", e, "原始数据:", data);
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
    } catch (error) {
      console.error("处理Coze API流式响应失败:", error);
      onData({
        type: "error",
        error: error.message || "处理流式响应时发生错误",
      });
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 处理Coze API事件
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据
   * @param {Function} onData - 数据回调函数
   */
  processCozeEvent(eventType, data, onData) {
    console.log("处理Coze事件:", { eventType, data });

    switch (eventType) {
      case "conversation.chat.created":
        // 对话创建事件
        console.log("处理对话创建事件");
        onData({
          type: "conversation_created",
          conversation_id: data.conversation_id,
          chat_id: data.id,
          status: data.status,
        });
        break;

      case "conversation.chat.in_progress":
        // 对话进行中事件
        console.log("处理对话进行中事件");
        onData({
          type: "status",
          status: "in_progress",
          chat_id: data.id,
        });
        break;

      case "conversation.message.delta":
        // 消息增量事件
        if (
          data.role === "assistant" &&
          data.type === "answer" &&
          data.content
        ) {
          console.log("处理消息增量事件:", data.content);
          onData({
            type: "content",
            content: data.content,
            message_id: data.id,
            is_delta: true,
          });
        }
        break;

      case "conversation.message.completed":
        // 消息完成事件
        console.log("处理消息完成事件:", data.type);
        if (data.role === "assistant") {
          if (data.type === "answer" && data.content) {
            // 回答消息完成
            onData({
              type: "content_complete",
              content: data.content,
              message_id: data.id,
              content_type: data.content_type,
            });
          } else if (data.type === "verbose") {
            // 详细信息消息
            onData({
              type: "verbose",
              content: data.content,
              message_id: data.id,
            });
          } else if (data.type === "follow_up") {
            // 建议问题
            onData({
              type: "suggestion",
              content: data.content,
              message_id: data.id,
            });
          }
        }
        break;

      case "conversation.chat.completed":
        // 对话完成事件
        console.log("处理对话完成事件");
        onData({
          type: "chat_completed",
          chat_id: data.id,
          usage: data.usage,
          status: data.status,
          completed_at: data.completed_at,
        });
        break;

      case "conversation.chat.failed":
        // 对话失败事件
        console.log("处理对话失败事件");
        onData({
          type: "error",
          error: data.last_error?.msg || "对话处理失败",
          code: data.last_error?.code,
          chat_id: data.id,
        });
        break;

      case "done":
        // 完成事件
        console.log("处理完成事件");
        onData({ type: "end", success: true });
        break;

      default:
        // 未知事件类型
        console.log("未知事件类型:", eventType);
        onData({
          type: "unknown_event",
          event: eventType,
          data: data,
        });
        break;
    }
  }

  /**
   * 分析简历（流式）- 文本模式
   * @param {string} text - 文本内容
   * @param {Response} res - Express响应对象
   * @param {Object} customVariables - 自定义变量
   * @param {string} userId - 用户ID（用于OAuth JWT认证）
   * @param {string} sessionName - 会话名称（用于会话隔离）
   * @returns {Promise<void>}
   */
  async analyzeTextStream(
    text,
    res,
    customVariables = {},
    userId = null,
    sessionName = null
  ) {
    try {
      console.log("analyzeTextStream 开始执行");
      console.log("参数:", { text, customVariables, userId, sessionName });

      // 如果提供了conversation_id，使用它；否则创建新的对话
      let conversationId = customVariables.conversation_id;
      if (!conversationId) {
        conversationId = await this.createConversation(userId, sessionName);
        console.log("对话ID创建完成:", conversationId);

        // 发送对话创建事件到前端
        res.write(
          `data: ${JSON.stringify({
            type: "conversation_created",
            conversation_id: conversationId,
          })}\n\n`
        );
      } else {
        console.log("使用现有对话ID:", conversationId);
      }

      const message = this.buildTextMessage(text);
      console.log("消息构建完成:", message);

      console.log("发送聊天请求");
      const response = await this.sendChatRequest(
        conversationId,
        message,
        {
          stream: true,
          customVariables,
        },
        userId,
        sessionName
      );

      console.log("开始处理流式响应");
      await this.handleStreamResponse(response, (data) => {
        // 立即转发数据到前端，不进行累积
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      });

      // 确保发送结束信号
      console.log("流式响应处理完成，发送最终结束信号");
      res.write("data: [DONE]\n\n");
    } catch (error) {
      console.error("文本流式分析失败:", error);
      res.write(
        `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
      );
      res.write("data: [DONE]\n\n");
    }
  }

  /**
   * 检测文件类型
   * @param {string} fileName - 文件名
   * @param {string} mimeType - MIME类型
   * @returns {string} 文件类型 (image/document)
   */
  detectFileType(fileName, mimeType) {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    const imageMimeTypes = [
      "image/jpeg",
      "image/jpg", // 兼容性支持
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];

    const fileExtension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf("."));

    if (
      imageExtensions.includes(fileExtension) ||
      imageMimeTypes.includes(mimeType)
    ) {
      return "image";
    }

    return "document";
  }

  /**
   * 分析简历（流式）- 文件模式
   * @param {string} fileId - 文件ID
   * @param {Response} res - Express响应对象
   * @param {string} fileName - 文件名
   * @param {string} text - 文本内容（可选）
   * @param {Object} customVariables - 自定义变量
   * @returns {Promise<void>}
   */
  async analyzeFileStream(
    fileId,
    res,
    fileName,
    text = null,
    customVariables = {}
  ) {
    try {
      console.log("analyzeFileStream 开始执行");
      console.log("参数:", { fileName, text, customVariables });

      // 如果提供了conversation_id，使用它；否则创建新的对话
      let conversationId = customVariables.conversation_id;
      if (!conversationId) {
        conversationId = await this.createConversation();
        console.log("对话ID创建完成:", conversationId);

        // 发送对话创建事件到前端
        res.write(
          `data: ${JSON.stringify({
            type: "conversation_created",
            conversation_id: conversationId,
          })}\n\n`
        );
      } else {
        console.log("使用现有对话ID:", conversationId);
      }

      // 检测文件类型
      const fileType = this.detectFileType(
        fileName,
        customVariables.mimeType || ""
      );
      console.log("检测到文件类型:", fileType);

      const message = this.buildFileMessage(fileId, text, fileType);
      console.log("消息构建完成:", message);

      const response = await this.sendChatRequest(conversationId, message, {
        stream: true,
        customVariables,
      });

      console.log("开始处理流式响应");
      await this.handleStreamResponse(response, (data) => {
        // 立即转发数据到前端
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      });

      // 确保发送结束信号
      console.log("文件流式响应处理完成，发送最终结束信号");
      res.write("data: [DONE]\n\n");
    } catch (error) {
      console.error("文件流式分析失败:", error);
      res.write(
        `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
      );
      res.write("data: [DONE]\n\n");
    }
  }

  /**
   * 分析简历（流式）- 文件ID模式
   * @param {string} fileId - 文件ID
   * @param {Response} res - Express响应对象
   * @param {string} text - 文本内容（可选）
   * @param {Object} customVariables - 自定义变量
   * @param {string} userId - 用户ID（用于OAuth JWT认证）
   * @param {string} sessionName - 会话名称（用于会话隔离）
   * @returns {Promise<void>}
   */
  async analyzeFileWithIdStream(
    fileId,
    res,
    text = null,
    customVariables = {},
    userId = null,
    sessionName = null
  ) {
    try {
      console.log("analyzeFileWithIdStream 开始执行");
      console.log("参数:", {
        fileId,
        text,
        customVariables,
        userId,
        sessionName,
      });

      // 如果提供了conversation_id，使用它；否则创建新的对话
      let conversationId = customVariables.conversation_id;
      if (!conversationId) {
        conversationId = await this.createConversation(userId, sessionName);
        console.log("对话ID创建完成:", conversationId);

        // 发送对话创建事件到前端
        res.write(
          `data: ${JSON.stringify({
            type: "conversation_created",
            conversation_id: conversationId,
          })}\n\n`
        );
      } else {
        console.log("使用现有对话ID:", conversationId);
      }

      // 构建文件消息
      const message = this.buildFileMessage(fileId, text, "document");
      console.log("消息构建完成:", message);

      const response = await this.sendChatRequest(
        conversationId,
        message,
        {
          stream: true,
          customVariables,
        },
        userId,
        sessionName
      );

      console.log("开始处理流式响应");
      await this.handleStreamResponse(response, (data) => {
        // 立即转发数据到前端
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      });

      // 确保发送结束信号
      console.log("文件ID流式响应处理完成，发送最终结束信号");
      res.write("data: [DONE]\n\n");
    } catch (error) {
      console.error("文件ID流式分析失败:", error);
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
  customVariables = {},
  userId = null,
  sessionName = null
) {
  return cozeClient.analyzeTextStream(
    userQuestion,
    res,
    customVariables,
    userId,
    sessionName
  );
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
