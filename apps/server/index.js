import express from "express";
import cors from "cors";

// 导入配置
import { SERVER_CONFIG, validateConfig } from "./config/index.js";

// 导入中间件
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// 导入路由
import healthRouter from "./routes/health.js";
import unifiedAnalysisRouter from "./routes/unified-analysis.js";
import resumeRouter from "./routes/resume-evaluate.js";
import mockRouter from "./routes/mock-interview.js";
import generateRouter from "./routes/resume-generate.js";

const app = express();

// 基础中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 注册路由
app.use("/health", healthRouter);
// 主要使用统一分析路由
app.use("/api", unifiedAnalysisRouter);
// 保留其他路由用于向后兼容
app.use("/api", resumeRouter);
app.use("/api", mockRouter);
app.use("/api", generateRouter);

// 错误处理中间件
app.use(errorHandler);

// 404处理
app.use("*", notFoundHandler);

// 启动服务器
app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`服务器运行在端口 ${SERVER_CONFIG.PORT}`);
  console.log(`健康检查: http://localhost:${SERVER_CONFIG.PORT}/health`);
  console.log(
    `统一分析API: http://localhost:${SERVER_CONFIG.PORT}/api/analyze`
  );
  console.log(
    `统一分析API (流式): http://localhost:${SERVER_CONFIG.PORT}/api/analyze-stream`
  );
  console.log(
    `分析类型查询: http://localhost:${SERVER_CONFIG.PORT}/api/analysis-types`
  );
  console.log(
    `简历分析API (非流式): http://localhost:${SERVER_CONFIG.PORT}/api/analyze-resume`
  );
  console.log(
    `简历分析API (流式): http://localhost:${SERVER_CONFIG.PORT}/api/analyze-resume-stream`
  );
  // 验证配置
  try {
    validateConfig();
    console.log("✅ 配置验证通过");
  } catch (error) {
    console.error("❌ 配置验证失败:", error.message);
  }
});
