import { COZE_CONFIG } from "../config/index.js";
import FormData from "form-data";

/**
 * 处理Coze API错误响应
 * @param {Response} response - fetch响应对象
 * @returns {Promise<string>} 错误消息
 */
async function handleCozeError(response) {
  const errorText = await response.text();
  let errorMessage = `Coze API请求失败: ${response.status} ${response.statusText}`;

  console.log(`Coze API错误响应状态: ${response.status}`);
  console.log(
    `Coze API错误响应头:`,
    Object.fromEntries(response.headers.entries())
  );
  console.log(`Coze API错误响应内容前200字符:`, errorText.substring(0, 200));

  // 检查是否是HTML响应（通常表示URL错误或服务器错误）
  if (
    errorText.trim().toLowerCase().startsWith("<!doctype") ||
    errorText.trim().toLowerCase().startsWith("<html")
  ) {
    errorMessage += " (服务器返回HTML页面，可能是API URL错误或服务器问题)";
    console.error(
      "收到HTML响应，可能是API配置错误:",
      errorText.substring(0, 500)
    );
    return errorMessage;
  }

  try {
    const errorData = JSON.parse(errorText);
    if (errorData.error) {
      errorMessage += ` - ${errorData.error.message || errorData.error}`;
    } else if (errorData.message) {
      errorMessage += ` - ${errorData.message}`;
    }
  } catch (e) {
    console.error("解析错误响应JSON失败:", e);
    errorMessage += ` - 响应内容: ${errorText.substring(0, 200)}`;
  }

  // 根据HTTP状态码添加更详细的错误信息
  switch (response.status) {
    case 400:
      errorMessage += " (请求参数错误)";
      break;
    case 401:
      errorMessage += " (认证失败，请检查API密钥)";
      break;
    case 403:
      errorMessage += " (权限不足)";
      break;
    case 404:
      errorMessage += " (资源不存在，请检查API URL)";
      break;
    case 429:
      errorMessage += " (请求频率超限)";
      break;
    case 500:
      errorMessage += " (服务器内部错误)";
      break;
    case 502:
    case 503:
    case 504:
      errorMessage += " (服务器暂时不可用)";
      break;
  }

  return errorMessage;
}

/**
 * 创建Coze对话
 * @returns {Promise<string>} 对话ID
 */
async function createCozeConversation() {
  try {
    console.log("创建Coze对话...");

    const response = await fetch(COZE_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
        "User-Agent": "Resume-Analysis-API/1.0",
      },
      body: JSON.stringify({
        bot_id: COZE_CONFIG.BOT_ID,
      }),
    });

    if (!response.ok) {
      const errorMessage = await handleCozeError(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("对话创建成功:", data);

    // 根据Coze API响应格式，conversation_id在data.data.id中
    if (!data.data || !data.data.id) {
      throw new Error("创建对话失败：未返回对话ID");
    }

    return data.data.id;
  } catch (error) {
    console.error("创建对话详细错误:", error);
    throw new Error(`创建对话失败: ${error.message}`);
  }
}

/**
 * 构建Coze消息体（文本模式）
 * @param {string} userQuestion - 用户提问，包含简历内容
 * @param {Object} customVariables - 自定义变量，用于指定分析类型
 * @returns {Object} 消息体对象
 */
function buildCozeMessage(userQuestion) {
  // 限制文本长度
  const truncatedQuestion =
    userQuestion.length > COZE_CONFIG.MAX_TEXT_LENGTH
      ? userQuestion.substring(0, COZE_CONFIG.MAX_TEXT_LENGTH) + "..."
      : userQuestion;

  return {
    role: "user",
    content_type: "text",
    type: "question",
    content: truncatedQuestion,
  };
}

/**
 * 构建Coze消息体（文件模式）- 使用object_string格式
 * @param {string} fileId - 文件ID
 * @param {string} userQuestion - 用户提问（可选，如果没有则使用默认分析模板）
 * @param {Object} customVariables - 自定义变量，用于指定分析类型
 * @returns {Object} 消息体对象
 */
function buildCozeMessageWithFile(fileId, userQuestion = null) {
  // 构建object_string格式的内容
  const textContent = userQuestion || "请按照预设的分析模板分析以下简历PDF文件";

  const objectContent = [
    {
      type: "text",
      text: textContent,
    },
    {
      type: "file",
      file_id: fileId,
    },
  ];

  return {
    role: "user",
    content_type: "object_string",
    type: "question",
    content: JSON.stringify(objectContent),
  };
}

