import express from "express";
import cors from "cors";

// 导入配置
import { SERVER_CONFIG, validateConfig } from "./config/index.js";

// 导入中间件
import { handleUploadError } from "./middleware/upload.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// 导入路由
import healthRouter from "./routes/health.js";
import resumeRouter from "./routes/resume-evaluate.js";
import chatRouter from "./routes/chat.js";

const app = express();

// 基础中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 注册路由
app.use("/health", healthRouter);
app.use("/api", resumeRouter);
app.use("/api", chatRouter);

// 错误处理中间件
app.use(handleUploadError);
app.use(errorHandler);

// 404处理
app.use("*", notFoundHandler);

// 启动服务器
app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`服务器运行在端口 ${SERVER_CONFIG.PORT}`);
  console.log(`健康检查: http://localhost:${SERVER_CONFIG.PORT}/health`);
  console.log(
    `简历分析API (非流式): http://localhost:${SERVER_CONFIG.PORT}/api/analyze-resume`
  );
  console.log(
    `简历分析API (流式): http://localhost:${SERVER_CONFIG.PORT}/api/analyze-resume-stream`
  );
  console.log(`通用聊天API: http://localhost:${SERVER_CONFIG.PORT}/api/chat`);

  // 验证配置
  try {
    validateConfig();
    console.log("✅ 配置验证通过");
  } catch (error) {
    console.error("❌ 配置验证失败:", error.message);
  }
});
