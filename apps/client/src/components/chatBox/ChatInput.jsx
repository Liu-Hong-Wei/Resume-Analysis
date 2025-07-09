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

// className="textarea textarea-bordered flex-1 rounded-2xl border-base-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-lg shadow-sm transition-all duration-300 resize-none text-base"
// rows="2"
// disabled={isSending || disabled}
// style={{
//   minHeight: "3rem",
//   fontSize: "1.2rem",
//   background: "#fafbfc",
//   padding: "0.5rem",
// }}
