import fs from "fs";

/**
 * 文件操作工具类
 */
export class FileUtils {
  /**
   * 清理文件
   * @param {string} filePath - 文件路径
   */
  static cleanupFile(filePath) {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`已清理文件: ${filePath}`);
      } catch (error) {
        console.error(`清理文件失败: ${filePath}`, error);
      }
    }
  }

  /**
   * 延迟清理文件
   * @param {string} filePath - 文件路径
   * @param {number} delay - 延迟时间（毫秒），默认1000ms
   */
  static cleanupFileWithDelay(filePath, delay = 1000) {
    setTimeout(() => this.cleanupFile(filePath), delay);
  }

  /**
   * 检查文件是否存在
   * @param {string} filePath - 文件路径
   * @returns {boolean} 文件是否存在
   */
  static fileExists(filePath) {
    return filePath && fs.existsSync(filePath);
  }

  /**
   * 获取文件信息
   * @param {string} filePath - 文件路径
   * @returns {Object|null} 文件信息对象，如果文件不存在则返回null
   */
  static getFileInfo(filePath) {
    if (!this.fileExists(filePath)) {
      return null;
    }

    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      console.error(`获取文件信息失败: ${filePath}`, error);
      return null;
    }
  }
}
