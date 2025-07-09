import express from "express";
import { upload } from "../utils/uploadConfig.js";
import { createAnalysisHandler } from "../services/analysisService.js";
import { ANALYSIS_TYPES } from "../config/index.js";

const router = express.Router();
const handler = createAnalysisHandler(ANALYSIS_TYPES.GENERATE);

// 简化的路由，实际功能由统一路由处理
// 这些路由主要用于向后兼容

/**
 * 简历生成API端点（非流式）- 直接上传PDF文件
 * POST /api/resume-generate
 */
router.post(
  "/resume-generate",
  upload.single("file"),
  handler.handleFileAnalysis
);

/**
 * 简历生成API端点（流式响应）- 直接上传PDF文件
 * POST /api/resume-generate-stream
 */
router.post(
  "/resume-generate-stream",
  upload.single("file"),
  handler.handleFileAnalysisStream
);

/**
 * 简历生成API端点（流式响应）- 只有用户提问，没有文件上传
 * POST /api/resume-generate-question-stream
 */
router.post(
  "/resume-generate-question-stream",
  handler.handleQuestionAnalysisStream
);

/**
 * 简历生成API端点（纯文本模式）- 只有用户提问，没有文件上传
 * POST /api/resume-generate-question
 */
router.post("/resume-generate-question", handler.handleQuestionAnalysis);

export default router;
