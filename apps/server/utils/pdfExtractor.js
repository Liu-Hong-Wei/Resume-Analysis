import fs from "fs";

/**
 * 从PDF文件中提取文本内容
 * @param {string} filePath - PDF文件路径
 * @returns {Promise<string>} 提取的文本内容
 */
export async function extractPDFText(filePath) {
  try {
    // 延迟加载pdf-parse模块，避免启动时的错误
    const pdf = await import("pdf-parse");
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf.default(dataBuffer);
    return data.text;
  } catch (error) {
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
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      return false;
    }

    // 检查文件头部是否为PDF格式
    const dataBuffer = fs.readFileSync(filePath, { start: 0, end: 4 });
    const header = dataBuffer.toString("ascii");
    return header === "%PDF";
  } catch (error) {
    return false;
  }
}
