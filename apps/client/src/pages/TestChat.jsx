import React from "react";
import ChatInterface from "../components/ChatInterface";
import { useChat } from "../hooks/useChat";

const TestChat = () => {
  const chatHook = useChat({
    initialMessage: "🧪 这是聊天组件的测试页面。请尝试发送消息来测试功能！",
    suggestedQuestions: [
      "你好，请介绍一下你自己",
      "测试快捷问题功能",
      "这个组件工作正常吗？",
      "有什么问题需要修复？",
    ],
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">聊天组件测试</h1>
        <p className="text-base-content/70">测试重构后的聊天组件功能</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 聊天界面 */}
        <div className="lg:col-span-3">
          <ChatInterface
            {...chatHook}
            title="组件测试"
            emptyStateMessage="开始测试聊天功能吧！"
          />
        </div>

        {/* 测试信息 */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">测试信息</h3>

              <div className="space-y-4">
                <div className="stats stats-vertical">
                  <div className="stat">
                    <div className="stat-title">消息数量</div>
                    <div className="stat-value">
                      {chatHook.conversationHistory.length}
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-title">状态</div>
                    <div className="stat-value text-sm">
                      {chatHook.isSending ? "发送中..." : "就绪"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={chatHook.clearHistory}
                  className="btn btn-outline btn-sm w-full"
                  disabled={chatHook.conversationHistory.length === 0}
                >
                  清空对话
                </button>

                {chatHook.error && (
                  <div className="alert alert-error">
                    <span>{chatHook.error}</span>
                  </div>
                )}

                <div className="text-sm text-base-content/70">
                  <p>✅ 测试项目：</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>消息发送和接收</li>
                    <li>快捷问题功能</li>
                    <li>自动滚动</li>
                    <li>错误处理</li>
                    <li>组件样式</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestChat;
