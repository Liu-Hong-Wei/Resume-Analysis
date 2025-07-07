import express from "express";

const router = express.Router();

/**
 * 健康检查端点
 * GET /health
 */
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "服务器运行正常",
    timestamp: new Date().toISOString(),
  });
});

export default router;
