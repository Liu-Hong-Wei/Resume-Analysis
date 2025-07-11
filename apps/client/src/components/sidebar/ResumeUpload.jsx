import React, { useRef, useState } from "react";

const ResumeUpload = ({ selectedFile, onFileChange }) => {
  const [dragOver, setDragOver] = useState(false);
  // 使用计数器跟踪拖拽状态，避免事件冒泡问题
  const dragCounterRef = useRef(0);

  // 处理文件选择
  const handleFileSelect = (file) => {
    if (file) {
      onFileChange(file);
    }
  };

  // 处理拖拽进入
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setDragOver(true);
    }
  };

  // 处理拖拽离开
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setDragOver(false);
    }
  };

  // 处理拖拽悬停
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 处理文件拖拽放置
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // 重置计数器和状态
    dragCounterRef.current = 0;
    setDragOver(false);

    if (
      e.dataTransfer &&
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  return (
    <div
      className={`card bg-base-100 shadow-lg relative ${dragOver ? "ring-2 ring-primary/50" : ""}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="card-body">
        <h2 className="card-title">
          <span className="text-primary">📄</span>
          上传简历
        </h2>
        <div className="form-control w-full">
          <label className="label cursor-pointer mb-2">
            <span className="label-text">选择文件</span>
            <span className="label-text-alt">
              支持 PDF、Word、TXT、PNG、JPEG 格式
            </span>
          </label>
          {!selectedFile && (
            <input
              type="file"
              className="file-input file-input-bordered file-input-primary w-full"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onFileChange(e.target.files[0]);
                }
              }}
              disabled={!!selectedFile}
            />
          )}
          {selectedFile && (
            <div className="alert alert-success mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>已选择: {selectedFile.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* 拖拽提示 */}
      {dragOver && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-primary font-medium">拖拽文件到这里</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
