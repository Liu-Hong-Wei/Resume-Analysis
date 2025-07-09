import {
  convertPDFToBase64,
  validatePDFFile,
  extractPDFText,
  validateExtractedText,
} from "../utils/pdfExtractor.js";
import {
  analyzeResumeWithCozeFile,
  analyzeResumeWithCozeFileStream,
  analyzeResumeWithCoze,
  analyzeResumeWithCozeStream,
} from "./cozeService.js";
import { validateConfig } from "../config/index.js";

/**
 * 简历分析服务类
 */
export class ResumeAnalysisService {
  /**
   * 验证上传的文件
   * @param {Object} req - Express请求对象
   * @returns {Object} 验证结果
   */
  static async validateUploadedFile(req) {
    if (!req.file) {
      return {
        isValid: false,
        error: {
          status: 400,
          message: "请上传PDF简历文件",
        },
      };
    }

    try {
      validateConfig();
    } catch (error) {
      return {
        isValid: false,
        error: {
          status: 500,
          message: `服务器配置错误：${error.message}`,
        },
      };
    }

    const filePath = req.file.path;
    console.log(`处理文件: ${req.file.originalname}`);

    const isValidFile = await validatePDFFile(filePath);
    if (!isValidFile) {
      return {
        isValid: false,
        error: {
          status: 400,
          message: "无效的文件格式，请检查文件",
        },
      };
    }

    return { isValid: true, filePath };
  }

  /**
   * 分析简历（非流式）
   * @param {string} filePath - 文件路径
   * @param {string} fileName - 文件名
   * @param {number} fileSize - 文件大小
   * @returns {Object} 分析结果
   */
  static async analyzeResume(filePath, fileName, fileSize) {
    let analysisResult;
    let analysisMode = "file";

    try {
      // 尝试直接上传PDF文件到Coze
      const pdfBase64 = await convertPDFToBase64(filePath);
      analysisResult = await analyzeResumeWithCozeFile(pdfBase64, fileName);
      console.log("使用文件上传模式分析成功");
    } catch (fileError) {
      console.warn("文件上传模式失败，回退到文本提取模式:", fileError.message);

      // 如果文件上传失败，回退到文本提取模式
      try {
        const resumeText = await extractPDFText(filePath);
        if (!validateExtractedText(resumeText)) {
          throw new Error("无法从PDF中提取文本内容，请检查文件格式");
        }
        analysisResult = await analyzeResumeWithCoze(resumeText);
        analysisMode = "text";
        console.log("使用文本提取模式分析成功");
      } catch (textError) {
        throw new Error(
          `文件上传模式和文本提取模式都失败: ${fileError.message}, ${textError.message}`
        );
      }
    }

    return {
      success: true,
      message: "简历分析完成",
      data: {
        analysis: analysisResult,
        fileName: fileName,
        fileSize: fileSize,
        uploadTime: new Date().toISOString(),
        analysisMode: analysisMode,
      },
    };
  }

  /**
   * 流式分析简历
   * @param {string} filePath - 文件路径
   * @param {Object} res - Express响应对象
   * @param {string} fileName - 文件名
   * @returns {Promise<void>}
   */
  static async analyzeResumeStream(filePath, res, fileName) {
    let analysisMode = "file";

    try {
      // 尝试直接上传PDF文件到Coze
      const pdfBase64 = await convertPDFToBase64(filePath);
      await analyzeResumeWithCozeFileStream(pdfBase64, res, fileName);
      console.log("使用文件上传模式流式分析成功");
    } catch (fileError) {
      console.warn(
        "文件上传流式模式失败，回退到文本提取模式:",
        fileError.message
      );

      // 如果文件上传失败，回退到文本提取模式
      try {
        const resumeText = await extractPDFText(filePath);
        if (!validateExtractedText(resumeText)) {
          throw new Error("无法从PDF中提取文本内容，请检查文件格式");
        }
        await analyzeResumeWithCozeStream(resumeText, res);
        analysisMode = "text";
        console.log("使用文本提取模式流式分析成功");
      } catch (textError) {
        throw new Error(
          `文件上传模式和文本提取模式都失败: ${fileError.message}, ${textError.message}`
        );
      }
    }
  }
}