/**
 * 验证Coze API响应格式并提取Chat ID
 * @param {Object} data - API响应数据
 * @returns {string} Chat ID
 * @throws {Error} 如果响应格式不正确
 */
function validateCozeResponse(data) {
  // 检查非流式响应格式 (v3 API)
  if (data.data && data.data.id) {
    return data.data.id;
  }

  // 兼容性检查
  if (data.id) {
    return data.id;
  }

  console.error("无法识别的Coze API响应格式:", data);
  throw new Error("Coze API响应格式错误：无法找到Chat ID");
}

/**
 * 获取聊天消息内容
 * @param {string} chatId - Chat ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<string>} 消息内容
 */
async function getChatMessages(chatId, conversationId) {
  const maxRetries = 5;
  const retryDelay = 1000; // 1秒

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`获取聊天消息 (尝试 ${attempt}/${maxRetries}):`, {
        chat_id: chatId,
      });

      const response = await fetch(
        `${COZE_CONFIG.BASE_URL}/v3/chat/message/list?chat_id=${chatId}&conversation_id=${conversationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
            "User-Agent": "Resume-Analysis-API/1.0",
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await handleCozeError(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`获取聊天消息响应 (尝试 ${attempt}):`, data);

      // 根据官方文档，查找assistant角色的消息
      if (data.data && Array.isArray(data.data)) {
        console.log(
          "消息列表:",
          data.data.map((msg) => ({
            role: msg.role,
            type: msg.type,
            content_length: msg.content?.length || 0,
          }))
        );

        // 优先查找 type: "answer" 的 assistant 消息（这是实际的回答内容）
        const answerMessage = data.data.find(
          (msg) => msg.role === "assistant" && msg.type === "answer"
        );

        if (answerMessage && answerMessage.content) {
          console.log("找到 answer 消息:", {
            id: answerMessage.id,
            content_length: answerMessage.content.length,
          });
          return answerMessage.content;
        }

        // 如果没有找到 answer 类型，查找任何 assistant 消息（排除 verbose 类型）
        const assistantMessage = data.data.find(
          (msg) => msg.role === "assistant" && msg.type !== "verbose"
        );

        if (assistantMessage && assistantMessage.content) {
          console.log("找到 assistant 消息:", {
            id: assistantMessage.id,
            type: assistantMessage.type,
            content_length: assistantMessage.content.length,
          });
          return assistantMessage.content;
        }

        // 最后查找任何 assistant 消息（包括 verbose）
        const anyAssistantMessage = data.data.find(
          (msg) => msg.role === "assistant"
        );

        if (anyAssistantMessage && anyAssistantMessage.content) {
          console.log("找到任何 assistant 消息:", {
            id: anyAssistantMessage.id,
            type: anyAssistantMessage.type,
            content_length: anyAssistantMessage.content.length,
          });
          return anyAssistantMessage.content;
        }
      }

      console.log("获取聊天消息响应格式:", data);

      // 如果这是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw new Error("未找到assistant消息内容");
      }

      // 否则等待后重试
      console.log(`等待 ${retryDelay}ms 后重试...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    } catch (error) {
      console.error(`获取聊天消息详细错误 (尝试 ${attempt}):`, error);

      // 如果是网络错误或API错误，直接抛出
      if (
        error.message.includes("API请求失败") ||
        error.message.includes("网络错误")
      ) {
        throw new Error(`获取聊天消息失败: ${error.message}`);
      }

      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw new Error(`获取聊天消息失败: ${error.message}`);
      }

      // 否则等待后重试
      console.log(`等待 ${retryDelay}ms 后重试...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

/**
 * 上传文件到 Coze API - 使用multipart/form-data格式
 * @param {Buffer} fileBuffer - 文件Buffer内容
 * @param {string} fileName - 文件名
 * @param {string} mimeType - 文件MIME类型
 * @returns {Promise<string>} 文件ID
 */
async function uploadFileToCoze(
  fileBuffer,
  fileName,
  mimeType = "application/pdf"
) {
  try {
    const uploadUrl = `${COZE_CONFIG.BASE_URL}/v1/files/upload`;

    console.log("开始上传文件到Coze:", {
      fileName,
      mimeType,
      fileSize: fileBuffer.length,
      uploadUrl,
    });

    // 创建FormData对象
    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
        "User-Agent": "Resume-Analysis-API/1.0",
        ...formData.getHeaders(),
      },
      body: formData,
    });

    console.log("文件上传响应状态:", response.status, response.statusText);

    if (!response.ok) {
      const errorMessage = await handleCozeError(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("文件上传成功响应:", data);

    // 根据Coze API响应格式，文件ID在data.data.id中
    if (!data.data || !data.data.id) {
      console.error("文件上传响应缺少data.id:", data);
      throw new Error("文件上传失败：未返回文件ID");
    }

    console.log("文件上传成功:", {
      file_id: data.data.id,
      filename: fileName,
      bytes: data.data.bytes,
    });

    return data.data.id;
  } catch (error) {
    console.error("文件上传详细错误:", error);
    throw new Error(`文件上传失败: ${error.message}`);
  }
}

/**
 * 调用Coze API进行简历分析（非流式）- 文本模式
 * @param {string} userQuestion - 用户提问，包含简历内容
 * @param {Object} customVariables - 自定义变量，用于指定分析类型
 * @returns {Promise<string>} 分析结果
 */
export async function analyzeResumeWithCoze(
  userQuestion,
  customVariables = {}
) {
  try {
    // 验证输入参数
    if (!userQuestion || typeof userQuestion !== "string") {
      throw new Error("用户提问内容无效");
    }

    // 创建对话
    const conversationId = await createCozeConversation();

    // 构建消息
    const message = buildCozeMessage(userQuestion);

    console.log("发送Coze API请求（文本模式）:", {
      bot_id: COZE_CONFIG.BOT_ID,
      conversation_id: conversationId,
      text_length: message.content.length,
      custom_variables: customVariables,
    });

    const response = await fetch(
      `${COZE_CONFIG.BASE_URL}/v3/chat?conversation_id=${conversationId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
          "User-Agent": "Resume-Analysis-API/1.0",
          Accept: "application/json",
        },
        body: JSON.stringify({
          bot_id: COZE_CONFIG.BOT_ID,
          user_id: "resume_analysis_user",
          stream: false,
          additional_messages: [message],
          custom_variables: customVariables,
        }),
      }
    );

    if (!response.ok) {
      const errorMessage = await handleCozeError(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const chatId = validateCozeResponse(data);

    console.log("Coze API响应成功:", {
      conversation_id: conversationId,
      chat_id: chatId,
      status: data.data?.status,
    });

    // 获取聊天消息内容
    const content = await getChatMessages(chatId, conversationId);
    return content;
  } catch (error) {
    console.error("Coze API调用详细错误:", error);
    throw new Error(`Coze API调用失败: ${error.message}`);
  }
}

