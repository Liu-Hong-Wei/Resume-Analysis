import express from "express";
import {
  createAnalysisHandler,
} from "../services/analysisService.js";
import { ANALYSIS_TYPES } from "../config/index.js";
import { upload } from "../utils/uploadConfig.js";

const router = express.Router();

// 创建三种分析类型的处理器
const evaluateHandler = createAnalysisHandler(ANALYSIS_TYPES.EVALUATE);
const generateHandler = createAnalysisHandler(ANALYSIS_TYPES.GENERATE);
const mockHandler = createAnalysisHandler(ANALYSIS_TYPES.MOCK);

// ==================== 简历评估路由 ====================

/**
 * 简历评估API端点（非流式）- 直接上传PDF文件
 * POST /api/evaluate-resume
 */
router.post(
  "/evaluate-resume",
  evaluateHandler.upload.single("file"),
  evaluateHandler.handleFileAnalysis
);

/**
 * 简历评估API端点（流式响应）- 直接上传PDF文件
 * POST /api/evaluate-resume-stream
 */
router.post(
  "/evaluate-resume-stream",
  evaluateHandler.upload.single("file"),
  evaluateHandler.handleFileAnalysisStream
);

/**
 * 简历评估API端点（流式响应）- 只有用户提问，没有文件上传
 * POST /api/evaluate-resume-question-stream
 */
router.post(
  "/evaluate-resume-question-stream",
  evaluateHandler.handleQuestionAnalysisStream
);

/**
 * 简历评估API端点（纯文本模式）- 只有用户提问，没有文件上传
 * POST /api/evaluate-resume-question
 */
router.post(
  "/evaluate-resume-question",
  evaluateHandler.handleQuestionAnalysis
);

// ==================== 简历生成路由 ====================

/**
 * 简历生成API端点（非流式）- 直接上传PDF文件
 * POST /api/generate-resume
 */
router.post(
  "/generate-resume",
  generateHandler.upload.single("file"),
  generateHandler.handleFileAnalysis
);

/**
 * 简历生成API端点（流式响应）- 直接上传PDF文件
 * POST /api/generate-resume-stream
 */
router.post(
  "/generate-resume-stream",
  generateHandler.upload.single("file"),
  generateHandler.handleFileAnalysisStream
);

/**
 * 简历生成API端点（流式响应）- 只有用户提问，没有文件上传
 * POST /api/generate-resume-question-stream
 */
router.post(
  "/generate-resume-question-stream",
  generateHandler.handleQuestionAnalysisStream
);

/**
 * 简历生成API端点（纯文本模式）- 只有用户提问，没有文件上传
 * POST /api/generate-resume-question
 */
router.post(
  "/generate-resume-question",
  generateHandler.handleQuestionAnalysis
);

// ==================== 模拟面试路由 ====================

/**
 * 模拟面试API端点（非流式）- 直接上传PDF文件
 * POST /api/mock-interview
 */
router.post(
  "/mock-interview",
  mockHandler.upload.single("file"),
  mockHandler.handleFileAnalysis
);

/**
 * 模拟面试API端点（流式响应）- 直接上传PDF文件
 * POST /api/mock-interview-stream
 */
router.post(
  "/mock-interview-stream",
  mockHandler.upload.single("file"),
  mockHandler.handleFileAnalysisStream
);

/**
 * 模拟面试API端点（流式响应）- 只有用户提问，没有文件上传
 * POST /api/mock-interview-question-stream
 */
router.post(
  "/mock-interview-question-stream",
  mockHandler.handleQuestionAnalysisStream
);

/**
 * 模拟面试API端点（纯文本模式）- 只有用户提问，没有文件上传
 * POST /api/mock-interview-question
 */
router.post("/mock-interview-question", mockHandler.handleQuestionAnalysis);

// ==================== 通用分析路由 ====================

/**
 * 通用分析API端点 - 通过参数指定分析类型
 * POST /api/analyze
 * Body: { analysis_type: "evaluate|generate|mock", question: "问题内容" }
 * 或使用 multipart/form-data 上传文件
 */
router.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const { analysis_type } = req.body;

    if (
      !analysis_type ||
      !Object.values(ANALYSIS_TYPES).includes(analysis_type)
    ) {
      return res.status(400).json({
        error: "请提供有效的分析类型",
        valid_types: Object.values(ANALYSIS_TYPES),
      });
    }

    // 根据分析类型选择对应的处理器
    let handler;
    switch (analysis_type) {
      case ANALYSIS_TYPES.EVALUATE:
        handler = evaluateHandler;
        break;
      case ANALYSIS_TYPES.GENERATE:
        handler = generateHandler;
        break;
      case ANALYSIS_TYPES.MOCK:
        handler = mockHandler;
        break;
      default:
        return res.status(400).json({ error: "无效的分析类型" });
    }

    // 如果有文件上传，使用文件分析处理器
    if (req.file) {
      return handler.handleFileAnalysis(req, res);
    } else {
      // 否则使用问题分析处理器
      return handler.handleQuestionAnalysis(req, res);
    }
  } catch (error) {
    console.error("通用分析错误:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 通用分析API端点（流式）- 通过参数指定分析类型
 * POST /api/analyze-stream
 * Body: { analysis_type: "evaluate|generate|mock", question: "问题内容" }
 * 或使用 multipart/form-data 上传文件
 */
router.post("/analyze-stream", upload.single("file"), async (req, res) => {
  try {
    const { analysis_type } = req.body;

    if (
      !analysis_type ||
      !Object.values(ANALYSIS_TYPES).includes(analysis_type)
    ) {
      return res.status(400).json({
        error: "请提供有效的分析类型",
        valid_types: Object.values(ANALYSIS_TYPES),
      });
    }

    // 根据分析类型选择对应的处理器
    let handler;
    switch (analysis_type) {
      case ANALYSIS_TYPES.EVALUATE:
        handler = evaluateHandler;
        break;
      case ANALYSIS_TYPES.GENERATE:
        handler = generateHandler;
        break;
      case ANALYSIS_TYPES.MOCK:
        handler = mockHandler;
        break;
      default:
        return res.status(400).json({ error: "无效的分析类型" });
    }

    // 如果有文件上传，使用文件流式分析处理器
    if (req.file) {
      return handler.handleFileAnalysisStream(req, res);
    } else {
      // 否则使用问题流式分析处理器
      return handler.handleQuestionAnalysisStream(req, res);
    }
  } catch (error) {
    console.error("通用流式分析错误:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.write("data: [DONE]\n\n");
  }
});

/**
 * 获取支持的分析类型
 * GET /api/analysis-types
 */
router.get("/analysis-types", (req, res) => {
  res.json({
    success: true,
    analysis_types: {
      [ANALYSIS_TYPES.EVALUATE]: "简历评估",
      [ANALYSIS_TYPES.GENERATE]: "简历生成",
      [ANALYSIS_TYPES.MOCK]: "模拟面试",
    },
  });
});

export default router;
