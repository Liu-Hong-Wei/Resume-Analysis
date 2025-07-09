import express from "express";
import { analysisService } from "../services/analysisService.js";
import { configManager } from "../config/index.js";

const router = express.Router();

/**
 * 路由管理器类
 */
class RouteManager {
  constructor() {
    this.config = configManager;
    this.analysisService = analysisService;
  }

  /**
   * 创建特定分析类型的路由
   * @param {string} analysisType - 分析类型
   * @returns {Object} 路由处理器对象
   */
  createAnalysisRoutes(analysisType) {
    const handler = this.analysisService.createAnalysisHandler(analysisType);
    const typeName = this.config.analysisTypeDescriptions[analysisType];

    return {
      // 文件分析（流式）
      [`/${analysisType}-resume-stream`]: {
        method: "POST",
        middleware: [handler.upload.single("file")],
        handler: handler.handleFileAnalysisStream,
        description: `${typeName} - 文件上传模式（流式）`,
      },

      // 文本分析（流式）
      [`/${analysisType}-resume-question-stream`]: {
        method: "POST",
        handler: handler.handleQuestionAnalysisStream,
        description: `${typeName} - 文本模式（流式）`,
      },
    };
  }

  /**
   * 注册所有分析路由
   * @param {express.Router} router - Express 路由对象
   */
  registerAnalysisRoutes(router) {
    router.post("/analyze", (req, res) => {
      const { analysis_type } = req.body;
      const handler = this.analysisService.createAnalysisHandler(analysis_type);
      handler.handleFileAnalysis(req, res);
      // TODO: 这里需要添加流式分析的逻辑

    });

    // 获取分析类型信息
    router.get("/analysis-types", (req, res) => {
      try {
        const info = this.analysisService.getAnalysisTypesInfo();
        res.json(info);
      } catch (error) {
        console.error("获取分析类型信息失败:", error);
        res.status(500).json({
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // 健康检查
    router.get("/health", (req, res) => {
      try {
        const healthInfo = {
          status: "ok",
          message: "服务器运行正常",
          timestamp: new Date().toISOString(),
          config: this.config.getSummary(),
        };
        res.json(healthInfo);
      } catch (error) {
        console.error("健康检查失败:", error);
        res.status(500).json({
          status: "error",
          message: "服务器运行异常",
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return router;
  }

  /**
   * 设置路由中间件
   * @param {express.Router} router - Express 路由对象
   */
  setupMiddleware(router) {
    // 请求日志中间件
    router.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // 错误处理中间件
    router.use((error, req, res, next) => {
      console.error("路由错误:", error);

      if (res.headersSent) {
        return next(error);
      }

      res.status(500).json({
        error: "服务器内部错误",
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    });
  }
}

// 创建路由管理器实例
const routeManager = new RouteManager();

// 设置路由中间件
routeManager.setupMiddleware(router);

// 注册所有分析路由
routeManager.registerAnalysisRoutes(router);

// 创建通用路由
routeManager.createUnifiedRoutes(router);

// 导出路由管理器类
export { RouteManager, routeManager };

// 默认导出路由
export default router;