/**
 * 调用Coze API进行简历分析（非流式）- 文件上传模式
 * @param {Buffer} pdfBuffer - PDF文件Buffer
 * @param {string} fileName - 文件名
 * @param {string} userQuestion - 用户提问（可选，如果没有则使用默认分析模板）
 * @param {Object} customVariables - 自定义变量，用于指定分析类型
 * @returns {Promise<string>} 分析结果
 */
export async function analyzeResumeWithCozeFile(
  pdfBuffer,
  fileName = "resume.pdf",
  userQuestion = null,
  customVariables = {}
) {
  try {
    // 验证输入参数
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      throw new Error("PDF文件内容无效");
    }

    // 先上传文件获取文件ID
    const fileId = await uploadFileToCoze(pdfBuffer, fileName);

    // 创建对话
    const conversationId = await createCozeConversation();

    // 构建消息
    const message = buildCozeMessageWithFile(fileId, userQuestion);

    console.log("发送Coze API请求（文件模式）:", {
      bot_id: COZE_CONFIG.BOT_ID,
      conversation_id: conversationId,
      file_id: fileId,
      file_size: pdfBuffer.length,
      custom_variables: customVariables,
      has_user_question: !!userQuestion,
    });

    const response = await fetch(
      `${COZE_CONFIG.BASE_URL}/v3/chat?conversation_id=${conversationId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
          "User-Agent": "Resume-Analysis-API/1.0",
          Accept: "application/json",
        },
        body: JSON.stringify({
          bot_id: COZE_CONFIG.BOT_ID,
          user_id: "resume_analysis_user",
          stream: false,
          additional_messages: [message],
          custom_variables: customVariables,
        }),
      }
    );

    if (!response.ok) {
      const errorMessage = await handleCozeError(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const chatId = validateCozeResponse(data);

    console.log("Coze API响应成功（文件模式）:", {
      conversation_id: conversationId,
      chat_id: chatId,
      status: data.data?.status,
    });

    // 获取聊天消息内容
    const content = await getChatMessages(chatId, conversationId);
    return content;
  } catch (error) {
    console.error("Coze API文件模式调用详细错误:", error);
    throw new Error(`Coze API文件模式调用失败: ${error.message}`);
  }
}

/**
 * 调用Coze API进行简历分析（流式）- 文本模式
 * @param {string} userQuestion - 用户提问，包含简历内容
 * @param {Response} res - Express响应对象
 * @param {Object} customVariables - 自定义变量，用于指定分析类型
 * @returns {Promise<void>}
 */
export async function analyzeResumeWithCozeStream(
  userQuestion,
  res,
  customVariables = {}
) {
  try {
    // 验证输入参数
    if (!userQuestion || typeof userQuestion !== "string") {
      throw new Error("用户提问内容无效");
    }

    // 创建对话
    const conversationId = await createCozeConversation();

    // 构建消息
    const message = buildCozeMessage(userQuestion);

    console.log("发送Coze API流式请求（文本模式）:", {
      bot_id: COZE_CONFIG.BOT_ID,
      conversation_id: conversationId,
      text_length: message.content.length,
      custom_variables: customVariables,
    });

    const response = await fetch(
      `${COZE_CONFIG.STREAM_URL}?conversation_id=${conversationId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
          "User-Agent": "Resume-Analysis-API/1.0",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          bot_id: COZE_CONFIG.BOT_ID,
          user_id: "resume_analysis_user",
          stream: true,
          auto_save_history: true,
          additional_messages: [message],
          custom_variables: customVariables,
        }),
      }
    );

    if (!response.ok) {
      const errorMessage = await handleCozeError(response);
      throw new Error(errorMessage);
    }

    // 设置流式响应头
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("event:conversation.message.delta")) {
            // 跳过事件行，读取下一行的数据
            continue;
          } else if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              res.write("data: [DONE]\n\n");
              break;
            }

            try {
              const parsed = JSON.parse(data);
              // 只处理 assistant 角色的消息内容
              if (parsed.role === "assistant" && parsed.content) {
                res.write(
                  `data: ${JSON.stringify({
                    type: "content",
                    content: parsed.content,
                  })}\n\n`
                );
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
  } catch (error) {
    console.error("Coze API流式调用详细错误:", error);
    throw new Error(`Coze API流式调用失败: ${error.message}`);
  }
}

