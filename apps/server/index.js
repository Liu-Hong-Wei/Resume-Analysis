import express from "express";
import cors from "cors";

// 导入配置和服务
import { configManager } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// 导入路由
import healthRouter from "./routes/health.js";
import unifiedAnalysisRouter from "./routes/unified-analysis.js";
import resumeRouter from "./routes/analysises/resume-evaluate.js";
import mockRouter from "./routes/analysises/mock-interview.js";
import generateRouter from "./routes/analysises/resume-generate.js";

/**
 * 服务器应用类
 */
class Server {
  constructor() {
    this.app = express();
    this.config = configManager;
    this.server = null;
  }

  /**
   * 初始化中间件
   */
  initializeMiddleware() {
    // CORS 配置
    this.app.use(
      cors({
        origin: this.config.server.CORS_ORIGIN,
        credentials: true,
      })
    );

    // 请求体解析
    this.app.use(express.json({ limit: this.config.server.MAX_FILE_SIZE }));
    this.app.use(
      express.urlencoded({
        extended: true,
        limit: this.config.server.MAX_FILE_SIZE,
      })
    );

    // 请求日志中间件
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
          `${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
        );
      });
      next();
    });
  }

  /**
   * 注册路由
   */
  registerRoutes() {
    // 健康检查路由
    this.app.use("/health", healthRouter);

    // 主要使用统一分析路由
    this.app.use("/api", unifiedAnalysisRouter);

    // 保留其他路由用于向后兼容
    this.app.use("/api", resumeRouter);
    this.app.use("/api", mockRouter);
    this.app.use("/api", generateRouter);
  }

  /**
   * 设置错误处理
   */
  setupErrorHandling() {
    // 错误处理中间件
    this.app.use(errorHandler);

    // 404 处理
    this.app.use("*", notFoundHandler);

    // 全局错误处理
    this.app.use((error, req, res, next) => {
      console.error("未处理的错误:", error);

      if (res.headersSent) {
        return next(error);
      }

      res.status(500).json({
        error: "服务器内部错误",
        message:
          this.config.server.NODE_ENV === "development"
            ? error.message
            : "请稍后重试",
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * 验证配置
   * @returns {boolean} 配置是否有效
   */
  validateConfiguration() {
    try {
      const isValid = this.config.validate();
      if (!isValid) {
        throw new Error("配置验证失败");
      }
      return true;
    } catch (error) {
      console.error("❌ 配置验证失败:", error.message);
      return false;
    }
  }

  /**
   * 启动服务器
   * @returns {Promise<void>}
   */
  async start() {
    try {
      // 验证配置
      if (!this.validateConfiguration()) {
        throw new Error("配置验证失败，无法启动服务器");
      }

      // 初始化中间件
      this.initializeMiddleware();

      // 注册路由
      this.registerRoutes();

      // 设置错误处理
      this.setupErrorHandling();

      // 启动服务器
      return new Promise((resolve, reject) => {
        this.server = this.app.listen(this.config.server.PORT, () => {
          this.logStartupInfo();
          resolve();
        });

        this.server.on("error", (error) => {
          console.error("服务器启动失败:", error);
          reject(error);
        });
      });
    } catch (error) {
      console.error("服务器初始化失败:", error);
      throw error;
    }
  }

  /**
   * 停止服务器
   * @returns {Promise<void>}
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log("服务器已停止");
          resolve();
        });
      });
    }
  }

  /**
   * 记录启动信息
   */
  logStartupInfo() {
    const { PORT, NODE_ENV } = this.config.server;
    const baseUrl = `http://localhost:${PORT}`;

    console.log("🚀 服务器启动成功");
    console.log("=".repeat(50));
    console.log(`📊 环境: ${NODE_ENV}`);
    console.log(`🌐 端口: ${PORT}`);
    console.log(`🔗 基础URL: ${baseUrl}`);
    console.log("=".repeat(50));
    console.log("📋 API 端点:");
    console.log(`  健康检查: ${baseUrl}/health`);
    console.log(`  分析类型: ${baseUrl}/api/analysis-types`);
    console.log(`  统一分析: ${baseUrl}/api/analyze`);
    console.log(`  流式分析: ${baseUrl}/api/analyze-stream`);
    console.log("=".repeat(50));
    console.log("✅ 配置验证通过");
    console.log("🎯 服务器运行正常");
  }

  /**
   * 获取服务器信息
   * @returns {Object} 服务器信息
   */
  getServerInfo() {
    return {
      port: this.config.server.PORT,
      environment: this.config.server.NODE_ENV,
      config: this.config.getSummary(),
      uptime: this.server ? process.uptime() : 0,
    };
  }
}

// 创建服务器实例
const server = new Server();

// 优雅关闭处理
process.on("SIGTERM", async () => {
  console.log("收到 SIGTERM 信号，正在关闭服务器...");
  await server.stop();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("收到 SIGINT 信号，正在关闭服务器...");
  await server.stop();
  process.exit(0);
});

// 未捕获异常处理
process.on("uncaughtException", (error) => {
  console.error("未捕获的异常:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("未处理的 Promise 拒绝:", reason);
  process.exit(1);
});

// 启动服务器
server.start().catch((error) => {
  console.error("服务器启动失败:", error);
  process.exit(1);
});

// 导出服务器类
export { Server, server };

// 默认导出
export default server;
