import { COZE_CONFIG } from "../config/index.js";

/**
 * 构建Coze API请求体（文本模式）
 * @param {string} resumeText - 简历文本内容
 * @param {boolean} stream - 是否使用流式响应
 * @returns {Object} 请求体对象
 */
function buildCozeRequestBody(resumeText, stream = false) {
  // 限制文本长度 - 根据Coze文档，支持更大的文本长度
  const truncatedText =
    resumeText.length > COZE_CONFIG.MAX_TEXT_LENGTH
      ? resumeText.substring(0, COZE_CONFIG.MAX_TEXT_LENGTH) + "..."
      : resumeText;

  return {
    bot_id: COZE_CONFIG.BOT_ID,
    messages: [
      {
        role: "user",
        content: `请分析以下简历内容，并提供详细的评估报告，包括：
1. 个人信息评估
2. 工作经验分析
3. 技能匹配度
4. 教育背景
5. 整体评价和建议

简历内容：
${truncatedText}`,
      },
    ],
    stream: stream,
    ...COZE_CONFIG.DEFAULT_PARAMS,
  };
}

/**
 * 构建Coze API请求体（文件上传模式）
 * @param {string} fileId - 文件ID
 * @param {boolean} stream - 是否使用流式响应
 * @returns {Object} 请求体对象
 */
function buildCozeRequestBodyWithFile(fileId, stream = false) {
  return {
    bot_id: COZE_CONFIG.BOT_ID,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "请分析以下简历PDF文件，并提供详细的评估报告，包括：\n1. 个人信息评估\n2. 工作经验分析\n3. 技能匹配度\n4. 教育背景\n5. 整体评价和建议",
          },
          {
            type: "file",
            file_id: fileId,
          },
        ],
      },
    ],
    stream: stream,
    ...COZE_CONFIG.DEFAULT_PARAMS,
  };
}

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
 * 验证Coze API响应格式
 * @param {Object} data - API响应数据
 * @throws {Error} 如果响应格式不正确
 */
function validateCozeResponse(data) {
  if (
    !data.choices ||
    !Array.isArray(data.choices) ||
    data.choices.length === 0
  ) {
    throw new Error("Coze API响应格式错误：缺少choices数组");
  }

  const choice = data.choices[0];
  if (!choice.message || !choice.message.content) {
    throw new Error("Coze API响应格式错误：缺少message.content");
  }
}

/**
 * 上传文件到 Coze API
 * @param {string} fileBase64 - Base64编码的文件内容
 * @param {string} fileName - 文件名
 * @param {string} mimeType - 文件MIME类型
 * @returns {Promise<string>} 文件ID
 */
