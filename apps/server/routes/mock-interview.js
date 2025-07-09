import express from "express";
import { upload } from "../utils/uploadConfig.js";
import { createAnalysisHandler } from "../services/analysisService.js";
import { ANALYSIS_TYPES } from "../config/index.js";

const router = express.Router();
const handler = createAnalysisHandler(ANALYSIS_TYPES.MOCK);

// 简化的路由，实际功能由统一路由处理
// 这些路由主要用于向后兼容

/**
 * 模拟面试API端点（非流式）- 直接上传PDF文件
 * POST /api/mock-interview
 */
router.post(
  "/mock-interview",
  upload.single("file"),
  handler.handleFileAnalysis
);

/**
 * 模拟面试API端点（流式响应）- 直接上传PDF文件
 * POST /api/mock-interview-stream
 */
router.post(
  "/mock-interview-stream",
  upload.single("file"),
  handler.handleFileAnalysisStream
);

/**
 * 模拟面试API端点（流式响应）- 只有用户提问，没有文件上传
 * POST /api/mock-interview-question-stream
 */
router.post(
  "/mock-interview-question-stream",
  handler.handleQuestionAnalysisStream
);

/**
 * 模拟面试API端点（纯文本模式）- 只有用户提问，没有文件上传
 * POST /api/mock-interview-question
 */
router.post("/mock-interview-question", handler.handleQuestionAnalysis);

export default router;
