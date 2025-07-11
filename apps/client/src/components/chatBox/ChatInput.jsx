import React, { useEffect, useRef, useState } from "react";

/**
 * 聊天输入框组件
 */
const ChatInput = ({
  value,
  onChange,
  onKeyPress,
  placeholder = "输入消息...",
  disabled = false,
  onFileSelect,
  file,
  onRemoveFile,
}) => {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  // 使用计数器跟踪拖拽状态，避免事件冒泡问题
  const dragCounterRef = useRef(0);

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  // 处理文件选择
  const handleFileSelect = (e) => {
    // 兼容拖拽和input选择
    let file;
    if (
      e.dataTransfer &&
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      file = e.dataTransfer.files[0];
    } else if (e.target && e.target.files && e.target.files.length > 0) {
      file = e.target.files[0];
    }
    if (file) {
      onFileSelect?.(file);
    }
    // 清空 input 的值，避免同一文件无法重复上传
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    // 不需要重复设置 dragOver，在 dragEnter 中已经设置
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
      handleFileSelect(e);
      // 不要调用 clearData，否则可能影响后续拖拽
    }
  };

  return (
    <div className="flex-1 scrollbar-hide">
      {/* 输入区域 */}
      <div
        className={`relative ${dragOver ? "ring-2 ring-primary/50" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          className="w-full text-lg resize-none min-h-[44px] max-h-[120px] px-3 py-2 pr-12 ring-primary/30 ring-1 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-transparent transition-all duration-100 shadow-2xs focus:ring-3 focus:ring-primary/30"
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            overflowY: "auto",
            scrollbarWidth: "none", // 隐藏滚动条
          }}
        />

        {/* 图片上传按钮 */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
          disabled={disabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.txt,image/*,application/pdf,text/plain"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 拖拽提示 */}
      {dragOver && (
        <div className= "absolute mt-[80vh] inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center pointer-events-none">
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

export default ChatInput;
