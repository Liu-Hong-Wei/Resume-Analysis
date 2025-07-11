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
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("只支持PDF文件或图片（PNG、JPG、JPEG）"), false);
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
