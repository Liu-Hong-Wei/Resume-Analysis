import {
  analyzeResumeWithCoze,
  analyzeResumeWithCozeFile,
  analyzeResumeWithCozeStream,
  analyzeResumeWithCozeFileStream,
} from "./cozeService.js";
import { ANALYSIS_TYPES } from "../config/index.js";
import { upload } from "../utils/uploadConfig.js";

/**
 * 创建分析路由处理器
 * @param {string} analysisType - 分析类型 (evaluate, generate, mock)
 * @returns {Object} 路由处理器对象
 */
export function createAnalysisHandler(analysisType) {
  // 验证分析类型
  if (!Object.values(ANALYSIS_TYPES).includes(analysisType)) {
    throw new Error(`无效的分析类型: ${analysisType}`);
  }

  const customVariables = {
    analysis_type: analysisType,
  };

  /**
   * 非流式分析 - 文件上传模式
   */
  const handleFileAnalysis = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "请上传PDF文件" });
      }

      const { question } = req.body;

      const result = await analyzeResumeWithCozeFile(
        req.file.buffer,
        req.file.originalname,
        question,
        customVariables
      );

      res.json({
        success: true,
        result,
        analysis_type: analysisType,
      });
    } catch (error) {
      console.error(`${analysisType} 分析错误:`, error);
      res.status(500).json({
        error: error.message,
        analysis_type: analysisType,
      });
    }
  };

  /**
   * 流式分析 - 文件上传模式
   */
  const handleFileAnalysisStream = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "请上传PDF文件" });
      }

      const { question } = req.body;

      await analyzeResumeWithCozeFileStream(
        req.file.buffer,
        res,
        req.file.originalname,
        question,
        customVariables
      );
    } catch (error) {
      console.error(`${analysisType} 流式分析错误:`, error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.write("data: [DONE]\n\n");
    }
  };

  /**
   * 流式分析 - 纯文本模式
   */
  const handleQuestionAnalysisStream = async (req, res) => {
    try {
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({ error: "请提供问题内容" });
      }

      await analyzeResumeWithCozeStream(question, res, customVariables);
    } catch (error) {
      console.error(`${analysisType} 问题流式分析错误:`, error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.write("data: [DONE]\n\n");
    }
  };

  /**
   * 非流式分析 - 纯文本模式
   */
  const handleQuestionAnalysis = async (req, res) => {
    try {
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({ error: "请提供问题内容" });
      }

      const result = await analyzeResumeWithCoze(question, customVariables);

      res.json({
        success: true,
        result,
        analysis_type: analysisType,
      });
    } catch (error) {
      console.error(`${analysisType} 问题分析错误:`, error);
      res.status(500).json({
        error: error.message,
        analysis_type: analysisType,
      });
    }
  };

  return {
    upload,
    handleFileAnalysis,
    handleFileAnalysisStream,
    handleQuestionAnalysisStream,
    handleQuestionAnalysis,
    analysisType,
  };
}

/**
 * 创建完整的分析路由
 * @param {string} analysisType - 分析类型
 * @param {string} basePath - 基础路径
 * @returns {Object} Express路由对象
 */
export function createAnalysisRouter(analysisType, basePath = "") {
  const express = require("express");
  const router = express.Router();
  const handler = createAnalysisHandler(analysisType);

  // 文件上传模式 - 非流式
  router.post(
    `${basePath}`,
    handler.upload.single("file"),
    handler.handleFileAnalysis
  );

  // 文件上传模式 - 流式
  router.post(
    `${basePath}-stream`,
    handler.upload.single("file"),
    handler.handleFileAnalysisStream
  );

  // 纯文本模式 - 流式
  router.post(
    `${basePath}-question-stream`,
    handler.handleQuestionAnalysisStream
  );

  // 纯文本模式 - 非流式
  router.post(`${basePath}-question`, handler.handleQuestionAnalysis);

  return router;
}

/**
 * 获取分析类型的中文名称
 * @param {string} analysisType - 分析类型
 * @returns {string} 中文名称
 */
export function getAnalysisTypeName(analysisType) {
  const typeNames = {
    [ANALYSIS_TYPES.EVALUATE]: "简历评估",
    [ANALYSIS_TYPES.GENERATE]: "简历生成",
    [ANALYSIS_TYPES.MOCK]: "模拟面试",
  };
  return typeNames[analysisType] || "未知类型";
}

/**
 * 验证分析类型
 * @param {string} analysisType - 分析类型
 * @returns {boolean} 是否有效
 */
export function isValidAnalysisType(analysisType) {
  return Object.values(ANALYSIS_TYPES).includes(analysisType);
}
