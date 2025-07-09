import React from "react";

/**
 * 聊天发送按钮组件
 */
const ChatSendButton = ({ onClick, disabled = false, isLoading = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn btn-primary btn-square"
      style={{ width: "44px", height: "44px" }}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
          />
        </svg>
      )}
    </button>
  );
};

export default ChatSendButton;
