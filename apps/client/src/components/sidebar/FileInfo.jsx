import React from "react";

/**
 * 文件信息组件
 */
const FileInfo = ({ file, onRemove }) => {
  if (!file) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "txt":
        return "📃";
      default:
        return "📁";
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title">
          <span className="text-success">📋</span>
          文件信息
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
            <span className="text-2xl">{getFileIcon(file.name)}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-base-content/60">
                {formatFileSize(file.size)} • {file.type || "未知类型"}
              </p>
            </div>
          </div>

          <button
            onClick={onRemove}
            className="btn btn-outline btn-error btn-sm w-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            移除文件
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileInfo;
