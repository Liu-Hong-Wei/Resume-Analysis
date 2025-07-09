/**
 * 错误处理工具类
 */
export class ErrorUtils {
  /**
   * 创建标准错误响应
   * @param {number} status - HTTP状态码
   * @param {string} message - 错误消息
   * @param {string} [error] - 详细错误信息
   * @returns {Object} 标准错误响应对象
   */
  static createErrorResponse(status, message, error = null) {
    const response = {
      success: false,
      message: message,
    };

    if (error) {
      response.error = error;
    }

    return response;
  }

  /**
   * 处理简历分析错误
   * @param {Error} error - 错误对象
   * @param {Object} res - Express响应对象
   * @param {string} filePath - 文件路径（用于清理）
   * @param {Function} cleanupFunction - 清理函数
   */
  static handleAnalysisError(error, res, filePath, cleanupFunction) {
    console.error("简历分析错误:", error);

    // 清理上传的文件
    if (cleanupFunction && filePath) {
      cleanupFunction(filePath);
    }

    // 如果响应还没有发送，发送错误响应
    if (!res.headersSent) {
      res
        .status(500)
        .json(this.createErrorResponse(500, "简历分析失败", error.message));
    }
  }

  /**
   * 处理流式分析错误
   * @param {Error} error - 错误对象
   * @param {Object} res - Express响应对象
   * @param {string} filePath - 文件路径（用于清理）
   * @param {Function} cleanupFunction - 清理函数
   */
  static handleStreamAnalysisError(error, res, filePath, cleanupFunction) {
    console.error("流式简历分析错误:", error);

    // 清理上传的文件
    if (cleanupFunction && filePath) {
      cleanupFunction(filePath);
    }

    // 如果响应还没有发送，发送错误响应
    if (!res.headersSent) {
      res
        .status(500)
        .json(this.createErrorResponse(500, "简历分析失败", error.message));
    }
  }

  /**
   * 检查是否为可恢复的错误
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否为可恢复的错误
   */
  static isRecoverableError(error) {
    // 定义可恢复的错误类型
    const recoverableErrors = [
      "ENOTFOUND",
      "ECONNRESET",
      "ETIMEDOUT",
      "ECONNREFUSED",
      "NETWORK_ERROR",
    ];

    return recoverableErrors.some((errorType) =>
      error.message.includes(errorType)
    );
  }

  /**
   * 获取错误类型
   * @param {Error} error - 错误对象
   * @returns {string} 错误类型
   */
  static getErrorType(error) {
    if (error.name === "ValidationError") {
      return "VALIDATION_ERROR";
    } else if (error.name === "NetworkError") {
      return "NETWORK_ERROR";
    } else if (error.name === "FileError") {
      return "FILE_ERROR";
    } else {
      return "UNKNOWN_ERROR";
    }
  }
}
