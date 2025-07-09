import { useState, useCallback } from "react";

const useChatList = (initialConversations = []) => {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState(
    initialConversations.length > 0 ? initialConversations[0].id : null
  );

  // 创建新对话
  const createConversation = useCallback((title = "新对话") => {
    const newConversation = {
      id: Date.now().toString(),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setSelectedConversationId(newConversation.id);

    return newConversation;
  }, []);

  // 选择对话
  const selectConversation = useCallback((conversationId) => {
    setSelectedConversationId(conversationId);
  }, []);

  // 删除对话
  const deleteConversation = useCallback(
    (conversationId) => {
      setConversations((prev) => {
        const filtered = prev.filter((conv) => conv.id !== conversationId);

        // 如果删除的是当前选中的对话，选择第一个对话
        if (selectedConversationId === conversationId) {
          setSelectedConversationId(
            filtered.length > 0 ? filtered[0].id : null
          );
        }

        return filtered;
      });
    },
    [selectedConversationId]
  );

  // 添加消息到对话
  const addMessage = useCallback((conversationId, message) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, message],
            updatedAt: new Date().toISOString(),
          };
        }
        return conv;
      })
    );
  }, []);

  // 更新对话标题
  const updateConversationTitle = useCallback((conversationId, title) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, title, updatedAt: new Date().toISOString() }
          : conv
      )
    );
  }, []);

  // 归档对话
  const archiveConversation = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, isArchived: true, updatedAt: new Date().toISOString() }
          : conv
      )
    );
  }, []);

  // 获取当前选中的对话
  const getCurrentConversation = useCallback(() => {
    return conversations.find((conv) => conv.id === selectedConversationId);
  }, [conversations, selectedConversationId]);

  // 获取活跃对话（未归档）
  const getActiveConversations = useCallback(() => {
    return conversations.filter((conv) => !conv.isArchived);
  }, [conversations]);

  // 获取归档对话
  const getArchivedConversations = useCallback(() => {
    return conversations.filter((conv) => conv.isArchived);
  }, [conversations]);

  return {
    // 状态
    conversations,
    selectedConversationId,
    currentConversation: getCurrentConversation(),
    activeConversations: getActiveConversations(),
    archivedConversations: getArchivedConversations(),

    // 操作
    createConversation,
    selectConversation,
    deleteConversation,
    addMessage,
    updateConversationTitle,
    archiveConversation,

    // 工具方法
    getCurrentConversation,
    getActiveConversations,
    getArchivedConversations,
  };
};

export default useChatList;
