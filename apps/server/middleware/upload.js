// 导入必要的模块
import multer from "multer"; // multer是一个处理multipart/form-data的中间件，用于处理文件上传
import fs from "fs"; // 文件系统模块，用于创建目录和文件操作
import path from "path"; // 路径处理模块，用于处理文件路径
import { SERVER_CONFIG, COZE_FILE_LIMITS } from "../config/index.js"; // 导入服务器配置

// 确保上传目录存在，如果不存在则创建
// 使用recursive: true选项可以创建多层目录结构
if (!fs.existsSync(SERVER_CONFIG.UPLOAD_DIR)) {
  fs.mkdirSync(SERVER_CONFIG.UPLOAD_DIR, { recursive: true });
}

// 配置multer的磁盘存储策略
// diskStorage允许将文件保存到磁盘上的指定位置
const storage = multer.diskStorage({
  // destination函数：决定文件存储的位置
  destination: (req, file, cb) => {
    // 将所有上传的文件存储到配置的上传目录中
    cb(null, SERVER_CONFIG.UPLOAD_DIR);
  },
  // filename函数：决定文件的命名规则
  filename: (req, file, cb) => {
    // 生成唯一的时间戳和随机数后缀，避免文件名冲突
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // 文件名格式：字段名-时间戳随机数.原文件扩展名
    // 例如：resume-1703123456789-123456789.pdf
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// 简历分析专用文件类型过滤器
// 只允许PDF文件，因为简历分析主要处理PDF格式
const resumeFileFilter = (req, file, cb) => {
  console.log(`检查文件类型: ${file.originalname}, MIME类型: ${file.mimetype}`);

  // 支持多种PDF MIME类型
  const allowedMimeTypes = [
    "application/pdf",
    "application/x-pdf",
    "binary/octet-stream", // 某些系统可能使用这个MIME类型
  ];

  // 检查文件的MIME类型是否为PDF
  if (allowedMimeTypes.includes(file.mimetype)) {
    console.log("文件类型验证通过");
    // 如果是PDF文件，允许上传
    cb(null, true);
  } else {
    console.log(`文件类型验证失败: ${file.mimetype} 不在允许的类型列表中`);
    // 如果不是PDF文件，拒绝上传并返回错误信息
    cb(
      new Error(`只支持PDF格式的简历文件，当前文件类型: ${file.mimetype}`),
      false
    );
  }
};

// 通用文件类型过滤器（保留原有功能）
const fileFilter = (req, file, cb) => {
  // 检查文件的MIME类型是否在支持的类型列表中
  if (COZE_FILE_LIMITS.SUPPORTED_TYPES.includes(file.mimetype)) {
    // 如果是支持的文件类型，允许上传
    cb(null, true);
  } else {
    // 如果不是支持的文件类型，拒绝上传并返回错误信息
    cb(
      new Error(
        `不支持的文件格式，支持的类型：${COZE_FILE_LIMITS.SUPPORTED_TYPES.join(", ")}`
      ),
      false
    );
  }
};

// 创建并导出multer实例（简历分析专用）
// 配置了存储策略、文件大小限制和PDF文件类型过滤
export const upload = multer({
  storage: storage, // 使用上面配置的磁盘存储策略
  limits: {
    fileSize: Math.min(
      SERVER_CONFIG.MAX_FILE_SIZE,
      COZE_FILE_LIMITS.MAX_FILE_SIZE
    ), // 使用较小的限制
  },
  fileFilter: resumeFileFilter, // 使用简历专用的文件类型过滤器
});

// 创建通用multer实例（保留原有功能）
export const uploadGeneral = multer({
  storage: storage,
  limits: {
    fileSize: Math.min(
      SERVER_CONFIG.MAX_FILE_SIZE,
      COZE_FILE_LIMITS.MAX_FILE_SIZE
    ),
  },
  fileFilter: fileFilter,
});

// 错误处理中间件
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `文件大小超过限制（最大${Math.min(SERVER_CONFIG.MAX_FILE_SIZE, COZE_FILE_LIMITS.MAX_FILE_SIZE) / (1024 * 1024)}MB）`,
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "文件数量超过限制",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "意外的文件字段",
      });
    }
  }

  if (error.message.includes("只支持PDF格式的简历文件")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error.message.includes("不支持的文件格式")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // 对于其他错误，传递给下一个错误处理中间件
  next(error);
};
