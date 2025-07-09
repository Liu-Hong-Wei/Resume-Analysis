import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 服务器配置
export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3001,
  UPLOAD_DIR: path.join(__dirname, "..", "uploads"),
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
};

// Coze API文件限制
export const COZE_FILE_LIMITS = {
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB (根据Coze文档)
  SUPPORTED_TYPES: ["application/pdf", "image/jpeg", "image/png", "image/gif"],
};

// Coze API配置
export const COZE_CONFIG = {
  API_KEY: process.env.COZE_API_KEY,
  BOT_ID: process.env.COZE_BOT_ID,
  API_URL: "https://www.coze.cn/open/api/chat/completions",
  MAX_TEXT_LENGTH: 8000, // 根据Coze文档，支持更大的文本长度
  DEFAULT_PARAMS: {
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.9,
    presence_penalty: 0.0,
    frequency_penalty: 0.0,
  },
};

// 验证配置
export function validateConfig() {
  const errors = [];

  if (!COZE_CONFIG.API_KEY) {
    errors.push("缺少COZE_API_KEY环境变量");
  }

  if (!COZE_CONFIG.BOT_ID) {
    errors.push("缺少COZE_BOT_ID环境变量");
  }

  if (errors.length > 0) {
    throw new Error(`配置错误: ${errors.join(", ")}`);
  }
}
