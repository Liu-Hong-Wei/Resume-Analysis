import express from "express";
import { upload } from "../../utils/uploadConfig.js";
import { createAnalysisHandler } from "../../services/analysisService.js";
import { ANALYSIS_TYPES } from "../../config/index.js";

const router = express.Router();
const handler = createAnalysisHandler(ANALYSIS_TYPES.GENERATE);

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

export default router;
