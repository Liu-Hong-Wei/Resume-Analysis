import fs from "fs";

/**
 * 从PDF文件中提取文本内容
 * @param {string} filePath - PDF文件路径
 * @returns {Promise<string>} 提取的文本内容
 */
export async function extractPDFText(filePath) {
  try {
    console.log(`开始提取PDF文本: ${filePath}`);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF文件不存在: ${filePath}`);
    }

    // 检查文件大小
    const stats = fs.statSync(filePath);
    console.log(`PDF文件大小: ${stats.size} bytes`);

    if (stats.size === 0) {
      throw new Error("PDF文件为空");
    }

    // 延迟加载pdf-parse模块，避免启动时的错误
    const pdf = await import("pdf-parse");
    const dataBuffer = fs.readFileSync(filePath);

    console.log(`PDF文件读取成功，缓冲区大小: ${dataBuffer.length} bytes`);

    const data = await pdf.default(dataBuffer);

    console.log(`PDF文本提取成功，文本长度: ${data.text?.length || 0} 字符`);

    return data.text;
  } catch (error) {
    console.error(`PDF解析失败: ${filePath}`, error);
    throw new Error(`PDF解析失败: ${error.message}`);
  }
}

/**
 * 验证提取的文本内容
 * @param {string} text - 提取的文本
 * @returns {boolean} 文本是否有效
 */
export function validateExtractedText(text) {
  return text && typeof text === "string" && text.trim().length > 0;
}

/**
 * 将PDF文件转换为Base64编码
 * @param {string} filePath - PDF文件路径
 * @returns {Promise<string>} Base64编码的PDF文件
 */
export async function convertPDFToBase64(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    return dataBuffer.toString("base64");
  } catch (error) {
    throw new Error(`PDF文件读取失败: ${error.message}`);
  }
}

/**
 * 验证PDF文件
 * @param {string} filePath - PDF文件路径
 * @returns {Promise<boolean>} 文件是否有效
 */
export async function validatePDFFile(filePath) {
  try {
    console.log(`开始验证PDF文件: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log("文件不存在");
      return false;
    }

    const stats = fs.statSync(filePath);
    console.log(`文件大小: ${stats.size} bytes`);

    if (stats.size === 0) {
      console.log("文件大小为0");
      return false;
    }

    // 检查文件头部是否为PDF格式
    const dataBuffer = fs.readFileSync(filePath, { start: 0, end: 8 });
    const header = dataBuffer.toString("ascii");
    console.log(`文件头部: "${header}"`);

    // 更宽松的PDF验证：检查是否包含PDF标识
    const isValidPDF = header.startsWith("%PDF");
    console.log(`PDF验证结果: ${isValidPDF}`);

    return isValidPDF;
  } catch (error) {
    console.error("PDF验证过程中发生错误:", error);
    return false;
  }
}
