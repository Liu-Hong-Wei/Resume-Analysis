import React from "react";

const ChatSendButton = ({ onSend, disabled = false, isSending = false }) => {
  return (
    <button
      onClick={onSend}
      disabled={disabled}
      className="btn btn-primary rounded-full btn-lg my-auto w-[8rem] h-[4rem]"
    >
      {isSending ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        "发送"
      )}
    </button>
  );
};

export default ChatSendButton;
