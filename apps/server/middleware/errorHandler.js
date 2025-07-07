/**
 * 全局错误处理中间件
 * @param {Error} error - 错误对象
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
export function errorHandler(error, req, res, next) {
  console.error("服务器错误:", error);

  // 处理已知错误类型
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "数据验证失败",
      error: error.message,
    });
  }

  if (error.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      message: "未授权访问",
      error: error.message,
    });
  }

  // 默认错误响应
  res.status(500).json({
    success: false,
    message: "服务器内部错误",
    error:
      process.env.NODE_ENV === "development" ? error.message : "内部服务器错误",
  });
}

/**
 * 404错误处理中间件
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: "接口不存在",
    path: req.originalUrl,
    method: req.method,
  });
}
