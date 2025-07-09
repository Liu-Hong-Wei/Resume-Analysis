import React from "react";
import ChatList from "./ChatList";
import useChatList from "../hooks/useChatList";

const ChatListDemo = () => {
  // 模拟对话数据
  const initialConversations = [
    {
      id: "1",
      title: "简历分析咨询",
      messages: [
        { role: "user", content: "请帮我分析一下我的简历" },
        {
          role: "assistant",
          content: "好的，我来帮您分析简历。请先上传您的简历文件。",
        },
      ],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分钟前
    },
    {
      id: "2",
      title: "面试准备",
      messages: [
        { role: "user", content: "我想准备一下技术面试" },
        {
          role: "assistant",
          content: "很好的想法！技术面试需要充分准备。您想重点准备哪个方面？",
        },
        { role: "user", content: "主要是前端开发相关的面试题" },
        {
          role: "assistant",
          content:
            "前端开发面试确实有很多重点内容。我们可以从以下几个方面开始准备：1. JavaScript基础 2. React/Vue框架 3. CSS布局 4. 网络协议 5. 性能优化。您想从哪个开始？",
        },
      ],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1天前
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
    },
    {
      id: "3",
      title: "职业规划建议",
      messages: [
        { role: "user", content: "我想了解一下前端开发的职业发展路径" },
        {
          role: "assistant",
          content:
            "前端开发的职业发展路径通常包括：初级前端工程师 → 中级前端工程师 → 高级前端工程师 → 前端架构师 → 技术专家。每个阶段都有不同的技能要求和职责。",
        },
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3天前
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const {
    conversations,
    selectedConversationId,
    currentConversation,
    createConversation,
    selectConversation,
    deleteConversation,
  } = useChatList(initialConversations);

  const handleNewConversation = () => {
    createConversation("新对话");
  };

  const handleConversationSelect = (conversationId) => {
    selectConversation(conversationId);
    console.log("选择了对话:", conversationId);
  };

  const handleDeleteConversation = (conversationId) => {
    if (window.confirm("确定要删除这个对话吗？")) {
      deleteConversation(conversationId);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-screen">
        {/* 对话列表 */}
        <div className="lg:col-span-1">
          <ChatList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>

        {/* 对话内容区域 */}
        <div className="lg:col-span-3">
          <div className="card bg-base-100 shadow-xl h-full">
            <div className="card-body">
              <h2 className="card-title">
                {currentConversation?.title || "选择对话"}
              </h2>
              <div className="flex-1 overflow-y-auto">
                {currentConversation ? (
                  <div className="space-y-4">
                    {currentConversation.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`chat ${message.role === "user" ? "chat-end" : "chat-start"}`}
                      >
                        <div className="chat-image avatar">
                          <div className="w-8 rounded-full">
                            {message.role === "user" ? (
                              <div className="bg-primary text-primary-content flex items-center justify-center text-xs">
                                👤
                              </div>
                            ) : (
                              <div className="bg-secondary text-secondary-content flex items-center justify-center text-xs">
                                🤖
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className={`chat-bubble ${
                            message.role === "user"
                              ? "chat-bubble-primary"
                              : "chat-bubble-secondary"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-base-content/70">
                      请选择一个对话开始聊天
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatListDemo;
