import React, { useState } from "react";

/**
 * 对话列表组件
 * 显示用户的所有对话，支持切换、删除、归档等操作
 */
const ChatList = ({
  conversations = [],
  currentConversationId,
  onSwitchConversation,
  onDeleteConversation,
}) => {

  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return "刚刚";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7天
      return date.toLocaleDateString("zh-CN", {
        weekday: "short",
      });
    } else {
      return date.toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // 获取对话预览
  const getConversationPreview = (conversation) => {
    // 简化版本，直接返回标题
    return conversation.title || "新对话";
  };

  // 获取对话类型图标
  const getTypeIcon = (type) => {
    switch (type) {
      case "resume_analysis":
        return "📄";
      case "general_chat":
        return "💬";
      case "interview":
        return "🎯";
      default:
        return "💬";
    }
  };

  return (
    <div>
      {/* 对话列表 */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">暂无对话</div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`card card-compact cursor-pointer transition-all duration-200 ${
                currentConversationId === conversation.id
                  ? "bg-primary text-primary-content shadow-lg"
                  : "bg-base-100 hover:bg-base-200"
              }`}
              onClick={() => onSwitchConversation(conversation.id)}
            >
              <div className="card-body p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {getTypeIcon(conversation.type || "general_chat")}
                      </span>
                      <h3
                        className={`font-medium truncate ${
                          currentConversationId === conversation.id
                            ? "text-primary-content"
                            : ""
                        }`}
                      >
                        {conversation.title || "新对话"}
                      </h3>
                    </div>

                    <p
                      className={`text-sm truncate ${
                        currentConversationId === conversation.id
                          ? "text-primary-content/80"
                          : "text-gray-600"
                      }`}
                    >
                      {getConversationPreview(conversation)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs ${
                          currentConversationId === conversation.id
                            ? "text-primary-content/60"
                            : "text-gray-400"
                        }`}
                      >
                        {formatTime(conversation.updatedAt)}
                      </span>

                      {conversation.metadata?.analysisType && (
                        <span className="badge badge-xs badge-outline">
                          {conversation.metadata.analysisType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="dropdown dropdown-end">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    <div className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conversation.id);
                          }}
                          className="text-sm text-error"
                        >
                          删除
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
