import multer from "multer";

/**
 * 共享的文件上传配置
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
  fileFilter: (req, file, cb) => {
    const supportedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg", // 兼容性支持
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "text/plain",
    ];

    if (supportedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `不支持的文件类型: ${file.mimetype}。支持的类型: PDF、图片（JPG、PNG、GIF、BMP、WEBP）、TXT`
        ),
        false
      );
    }
  },
});

/**
 * 获取文件上传中间件
 * @param {string} fieldName - 文件字段名，默认为 "file"
 * @returns {Function} multer中间件
 */
export function getUploadMiddleware(fieldName = "file") {
  return upload.single(fieldName);
}
