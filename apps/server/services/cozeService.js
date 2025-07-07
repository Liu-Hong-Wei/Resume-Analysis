import { COZE_CONFIG } from "../config/index.js";

/**
 * 构建Coze API请求体（文本模式）
 * @param {string} resumeText - 简历文本内容
 * @param {boolean} stream - 是否使用流式响应
 * @returns {Object} 请求体对象
 */
function buildCozeRequestBody(resumeText, stream = false) {
  // 限制文本长度
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
 * @param {string} pdfBase64 - Base64编码的PDF文件
 * @param {boolean} stream - 是否使用流式响应
 * @returns {Object} 请求体对象
 */
function buildCozeRequestBodyWithFile(pdfBase64, stream = false) {
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
            file: {
              type: "application/pdf",
              data: pdfBase64,
            },
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

  try {
    const errorData = JSON.parse(errorText);
    if (errorData.error) {
      errorMessage += ` - ${errorData.error.message || errorData.error}`;
    }
  } catch (e) {
    errorMessage += ` - ${errorText}`;
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
 * @returns {Promise<string>} 分析结果
 */
export async function analyzeResumeWithCozeFile(pdfBase64) {
  try {
    // 验证输入参数
    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      throw new Error("PDF文件内容无效");
    }

    const requestBody = buildCozeRequestBodyWithFile(pdfBase64, false);

    console.log("发送Coze API请求（文件模式）:", {
      bot_id: COZE_CONFIG.BOT_ID,
      file_size: Math.round(pdfBase64.length * 0.75), // Base64编码会增加约33%的大小
      max_tokens: requestBody.max_tokens,
    });

    const response = await fetch(COZE_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
        "User-Agent": "Resume-Analysis-API/1.0",
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
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorMessage = await handleCozeError(response);
      throw new Error(errorMessage);
    }

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
export async function analyzeResumeWithCozeFileStream(pdfBase64, res) {
  try {
    // 验证输入参数
    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      throw new Error("PDF文件内容无效");
    }

    const requestBody = buildCozeRequestBodyWithFile(pdfBase64, true);

    console.log("发送Coze API流式请求（文件模式）:", {
      bot_id: COZE_CONFIG.BOT_ID,
      file_size: Math.round(pdfBase64.length * 0.75),
      max_tokens: requestBody.max_tokens,
    });

    const response = await fetch(COZE_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COZE_CONFIG.API_KEY}`,
        "User-Agent": "Resume-Analysis-API/1.0",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorMessage = await handleCozeError(response);
      throw new Error(errorMessage);
    }

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
