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
        handler: handler.handleFileAnalysisStream,
        description: `${typeName} - 文件ID模式（流式）`,
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
    router.post("/analyze", async (req, res) => {
      try {
        const {
          analysis_type,
          conversation_id,
          user_id = "default_user",
          file_id,
          question,
        } = req.body;
        console.log("--------------------------------");
        console.log("req.body: ", req.body);
        console.log("analysis_type: ", analysis_type);
        console.log("conversation_id: ", conversation_id);
        console.log("file_id: ", file_id);
        console.log("question: ", question);
        console.log("--------------------------------");

        if (!analysis_type) {
          return res.status(400).json({
            error: "缺少必需参数: analysis_type",
            timestamp: new Date().toISOString(),
          });
        }

        const handler =
          this.analysisService.createAnalysisHandler(analysis_type);

        // 只支持流式分析
        if (file_id) {
          console.log("进入文件ID模式");
          // 文件ID模式（流式）
          await handler.handleFileAnalysisStream(req, res);
        } else {
          console.log("进入文本模式");
          // 文本模式（流式）
          await handler.handleQuestionAnalysisStream(req, res);
        }
      } catch (error) {
        console.error("统一分析接口错误:", error);

        if (!res.headersSent) {
          res.status(500).json({
            error: "分析失败",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
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

    // 获取对话详情
    router.get("/conversations/retrieve", async (req, res) => {
      const { conversation_id } = req.query;
      const conversation =
        await this.analysisService.getConversationDetail(conversation_id);
      res.json(conversation);
    });

    // 获取用户对话列表
    router.post("/conversations", async (req, res) => {
      try {
        const { user_id, order = "desc", session_name } = req.body;

        if (!user_id) {
          return res.status(400).json({
            error: "缺少必需参数: user_id",
            timestamp: new Date().toISOString(),
          });
        }

        console.log("获取用户对话列表:", { user_id, order, session_name });

        // 调用Coze API获取对话列表，使用会话隔离
        const conversations = await this.analysisService.getUserConversations(
          user_id,
          {
            order,
          },
          session_name
        );

        res.json({
          success: true,
          data: conversations,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("获取用户对话列表失败:", error);
        res.status(500).json({
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // 获取对话消息列表
    router.post("/conversations/:conversationId/messages", async (req, res) => {
      try {
        const { conversationId } = req.params;
        const {
          limit,
          order = "asc",
          chat_id,
          before_id,
          user_id,
          session_name,
        } = req.body;

        if (!conversationId) {
          return res.status(400).json({
            error: "缺少必需参数: conversationId",
            timestamp: new Date().toISOString(),
          });
        }

        console.log("获取对话消息:", {
          conversationId,
          limit,
          order,
          chat_id,
          before_id,
          user_id,
          session_name,
        });

        // 调用Coze API获取消息列表，使用会话隔离
        const messages = await this.analysisService.getConversationMessages(
          conversationId,
          {
            limit,
            order,
            chat_id,
            before_id,
          },
          user_id,
          session_name
        );

        res.json({
          success: true,
          ...messages,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("获取对话消息失败:", error);
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
   * 创建统一路由
   * @param {express.Router} router - Express 路由对象
   */
  createUnifiedRoutes(router) {
    // 获取所有分析类型
    const analysisTypes = Object.keys(this.config.analysisTypeDescriptions);

    // 为每种分析类型创建专用路由
    analysisTypes.forEach((analysisType) => {
      const routes = this.createAnalysisRoutes(analysisType);

      Object.entries(routes).forEach(([path, routeConfig]) => {
        const fullPath = `/analysis${path}`;

        console.log(
          `注册路由: ${routeConfig.method} ${fullPath} - ${routeConfig.description}`
        );

        router[routeConfig.method.toLowerCase()](fullPath, routeConfig.handler);
      });
    });
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