async function uploadFileToCoze(
  fileBase64,
  fileName,
  mimeType = "application/pdf"
) {
  try {
    const uploadUrl = "https://www.coze.cn/open/api/files/upload";

    console.log("开始上传文件到Coze:", {
      fileName,
      mimeType,
      fileSize: Math.round(fileBase64.length * 0.75), // Base64解码后的大小
      uploadUrl,
    });

    const requestBody = {
      file: fileBase64,
      filename: fileName,
      type: mimeType,
    };

    console.log("上传请求体结构:", {
      hasFile: !!requestBody.file,
      fileLength: requestBody.file?.length,
      filename: requestBody.filename,
      type: requestBody.type,
    });

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
        "User-Agent": "Resume-Analysis-API/1.0",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("文件上传响应状态:", response.status, response.statusText);

    if (!response.ok) {
      const errorMessage = await handleCozeError(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("文件上传成功响应:", data);

    if (!data.file_id) {
      console.error("文件上传响应缺少file_id:", data);
      throw new Error("文件上传失败：未返回文件ID");
    }

    console.log("文件上传成功:", {
      file_id: data.file_id,
      filename: fileName,
    });

    return data.file_id;
  } catch (error) {
    console.error("文件上传详细错误:", error);
    throw new Error(`文件上传失败: ${error.message}`);
  }
}

/**
 * 调用Coze API进行简历分析（非流式）- 文本模式
 * @param {string} resumeText - 简历文本内容
 * @returns {Promise<string>} 分析结果
 */
export async function analyzeResumeWithCoze(resumeText) {
  try {
    // 验证输入参数
    if (!resumeText || typeof resumeText !== "string") {
      throw new Error("简历文本内容无效");
    }

    const requestBody = buildCozeRequestBody(resumeText, false);

    console.log("发送Coze API请求（文本模式）:", {
      bot_id: COZE_CONFIG.BOT_ID,
      text_length: requestBody.messages[0].content.length,
      max_tokens: requestBody.max_tokens,
    });

    const response = await fetch(COZE_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
        "User-Agent": "Resume-Analysis-API/1.0",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorMessage = await handleCozeError(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    validateCozeResponse(data);

    console.log("Coze API响应成功:", {
      usage: data.usage,
      finish_reason: data.choices[0].finish_reason,
    });

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Coze API调用详细错误:", error);
    throw new Error(`Coze API调用失败: ${error.message}`);
  }
}

/**
 * 调用Coze API进行简历分析（非流式）- 文件上传模式
 * @param {string} pdfBase64 - Base64编码的PDF文件
 * @param {string} fileName - 文件名
 * @returns {Promise<string>} 分析结果
 */
export async function analyzeResumeWithCozeFile(
  pdfBase64,
  fileName = "resume.pdf"
) {
  try {
    // 验证输入参数
    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      throw new Error("PDF文件内容无效");
    }

    // 先上传文件获取文件ID
    const fileId = await uploadFileToCoze(pdfBase64, fileName);

    const requestBody = buildCozeRequestBodyWithFile(fileId, false);

    console.log("发送Coze API请求（文件模式）:", {
      bot_id: COZE_CONFIG.BOT_ID,
      file_id: fileId,
      file_size: Math.round(pdfBase64.length * 0.75), // Base64编码会增加约33%的大小
      max_tokens: requestBody.max_tokens,
    });

    const response = await fetch(COZE_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
        "User-Agent": "Resume-Analysis-API/1.0",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorMessage = await handleCozeError(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    validateCozeResponse(data);

    console.log("Coze API响应成功（文件模式）:", {
      usage: data.usage,
      finish_reason: data.choices[0].finish_reason,
    });

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Coze API文件模式调用详细错误:", error);
    throw new Error(`Coze API文件模式调用失败: ${error.message}`);
  }
}

/**
 * 调用Coze API进行简历分析（流式）- 文本模式
 * @param {string} resumeText - 简历文本内容
 * @param {Response} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function analyzeResumeWithCozeStream(resumeText, res) {
  try {
    // 验证输入参数
    if (!resumeText || typeof resumeText !== "string") {
      throw new Error("简历文本内容无效");
    }

    const requestBody = buildCozeRequestBody(resumeText, true);

    console.log("发送Coze API流式请求（文本模式）:", {
      bot_id: COZE_CONFIG.BOT_ID,
      text_length: requestBody.messages[0].content.length,
      max_tokens: requestBody.max_tokens,
    });

    const response = await fetch(COZE_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
        "User-Agent": "Resume-Analysis-API/1.0",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(requestBody),
    });

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
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              res.write("data: [DONE]\n\n");
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (
                parsed.choices &&
                parsed.choices[0] &&
                parsed.choices[0].delta &&
                parsed.choices[0].delta.content
              ) {
                res.write(`data: ${JSON.stringify(parsed)}\n\n`);
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
 * @param {string} pdfBase64 - Base64编码的PDF文件
 * @param {Response} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function analyzeResumeWithCozeFileStream(
  pdfBase64,
  res,
  fileName = "resume.pdf"
) {
  try {
    // 验证输入参数
    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      throw new Error("PDF文件内容无效");
    }

    // 先上传文件获取文件ID
    const fileId = await uploadFileToCoze(pdfBase64, fileName);

    const requestBody = buildCozeRequestBodyWithFile(fileId, true);

    console.log("发送Coze API流式请求（文件模式）:", {
      bot_id: COZE_CONFIG.BOT_ID,
      file_id: fileId,
      file_size: Math.round(pdfBase64.length * 0.75),
      max_tokens: requestBody.max_tokens,
    });

    const response = await fetch(COZE_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
        "User-Agent": "Resume-Analysis-API/1.0",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(requestBody),
    });

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
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              res.write("data: [DONE]\n\n");
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (
                parsed.choices &&
                parsed.choices[0] &&
                parsed.choices[0].delta &&
                parsed.choices[0].delta.content
              ) {
                res.write(`data: ${JSON.stringify(parsed)}\n\n`);
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
