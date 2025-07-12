import dotenv from "dotenv";


// 加载环境变量
dotenv.config();

/**
 * 配置管理类
 */
class ConfigManager {
  constructor() {
    this.validateEnvironment();
  }

  /**
   * 验证环境变量
   * @throws {Error} 如果缺少必要的环境变量
   */
  validateEnvironment() {
    const requiredEnvVars = [
      { key: "COZE_API_KEY", name: "Coze API 密钥" },
      { key: "COZE_BOT_ID", name: "Coze Bot ID" },
    ];

    const missingVars = requiredEnvVars.filter(({ key }) => !process.env[key]);

    if (missingVars.length > 0) {
      const missingNames = missingVars.map(({ name }) => name).join(", ");
      throw new Error(`缺少必要的环境变量: ${missingNames}`);
    }
  }

  /**
   * 获取服务器配置
   * @returns {Object} 服务器配置对象
   */
  get server() {
    return {
      PORT: parseInt(process.env.PORT) || 3000,
      MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
      NODE_ENV: process.env.NODE_ENV || "development",
      CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
      API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3000/api",
      version: "1.0.0",
    };
  }

  /**
   * 获取 Coze API 配置
   * @returns {Object} Coze API 配置对象
   */
  get coze() {
    return {
      API_KEY: process.env.COZE_API_KEY,
      BOT_ID: process.env.COZE_BOT_ID,
      BASE_URL: "https://api.coze.cn",
      API_URL: "https://api.coze.cn/v1/conversation/create",
      CHAT_URL: "https://api.coze.cn/v3/chat",
      STREAM_URL: "https://api.coze.cn/v3/chat",
      MAX_TEXT_LENGTH: 8000,
      DEFAULT_PARAMS: {
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
        presence_penalty: 0.0,
        frequency_penalty: 0.0,
      },
    };
  }

  /**
   * 获取文件限制配置
   * @returns {Object} 文件限制配置对象
   */
  get fileLimits() {
    return {
      MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB (根据 Coze 文档)
      SUPPORTED_TYPES: [
        // PDF文档
        "application/pdf",
        // 图片格式
        "image/jpeg",
        "image/jpg", // 某些浏览器可能使用这个（非标准但常见）
        "image/png",
        // 文本格式
        "text/plain",
      ],
      SUPPORTED_EXTENSIONS: [
        ".pdf", 
        ".jpg", ".jpeg", ".png",
        ".txt"
      ],
      // MIME类型映射 - 用于根据扩展名推断MIME类型
      MIME_TYPE_MAP: {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg", 
        ".png": "image/png",
        ".txt": "text/plain",
      },
    };
  }

  /**
   * 获取分析类型配置
   * @returns {Object} 分析类型配置对象
   */
  get analysisTypes() {
    return {
      EVALUATE: "evaluate",
      GENERATE: "generate",
      MOCK: "mock",
    };
  }

  /**
   * 获取分析类型描述
   * @returns {Object} 分析类型描述对象
   */
  get analysisTypeDescriptions() {
    return {
      [this.analysisTypes.EVALUATE]: "简历评估",
      [this.analysisTypes.GENERATE]: "简历生成",
      [this.analysisTypes.MOCK]: "模拟面试",
    };
  }

  /**
   * 获取所有配置
   * @returns {Object} 完整配置对象
   */
  get all() {
    return {
      server: this.server,
      coze: this.coze,
      fileLimits: this.fileLimits,
      analysisTypes: this.analysisTypes,
      analysisTypeDescriptions: this.analysisTypeDescriptions,
    };
  }

  /**
   * 验证配置完整性
   * @returns {boolean} 配置是否有效
   */
  validate() {
    try {
      this.validateEnvironment();

      // 验证 Coze 配置
      if (!this.coze.API_KEY || !this.coze.BOT_ID) {
        throw new Error("Coze API 配置不完整");
      }

      // 验证服务器配置
      if (this.server.PORT < 1 || this.server.PORT > 65535) {
        throw new Error("服务器端口配置无效");
      }

      return true;
    } catch (error) {
      console.error("配置验证失败:", error.message);
      return false;
    }
  }

  /**
   * 获取配置摘要（用于日志记录）
   * @returns {Object} 配置摘要对象
   */
  getSummary() {
    return {
      server: {
        port: this.server.PORT,
        environment: this.server.NODE_ENV,
        maxFileSize: this.server.MAX_FILE_SIZE,
      },
      coze: {
        hasApiKey: !!this.coze.API_KEY,
        hasBotId: !!this.coze.BOT_ID,
        baseUrl: this.coze.BASE_URL,
        maxTextLength: this.coze.MAX_TEXT_LENGTH,
      },
      fileLimits: {
        maxFileSize: this.fileLimits.MAX_FILE_SIZE,
        supportedTypes: this.fileLimits.SUPPORTED_TYPES.length,
      },
      analysisTypes: Object.keys(this.analysisTypes).length,
    };
  }
}

// 创建配置管理器实例
const configManager = new ConfigManager();

// 导出配置管理器
export { ConfigManager, configManager };

// 导出兼容性配置对象（保持向后兼容）
export const SERVER_CONFIG = configManager.server;
export const COZE_CONFIG = configManager.coze;
export const COZE_FILE_LIMITS = configManager.fileLimits;
export const ANALYSIS_TYPES = configManager.analysisTypes;

// 导出验证函数（保持向后兼容）
export function validateConfig() {
  return configManager.validate();
}

// 默认导出配置管理器
export default configManager;
