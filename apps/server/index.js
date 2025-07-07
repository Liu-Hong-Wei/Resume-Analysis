import express from "express";
import cors from "cors";
import multer from "multer";
import OpenAI from "openai";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件配置
app.use(cors({ origin: "http://localhost:5173" })); // 前端地址
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 文件上传配置
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx", ".txt"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("不支持的文件格式"), false);
    }
  },
});

// OpenAI 配置 (需要设置环境变量 OPENAI_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "your-openai-api-key-here",
});

// 解析文档内容
async function extractTextFromFile(filePath, fileType) {
  try {
    const buffer = fs.readFileSync(filePath);

    if (fileType === "application/pdf") {
      const data = await pdf(buffer);
      return data.text;
    } else if (
      fileType.includes("wordprocessingml.document") ||
      fileType === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (fileType === "text/plain") {
      return buffer.toString("utf-8");
    }

    throw new Error("不支持的文件格式");
  } catch (error) {
    console.error("文档解析错误:", error);
    throw error;
  }
}

// 使用LLM分析简历
async function analyzeResumeWithLLM(resumeText, analysisType) {
  try {
    const analysisPrompts = {
      comprehensive: `请对以下简历进行全面分析，包括：
1. 整体评价（1-100分）
2. 技能匹配度分析
3. 工作经验评估
4. 教育背景分析
5. 具体优化建议

简历内容：
${resumeText}

请以JSON格式返回结果，包含以下字段：
{
  "overallScore": 85,
  "skillMatch": "90%",
  "experienceRelevance": "88%",
  "analysis": "详细分析内容",
  "suggestions": ["建议1", "建议2", "建议3"]
}`,

      skills: `请重点分析以下简历的技能部分：
1. 技能展示效果
2. 技能与目标职位的匹配度
3. 技能描述的准确性
4. 技能优化建议

简历内容：
${resumeText}

请以JSON格式返回结果。`,

      experience: `请深度分析以下简历的工作经验部分：
1. 经验描述的质量
2. 成就的量化程度
3. 与目标职位的相关性
4. 经验展示的改进建议

简历内容：
${resumeText}

请以JSON格式返回结果。`,

      optimization: `请为以下简历提供具体的优化建议：
1. 内容结构优化
2. 关键词优化
3. 描述改进建议
4. 格式优化建议

简历内容：
${resumeText}

请以JSON格式返回结果。`,
    };

    const prompt =
      analysisPrompts[analysisType] || analysisPrompts.comprehensive;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "你是一个专业的简历分析专家，请根据用户的要求对简历进行分析。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("LLM分析错误:", error);
    throw error;
  }
}

// API路由

// 上传并分析简历
app.post("/api/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "请上传文件" });
    }

    const { analysisType = "comprehensive" } = req.body;

    // 解析文档内容
    const resumeText = await extractTextFromFile(
      req.file.path,
      req.file.mimetype
    );

    // 使用LLM分析
    const analysisResult = await analyzeResumeWithLLM(resumeText, analysisType);

    // 清理上传的文件
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      result: analysisResult,
      originalText: resumeText.substring(0, 500) + "...", // 返回前500字符作为预览
    });
  } catch (error) {
    console.error("分析错误:", error);
    res.status(500).json({
      error: "分析失败",
      details: error.message,
    });
  }
});

// 对话式分析
app.post("/api/chat-analysis", async (req, res) => {
  try {
    const { message, resumeText, conversationHistory = [] } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "缺少简历内容" });
    }

    const systemPrompt = `你是一个专业的简历分析助手。用户已经上传了简历，你需要根据用户的提问提供专业的分析和建议。

简历内容：
${resumeText}

请保持专业、友好的语调，提供具体、实用的建议。`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantResponse = completion.choices[0].message.content;

    res.json({
      success: true,
      response: assistantResponse,
      conversationHistory: [
        ...conversationHistory,
        { role: "user", content: message },
        { role: "assistant", content: assistantResponse },
      ],
    });
  } catch (error) {
    console.error("对话分析错误:", error);
    res.status(500).json({
      error: "对话失败",
      details: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("简历分析服务器运行中！");
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error("Error:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        error: "文件大小超过限制 (最大10MB)",
      });
    }
  }

  if (error.message === "不支持的文件格式") {
    return res.status(415).json({
      success: false,
      error: "不支持的文件格式，请上传 PDF、Word 或 TXT 文件",
    });
  }

  res.status(500).json({
    success: false,
    error: "服务器内部错误",
  });
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
