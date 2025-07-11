import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

/**
 * 处理流式输出中不完整的Markdown内容
 * @param {string} content - 原始内容
 * @param {boolean} isStreaming - 是否正在流式输出
 * @returns {{content: string, shouldShowCursor: boolean}} 处理后的内容和是否显示光标
 */
const preprocessStreamingContent = (content, isStreaming) => {
  if (!isStreaming) return { content, shouldShowCursor: false };

  let processedContent = content;
  let shouldShowCursor = true;

  // 处理不完整的代码块
  const codeBlockCount = (content.match(/```/g) || []).length;
  if (codeBlockCount % 2 === 1) {
    // 如果代码块标记数量是奇数，说明有未闭合的代码块
    processedContent = content + "\n```";
    shouldShowCursor = false; // 代码块内不显示光标
  }

  // 处理不完整的表格
  const lines = content.split("\n");
  const lastLine = lines[lines.length - 1];
  if (lastLine && lastLine.includes("|") && !lastLine.endsWith("|")) {
    // 如果最后一行是不完整的表格行
    processedContent = content + "|";
  }

  // 处理不完整的引用块
  if (content.endsWith(">")) {
    processedContent = content + " ";
  }

  // 处理不完整的列表项
  if (/^\s*[-*+]\s*$/.test(lastLine)) {
    processedContent = content + "项目";
  }

  // 检查内容是否以空白字符结尾
  const endsWithWhitespace = /\s$/.test(content);
  if (endsWithWhitespace && shouldShowCursor) {
    // 如果内容以空白字符结尾，在渲染时移除尾部空白，光标会正确显示
    processedContent = processedContent.trimEnd();
  }

  return { content: processedContent, shouldShowCursor };
};

/**
 * 消息框组件
 */
const MessageBox = ({ message, isOwn, timestamp, isStreaming = false }) => {
  const isUser = isOwn || message.role === "user";
  const isSystem = message.role === "system";
  const isError = message.metadata?.isError;
  const isTyping = message.metadata?.isTyping || isStreaming;
  const displayTimestamp = timestamp || message.timestamp;
  const formattedTime = new Date(displayTimestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // 处理流式输出的内容
  const { content: processedContent, shouldShowCursor } = useMemo(() => {
    return preprocessStreamingContent(message.content, isStreaming);
  }, [message.content, isStreaming]);

  // 根据消息类型获取样式类名
  const getStyleClasses = () => {
    if (isError) {
      return {
        inlineCode:
          "bg-error/30 text-error-content px-2 py-1 rounded-md text-sm font-mono border border-error/40",
        blockquote:
          "border-l-4 border-error/60 pl-4 py-2 italic text-error-content/95 my-3 bg-error/10 rounded-r-lg",
        table:
          "table table-zebra table-pin-rows w-full border border-error/40 rounded-lg overflow-hidden shadow-sm",
        link: "text-error-content underline hover:text-error-content/90 transition-colors duration-200",
        codeBlock: "bg-red-50 border border-red-200 rounded-lg shadow-sm",
      };
    }
    if (isUser) {
      return {
        inlineCode:
          "bg-white/20 text-white px-3 py-1.5 rounded-md text-base font-mono border border-white/30 shadow-sm",
        blockquote:
          "border-l-4 border-white/60 pl-5 py-3 italic text-white/95 my-4 bg-white/10 rounded-r-lg shadow-sm",
        table:
          "table table-zebra table-pin-rows w-full border border-white/30 rounded-lg overflow-hidden shadow-lg",
        link: "text-white underline hover:text-white/90 transition-colors duration-200 font-medium",
        codeBlock:
          "bg-white/10 border border-white/20 rounded-lg shadow-lg backdrop-blur-sm",
      };
    }
    // AI助手默认样式
    return {
      inlineCode:
        "bg-base-300/60 text-base-content px-2 py-1 rounded-md text-sm font-mono border border-base-300/70",
      blockquote:
        "border-l-4 border-accent/60 pl-4 py-2 italic text-base-content/95 my-3 bg-accent/10 rounded-r-lg",
      table:
        "table table-zebra table-pin-rows w-full border border-base-300/60 rounded-lg overflow-hidden shadow-sm",
      link: "text-accent underline hover:text-accent/80 transition-colors duration-200",
      codeBlock: "bg-gray-50 border border-gray-200 rounded-lg shadow-sm",
    };
  };

  const styleClasses = getStyleClasses();

  // Markdown渲染组件配置
  const MarkdownRenderer = ({ children }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <div className={`my-6 ${styleClasses.codeBlock}`}>
              <SyntaxHighlighter
                style={oneLight}
                language={match[1]}
                PreTag="div"
                className="text-base"
                customStyle={{
                  margin: 0,
                  padding: isUser ? "1.5rem" : "1.25rem",
                  backgroundColor: "transparent",
                  borderRadius: "0.5rem",
                  fontSize: isUser ? "1rem" : "0.95rem",
                  lineHeight: "1.6",
                  border: isUser
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "none",
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code
              className={`${styleClasses.inlineCode} text-base ring-1 ring-primary/30`}
              {...props}
            >
              {children}
            </code>
          );
        },
        blockquote({ children }) {
          return (
            <blockquote
              className={`${styleClasses.blockquote} text-base leading-relaxed`}
            >
              {children}
            </blockquote>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-6">
              <table
                className={`${styleClasses.table} ${isUser ? "shadow-lg" : "shadow-sm"}`}
              >
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th
              className={`text-left font-semibold py-4 px-5 bg-base-200/50 text-base ${isUser ? "bg-white/20 text-white" : ""}`}
            >
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td
              className={`py-4 px-5 border-b border-base-200/50 text-base ${isUser ? "border-white/20 text-white" : ""}`}
            >
              {children}
            </td>
          );
        },
        ul({ children }) {
          return (
            <ul className="list-disc list-inside space-y-3 my-4 pl-4">
              {children}
            </ul>
          );
        },
        ol({ children }) {
          return (
            <ol className="list-decimal list-inside space-y-3 my-4 pl-4">
              {children}
            </ol>
          );
        },
        li({ children }) {
          return (
            <li className="leading-relaxed text-base-content/90 text-base">
              {children}
            </li>
          );
        },
        h1({ children }) {
          return (
            <h1 className="text-3xl font-bold mb-6 mt-8 first:mt-0 text-primary">
              {children}
            </h1>
          );
        },
        h2({ children }) {
          return (
            <h2 className="text-2xl font-semibold mb-4 mt-6 first:mt-0 text-primary">
              {children}
            </h2>
          );
        },
        h3({ children }) {
          return (
            <h3 className="text-xl font-semibold mb-3 mt-5 first:mt-0 text-primary">
              {children}
            </h3>
          );
        },
        h4({ children }) {
          return (
            <h4 className="text-lg font-semibold mb-3 mt-4 first:mt-0 text-primary">
              {children}
            </h4>
          );
        },
        h5({ children }) {
          return (
            <h5 className="text-base font-semibold mb-2 mt-3 first:mt-0 text-accent">
              {children}
            </h5>
          );
        },
        h6({ children }) {
          return (
            <h6 className="text-sm font-semibold mb-2 mt-3 first:mt-0 text-accent">
              {children}
            </h6>
          );
        },
        p({ children }) {
          return (
            <p className="mb-4 last:mb-0 leading-relaxed text-base-content/90 text-base">
              {children}
            </p>
          );
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styleClasses.link} hover:scale-105 transition-transform duration-200`}
            >
              {children}
            </a>
          );
        },
        strong({ children }) {
          return (
            <strong className="font-semibold text-primary">{children}</strong>
          );
        },
        em({ children }) {
          return <em className="italic text-secondary">{children}</em>;
        },
        hr() {
          return <hr className="my-6 border-current opacity-30" />;
        },
        del({ children }) {
          return <del className="line-through opacity-75">{children}</del>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );

  // 系统消息样式
  if (isSystem) {
    return (
      <div className="flex justify-center my-6">
        <div className="bg-base-200/90 backdrop-blur-sm text-base-content/80 px-6 py-3 rounded-full text-sm border border-base-300/60 shadow-sm">
          <span className="flex items-center gap-2">
            <span className="text-info">ℹ️</span>
            {message.content}
          </span>
        </div>
      </div>
    );
  }

  // 错误消息样式
  if (isError) {
    return (
      <div className="chat chat-start animate-fade-in-up">
        <div className="chat-image avatar">
          <div className="w-14 h-14 rounded-full ring-2 ring-error/40 ring-offset-2 ring-offset-base-100">
            <div className="bg-gradient-to-br from-error to-error/90 text-error-content flex items-center justify-center w-full h-full rounded-full shadow-lg">
              <span className="text-xl">⚠️</span>
            </div>
          </div>
        </div>
        <div className="chat-header mb-3">
          <span className="text-error font-semibold text-base">AI 助手</span>
          <time className="text-sm opacity-70 ml-3">{formattedTime}</time>
        </div>
        <div className="chat-bubble backdrop-blur-sm bg-error/95 text-error-content border border-error/40 shadow-xl max-w-[85%] md:max-w-[75%] px-6 py-4">
          <div className="prose prose-lg max-w-none text-error-content">
            <MarkdownRenderer>{processedContent}</MarkdownRenderer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`chat ${isUser ? "chat-end" : "chat-start"} animate-fade-in-up`}
    >
      <div className="chat-image avatar">
        <div
          className={`w-14 h-14 rounded-full ring-2 ring-offset-2 ring-offset-base-100 transition-all duration-300 ${
            isUser
              ? "ring-info/40 hover:ring-info/60"
              : "ring-accent/40 hover:ring-accent/60"
          }`}
        >
          {isUser ? (
            <div className="bg-gradient-to-br from-info via-info/95 to-info/90 text-info-content flex items-center justify-center w-full h-full rounded-full shadow-lg">
              <span className="text-base font-bold">我</span>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-accent via-accent/95 to-accent/90 text-accent-content flex items-center justify-center w-full h-full rounded-full shadow-lg">
              <span className="text-base font-bold">AI</span>
            </div>
          )}
        </div>
      </div>

      <div className="chat-header mb-3">
        <span
          className={`font-semibold text-base ${isUser ? "text-info" : "text-accent"}`}
        >
          {isUser ? "您" : "AI 助手"}
        </span>
        <time className="text-sm opacity-70 ml-3">{formattedTime}</time>
        {isStreaming && (
          <span className="ml-3 text-primary">
            <span className="loading loading-dots loading-sm"></span>
          </span>
        )}
      </div>

      <div
        className={`chat-bubble backdrop-blur-sm border shadow-lg max-w-[85%] md:max-w-[75%] transition-all duration-300 hover:shadow-xl ${
          isUser
            ? "bg-info/95 text-info-content border-info/40 px-6 py-4 shadow-xl"
            : "bg-base-200/95 text-base-content border-base-300/60 px-5 py-3"
        }`}
      >
        {/* 文件内容 */}
        {message.file && (
          <div className="mb-3">
            <img
              src={message.file.url}
              alt={message.file.name}
              className="max-w-full h-auto rounded-lg shadow-md border border-white/20 hover:shadow-lg transition-all duration-300"
              style={{ maxHeight: "300px" }}
            />
            <div className="text-xs opacity-70 mt-1">
              {message.file.name} ({(message.file.size / 1024).toFixed(1)} KB)
            </div>
          </div>
        )}

        <div
          className={`prose max-w-none ${isUser ? "prose-lg" : "prose-base"}`}
        >
          <div className="relative">
            <div
              className={`${isUser ? "text-white" : "text-base-content"} text-base leading-relaxed`}
            >
              <MarkdownRenderer>{processedContent}</MarkdownRenderer>
            </div>
            {isTyping && (
              <span
                className={`inline-block w-2 h-6 bg-current animate-pulse ml-1 align-text-bottom transition-opacity duration-300 ${
                  shouldShowCursor ? "opacity-100" : "opacity-50"
                }`}
                style={{
                  background: `linear-gradient(45deg, ${isUser ? "var(--primary)" : "var(--accent)"}, ${isUser ? "var(--primary)" : "var(--accent)"})`,
                }}
              ></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
