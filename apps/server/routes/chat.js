import express from "express";
import cozeService from "../services/cozeService.js";

const router = express.Router();

// 通用聊天端点
router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [], contextData = null } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "消息内容不能为空",
      });
    }

    // 构建对话上下文
    let fullPrompt = "";

    // 如果有上下文数据（如简历文本），添加到提示中
    if (contextData) {
      fullPrompt += `上下文信息：\n${contextData}\n\n`;
    }

    // 添加对话历史
    if (conversationHistory.length > 0) {
      fullPrompt += "对话历史：\n";
      conversationHistory.forEach((msg) => {
        const role = msg.role === "user" ? "用户" : "AI助手";
        fullPrompt += `${role}: ${msg.content}\n`;
      });
      fullPrompt += "\n";
    }

    // 添加当前消息
    fullPrompt += `用户: ${message}\nAI助手:`;

    // 调用Coze API
    const response = await cozeService.sendMessage(fullPrompt);

    res.json({
      success: true,
      response: response,
    });
  } catch (error) {
    console.error("聊天API错误:", error);
    res.status(500).json({
      success: false,
      error: "聊天服务暂时不可用，请稍后重试",
    });
  }
});

export default router;
