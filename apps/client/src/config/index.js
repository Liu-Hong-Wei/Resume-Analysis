/**
 * 前端配置管理
 * 使用 Vite 的环境变量系统
 */
class ClientConfig {
  constructor() {
    this.validateEnvironment();
  }

  /**
   * 验证环境变量
   */
  validateEnvironment() {
    // 在开发环境中，使用 Vite 代理，所以 API_BASE_URL 可以为空
    if (import.meta.env.MODE === "development") {
      console.log("开发环境：使用 Vite 代理访问 API");
    }
  }

  /**
   * 获取服务器配置
   * @returns {Object} 服务器配置对象
   */
  get server() {
    return {
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
      MODE: import.meta.env.MODE || "development",
      DEV: import.meta.env.DEV || false,
      PROD: import.meta.env.PROD || false,
    };
  }

  /**
   * 获取 Coze API 密钥
   * @returns {Object} Coze API 密钥对象
   */
  get coze() {
    return {
      API_KEY: import.meta.env.VITE_COZE_API_KEY || "",
    };
  }

  /**
   * 获取应用配置
   * @returns {Object} 应用配置对象
   */
  get app() {
    return {
      NAME: import.meta.env.VITE_APP_NAME || "Resume Analysis",
      VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
      DESCRIPTION:
        import.meta.env.VITE_APP_DESCRIPTION || "AI驱动的简历分析平台",
    };
  }

  /**
   * 获取文件上传配置
   * @returns {Object} 文件上传配置对象
   */
  get fileUpload() {
    return {
      MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
      SUPPORTED_TYPES: [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "text/plain",
      ],
      SUPPORTED_EXTENSIONS: [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".txt",
      ],
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
      app: this.app,
      fileUpload: this.fileUpload,
      analysisTypes: this.analysisTypes,
      analysisTypeDescriptions: this.analysisTypeDescriptions,
      coze: this.coze,
    };
  }
}

// 创建配置实例
const clientConfig = new ClientConfig();

// 导出配置
export { ClientConfig, clientConfig };
export default clientConfig;
