import express from "express";
import fs from "fs";
import { upload } from "../middleware/upload.js";
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
} from "../services/cozeService.js";
import { COZE_CONFIG, validateConfig } from "../config/index.js";

const router = express.Router();

/**
 * 简历分析API端点（非流式）- 直接上传PDF文件
 * POST /api/analyze-resume
 */
// 定义POST路由 /analyze-resume，使用upload.single("resume")中间件处理单个文件上传
// upload.single("resume") 表示接收名为"resume"的单个文件字段
// 使用async/await处理异步操作，req包含请求信息，res用于发送响应
router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    // 检查是否有文件上传
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "请上传PDF简历文件",
      });
    }

    // 检查环境变量
    try {
      validateConfig();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `服务器配置错误：${error.message}`,
      });
    }

    const filePath = req.file.path;
    console.log(`处理文件: ${req.file.originalname}`);

    // 验证PDF文件
    const isValidPDF = await validatePDFFile(filePath);
    if (!isValidPDF) {
      return res.status(400).json({
        success: false,
        message: "无效的PDF文件，请检查文件格式",
      });
    }

    let analysisResult;
    let analysisMode = "file";

    try {
      // 尝试直接上传PDF文件到Coze
      const pdfBase64 = await convertPDFToBase64(filePath);
      analysisResult = await analyzeResumeWithCozeFile(pdfBase64);
      console.log("使用文件上传模式分析成功");
    } catch (fileError) {
      console.warn("文件上传模式失败，回退到文本提取模式:", fileError.message);

      // 如果文件上传失败，回退到文本提取模式
      try {
        const resumeText = await extractPDFText(filePath);
        if (!validateExtractedText(resumeText)) {
          return res.status(400).json({
            success: false,
            message: "无法从PDF中提取文本内容，请检查文件格式",
          });
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

    // 清理上传的文件
    fs.unlinkSync(filePath);

    // 返回分析结果
    res.json({
      success: true,
      message: "简历分析完成",
      data: {
        analysis: analysisResult,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        uploadTime: new Date().toISOString(),
        analysisMode: analysisMode, // 标识使用的分析模式
      },
    });
  } catch (error) {
    console.error("简历分析错误:", error);

    // 清理上传的文件（如果存在）
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "简历分析失败",
      error: error.message,
    });
  }
});

/**
 * 简历分析API端点（流式响应）- 直接上传PDF文件
 * POST /api/analyze-resume-stream
 */
router.post(
  "/analyze-resume-stream",
  upload.single("resume"),
  async (req, res) => {
    try {
      // 检查是否有文件上传
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "请上传PDF简历文件",
        });
      }

      // 检查环境变量
      try {
        validateConfig();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: `服务器配置错误：${error.message}`,
        });
      }

      const filePath = req.file.path;
      console.log(`处理文件（流式）: ${req.file.originalname}`);

      // 验证PDF文件
      const isValidPDF = await validatePDFFile(filePath);
      if (!isValidPDF) {
        return res.status(400).json({
          success: false,
          message: "无效的PDF文件，请检查文件格式",
        });
      }

      // 设置流式响应头
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let analysisMode = "file";

      try {
        // 尝试直接上传PDF文件到Coze
        const pdfBase64 = await convertPDFToBase64(filePath);
        await analyzeResumeWithCozeFileStream(pdfBase64, res);
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
            return res.status(400).json({
              success: false,
              message: "无法从PDF中提取文本内容，请检查文件格式",
            });
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

      // 清理上传的文件
      fs.unlinkSync(filePath);
      res.end();
    } catch (error) {
      console.error("流式简历分析错误:", error);

      // 清理上传的文件（如果存在）
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: "简历分析失败",
        error: error.message,
      });
    }
  }
);

export default router;
