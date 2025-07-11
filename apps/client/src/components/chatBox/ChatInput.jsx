import React from "react";

/**
 * 聊天输入框组件
 */
const ChatInput = ({
  value,
  onChange,
  onKeyPress,
  placeholder = "输入消息...",
  disabled = false,
}) => {
  return (
    <div className="flex-1">
      <textarea
        className="textarea textarea-bordered w-full resize-none"
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          minHeight: "44px",
          maxHeight: "120px",
        }}
      />
    </div>
  );
};

export default ChatInput;
