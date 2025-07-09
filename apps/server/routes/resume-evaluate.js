import express from "express";
import { upload, handleUploadError } from "../middleware/upload.js";
import { ResumeAnalysisService } from "../services/resumeAnalysisService.js";
import { FileUtils } from "../utils/fileUtils.js";
import { ErrorUtils } from "../utils/errorUtils.js";

const router = express.Router();

/**
 * 简历分析API端点（非流式）- 直接上传PDF文件
 * POST /api/analyze-resume
 */
router.post(
  "/analyze-resume",
  upload.single("resume"),
  handleUploadError,
  async (req, res) => {
    let filePath = null;

    try {
      // 验证上传的文件
      const validation = await ResumeAnalysisService.validateUploadedFile(req);
      if (!validation.isValid) {
        return res.status(validation.error.status).json(
          ErrorUtils.createErrorResponse(
            validation.error.status,
            validation.error.message
          )
        );
      }
      filePath = validation.filePath;

      // 分析简历
      const result = await ResumeAnalysisService.analyzeResume(
        filePath,
        req.file.originalname,
        req.file.size
      );

      // 发送响应后再清理文件
      res.json(result);

      // 延迟清理文件，确保响应已发送
      FileUtils.cleanupFileWithDelay(filePath);
    } catch (error) {
      ErrorUtils.handleAnalysisError(error, res, filePath, FileUtils.cleanupFile);
    }
  }
);

/**
 * 简历分析API端点（流式响应）- 直接上传PDF文件
 * POST /api/analyze-resume-stream
 */
router.post(
  "/analyze-resume-stream",
  upload.single("resume"),
  handleUploadError,
  async (req, res) => {
    let filePath = null;

    try {
      // 验证上传的文件
      const validation = await ResumeAnalysisService.validateUploadedFile(req);
      if (!validation.isValid) {
        return res.status(validation.error.status).json(
          ErrorUtils.createErrorResponse(
            validation.error.status,
            validation.error.message
          )
        );
      }
      filePath = validation.filePath;

      // 设置流式响应头
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // 流式分析简历
      await ResumeAnalysisService.analyzeResumeStream(
        filePath,
        res,
        req.file.originalname
      );

      // 流式响应结束后清理文件
      res.on("finish", () => {
        FileUtils.cleanupFile(filePath);
      });

      res.end();
    } catch (error) {
      ErrorUtils.handleStreamAnalysisError(
        error,
        res,
        filePath,
        FileUtils.cleanupFile
      );
    }
  }
);

export default router;