/**
 * 调用Coze API进行简历分析（流式）- 文件上传模式
 * @param {Buffer} pdfBuffer - PDF文件Buffer
 * @param {Response} res - Express响应对象
 * @param {string} fileName - 文件名
 * @param {string} userQuestion - 用户提问（可选，如果没有则使用默认分析模板）
 * @param {Object} customVariables - 自定义变量，用于指定分析类型
 * @returns {Promise<void>}
 */
export async function analyzeResumeWithCozeFileStream(
  pdfBuffer,
  res,
  fileName = "resume.pdf",
  userQuestion = null,
  customVariables = {}
) {
  try {
    // 验证输入参数
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      throw new Error("PDF文件内容无效");
    }

    // 先上传文件获取文件ID
    const fileId = await uploadFileToCoze(pdfBuffer, fileName);

    // 创建对话
    const conversationId = await createCozeConversation();

    // 构建消息
    const message = buildCozeMessageWithFile(fileId, userQuestion);

    console.log("发送Coze API流式请求（文件模式）:", {
      bot_id: COZE_CONFIG.BOT_ID,
      conversation_id: conversationId,
      file_id: fileId,
      file_size: pdfBuffer.length,
      custom_variables: customVariables,
      has_user_question: !!userQuestion,
    });

    const response = await fetch(
      `${COZE_CONFIG.STREAM_URL}?conversation_id=${conversationId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
          "User-Agent": "Resume-Analysis-API/1.0",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          bot_id: COZE_CONFIG.BOT_ID,
          user_id: "resume_analysis_user",
          stream: true,
          auto_save_history: true,
          additional_messages: [message],
          custom_variables: customVariables,
        }),
      }
    );

    if (!response.ok) {
      const errorMessage = await handleCozeError(response);
      throw new Error(errorMessage);
    }

    // 设置流式响应头
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("event:conversation.message.delta")) {
            // 跳过事件行，读取下一行的数据
            continue;
          } else if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              res.write("data: [DONE]\n\n");
              break;
            }

            try {
              const parsed = JSON.parse(data);
              // 只处理 assistant 角色的消息内容
              if (parsed.role === "assistant" && parsed.content) {
                res.write(
                  `data: ${JSON.stringify({
                    type: "content",
                    content: parsed.content,
                  })}\n\n`
                );
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
  } catch (error) {
    console.error("Coze API文件模式流式调用详细错误:", error);
    throw new Error(`Coze API文件模式流式调用失败: ${error.message}`);
  }
}
