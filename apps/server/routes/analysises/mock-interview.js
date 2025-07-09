import express from "express";
import { upload } from "../../utils/uploadConfig.js";
import { createAnalysisHandler } from "../../services/analysisService.js";
import { ANALYSIS_TYPES } from "../../config/index.js";

const router = express.Router();
const handler = createAnalysisHandler(ANALYSIS_TYPES.MOCK);

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

export default router;
