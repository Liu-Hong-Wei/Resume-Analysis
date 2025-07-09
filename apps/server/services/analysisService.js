import { cozeClient } from "./cozeService.js";
import { configManager } from "../config/index.js";
import { upload } from "../utils/uploadConfig.js";

/**
 * 分析服务类
 */
class AnalysisService {
  constructor() {
    this.config = configManager;
    this.cozeClient = cozeClient;
  }

  /**
   * 验证分析类型
   * @param {string} analysisType - 分析类型
   * @throws {Error} 如果分析类型无效
   */
  validateAnalysisType(analysisType) {
    const validTypes = Object.values(this.config.analysisTypes);
    if (!validTypes.includes(analysisType)) {
      throw new Error(
        `无效的分析类型: ${analysisType}。有效类型: ${validTypes.join(", ")}`
      );
    }
  }

  /**
   * 创建自定义变量
   * @param {string} analysisType - 分析类型
   * @param {Object} additionalVars - 额外的自定义变量
   * @returns {Object} 自定义变量对象
   */
  createCustomVariables(analysisType, additionalVars = {}) {
    return {
      analysis_type: analysisType,
      timestamp: new Date().toISOString(),
      ...additionalVars,
    };
  }

  /**
   * 处理文件分析（流式）
   * @param {Buffer} fileBuffer - 文件Buffer
   * @param {Response} res - Express响应对象
   * @param {string} fileName - 文件名
   * @param {string} question - 问题内容（可选）
   * @param {string} analysisType - 分析类型
   * @param {Object} additionalVars - 额外的自定义变量
   * @returns {Promise<void>}
   */
  async handleFileAnalysisStream(
    fileBuffer,
    res,
    fileName,
    question,
    analysisType,
    additionalVars = {}
  ) {
    try {
      this.validateAnalysisType(analysisType);

      const customVariables = this.createCustomVariables(
        analysisType,
        additionalVars
      );

      console.log(`开始文件流式分析:`, {
        analysisType,
        fileName,
        fileSize: fileBuffer.length,
        hasQuestion: !!question,
      });

      await this.cozeClient.analyzeFileStream(
        fileBuffer,
        res,
        fileName,
        question,
        customVariables
      );
    } catch (error) {
      console.error(`文件流式分析失败 (${analysisType}):`, error);
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: `${this.config.analysisTypeDescriptions[analysisType]}失败: ${error.message}`,
        })}\n\n`
      );
      res.write("data: [DONE]\n\n");
    }
  }

  /**
   * 处理文本分析（流式）
   * @param {string} question - 问题内容
   * @param {Response} res - Express响应对象
   * @param {string} analysisType - 分析类型
   * @param {Object} additionalVars - 额外的自定义变量
   * @returns {Promise<void>}
   */
  async handleTextAnalysisStream(
    question,
    res,
    analysisType,
    additionalVars = {}
  ) {
    try {
      this.validateAnalysisType(analysisType);

      if (!question || typeof question !== "string") {
        throw new Error("问题内容无效");
      }

      const customVariables = this.createCustomVariables(
        analysisType,
        additionalVars
      );

      console.log(`开始文本流式分析:`, {
        analysisType,
        questionLength: question.length,
      });

      await this.cozeClient.analyzeTextStream(question, res, customVariables);
    } catch (error) {
      console.error(`文本流式分析失败 (${analysisType}):`, error);
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: `${this.config.analysisTypeDescriptions[analysisType]}失败: ${error.message}`,
        })}\n\n`
      );
      res.write("data: [DONE]\n\n");
    }
  }

  /**
   * 创建分析处理器
   * @param {string} analysisType - 分析类型
   * @returns {Object} 分析处理器对象
   */
  createAnalysisHandler(analysisType) {
    this.validateAnalysisType(analysisType);

    return {
      upload,
      /**
       * 处理文件分析（流式）
       */
      handleFileAnalysisStream: async (req, res) => {
        try {
          if (!req.file) {
            res.write(
              `data: ${JSON.stringify({
                type: "error",
                error: "请上传文件",
              })}\n\n`
            );
            res.write("data: [DONE]\n\n");
            return;
          }

          const { question } = req.body;
          await this.handleFileAnalysisStream(
            req.file.buffer,
            res,
            req.file.originalname,
            question,
            analysisType
          );
        } catch (error) {
          console.error(`${analysisType} 文件流式分析错误:`, error);
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              error: error.message,
            })}\n\n`
          );
          res.write("data: [DONE]\n\n");
        }
      },

      /**
       * 处理文本分析（流式）
       */
      handleQuestionAnalysisStream: async (req, res) => {
        try {
          const { question } = req.body;

          if (!question) {
            res.write(
              `data: ${JSON.stringify({
                type: "error",
                error: "请提供问题内容",
              })}\n\n`
            );
            res.write("data: [DONE]\n\n");
            return;
          }

          await this.handleTextAnalysisStream(question, res, analysisType);
        } catch (error) {
          console.error(`${analysisType} 文本流式分析错误:`, error);
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              error: error.message,
            })}\n\n`
          );
          res.write("data: [DONE]\n\n");
        }
      },
    };
  }

  /**
   * 获取分析类型信息
   * @returns {Object} 分析类型信息
   */
  getAnalysisTypesInfo() {
    return {
      success: true,
      analysis_types: this.config.analysisTypeDescriptions,
      supported_file_types: this.config.fileLimits.SUPPORTED_EXTENSIONS,
      max_file_size: this.config.fileLimits.MAX_FILE_SIZE,
    };
  }
}

// 创建分析服务实例
const analysisService = new AnalysisService();

// 导出兼容性函数（保持向后兼容）
export function createAnalysisHandler(analysisType) {
  return analysisService.createAnalysisHandler(analysisType);
}

// 导出分析服务类
export { AnalysisService, analysisService };

// 默认导出
export default analysisService;
