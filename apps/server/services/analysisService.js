import { cozeClient } from "./cozeService.js";
import { configManager } from "../config/index.js";

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
   * @param {string} fileId - 文件ID
   * @param {Response} res - Express响应对象
   * @param {string} question - 问题内容（可选）
   * @param {string} analysisType - 分析类型
   * @param {Object} additionalVars - 额外的自定义变量
   * @returns {Promise<void>}
   */
  async handleFileAnalysisStream(
    fileId,
    res,
    question,
    analysisType,
    additionalVars = {}
  ) {
    try {
      this.validateAnalysisType(analysisType);

      const customVariables = this.createCustomVariables(analysisType, {
        ...additionalVars,
      });

      console.log(`开始文件流式分析:`, {
        analysisType,
        fileId,
        hasQuestion: !!question,
      });

      await this.cozeClient.analyzeFileWithIdStream(
        fileId,
        res,
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
      console.log("handleTextAnalysisStream 开始执行");
      console.log("参数:", { question, analysisType, additionalVars });

      this.validateAnalysisType(analysisType);
      console.log("分析类型验证通过");

      if (!question || typeof question !== "string") {
        throw new Error("问题内容无效");
      }

      const customVariables = this.createCustomVariables(
        analysisType,
        additionalVars
      );
      console.log("自定义变量创建完成:", customVariables);

      console.log(`开始文本流式分析:`, {
        analysisType,
        questionLength: question.length,
      });

      console.log("调用 cozeClient.analyzeTextStream");
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
   * 获取用户对话列表
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 对话列表
   */
  async getUserConversations(userId, options = {}) {
    try {
      console.log("获取用户对话列表:", { userId, options });

      // 调用Coze API获取对话列表
      const conversations = await this.cozeClient.getUserConversations(
        userId,
        options
      );

      return conversations;
    } catch (error) {
      console.error("获取用户对话列表失败:", error);
      throw error;
    }
  }

  /**
   * 获取对话消息列表
   * @param {string} conversationId - 对话ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 消息列表和分页信息
   */
  async getConversationMessages(conversationId, options = {}) {
    try {
      console.log("获取对话消息:", { conversationId, options });

      // 调用Coze API获取消息列表
      const messages = await this.cozeClient.getConversationMessages(
        conversationId,
        options
      );

      return messages;
    } catch (error) {
      console.error("获取对话消息失败:", error);
      throw error;
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
      /**
       * 处理文件分析（流式）
       */
      handleFileAnalysisStream: async (req, res) => {
        try {
          // 首先设置流式响应头
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
          });

          const {
            file_id,
            question,
            conversation_id,
            user_id = "default_user",
          } = req.body;

          if (!file_id) {
            throw new Error("缺少必需参数: file_id");
          }

          if (conversation_id) {
            console.log("conversation_id 存在，使用现有对话");
            await this.handleFileAnalysisStream(
              file_id,
              res,
              question,
              analysisType,
              { conversation_id, user_id }
            );
          } else {
            console.log("conversation_id 不存在，创建新对话");
            await this.handleFileAnalysisStream(
              file_id,
              res,
              question,
              analysisType,
              { user_id }
            );
          }
        } catch (error) {
          console.error(`${analysisType} 文件流式分析错误:`, error);
          // 如果还没有设置响应头，先设置
          if (!res.headersSent) {
            res.writeHead(200, {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Cache-Control",
            });
          }
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
          console.log("handleQuestionAnalysisStream 开始执行");
          const {
            question,
            conversation_id,
            user_id = "default_user",
          } = req.body;
          console.log("从 req.body 获取的 question:", question);
          console.log("从 req.body 获取的 conversation_id:", conversation_id);
          console.log("从 req.body 获取的 user_id:", user_id);

          // 首先设置流式响应头
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
          });

          if (!question) {
            console.log("question 为空，返回错误");
            res.write(
              `data: ${JSON.stringify({
                type: "error",
                error: "请提供问题内容",
              })}\n\n`
            );
            res.write("data: [DONE]\n\n");
            return;
          }

          if (conversation_id) {
            console.log("conversation_id 存在，使用现有对话");
            await this.handleTextAnalysisStream(question, res, analysisType, {
              conversation_id,
              user_id,
            });
          } else {
            console.log("conversation_id 不存在，创建新对话");
            await this.handleTextAnalysisStream(question, res, analysisType, {
              user_id,
            });
          }
        } catch (error) {
          console.error(`${analysisType} 文本流式分析错误:`, error);
          // 如果还没有设置响应头，先设置
          if (!res.headersSent) {
            res.writeHead(200, {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Cache-Control",
            });
          }
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
