import React from "react";

const ChatList = ({
  conversations = [],
  selectedConversationId = null,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  className = "",
}) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "昨天";
    } else {
      return date.toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
      });
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getLastMessage = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return "暂无消息";
    }
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return truncateText(lastMessage.content);
  };

  return (
    <div
      className={`card bg-base-100 shadow-xl h-full flex flex-col ${className}`}
    >
      <div className="card-body flex flex-col h-full p-0">
        {/* 头部 */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between">
            <h2 className="card-title text-lg">对话列表</h2>
            <button
              onClick={onNewConversation}
              className="btn btn-primary btn-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              新对话
            </button>
          </div>
        </div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-base-content/70 mb-4">还没有对话</p>
              <button
                onClick={onNewConversation}
                className="btn btn-primary btn-sm"
              >
                开始第一个对话
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-base-200 ${
                    selectedConversationId === conversation.id
                      ? "bg-primary/10 border-r-2 border-primary"
                      : ""
                  }`}
                  onClick={() => onConversationSelect(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <h3 className="font-medium text-sm truncate">
                          {conversation.title || "未命名对话"}
                        </h3>
                      </div>
                      <p className="text-xs text-base-content/60 truncate">
                        {getLastMessage(conversation)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-base-content/50">
                        {formatTime(
                          conversation.updatedAt || conversation.createdAt
                        )}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className="btn btn-ghost btn-xs text-error opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
