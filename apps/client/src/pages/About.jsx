function About() {
  const teamMembers = [
    {
      name: "周海龙",
      role: "产品经理",
      avatar: "👨‍💼",
      description: "负责需求调研、项目文档设计与撰写、用户手册维护",
    },
    {
      name: "刘宏伟",
      role: "前端工程师",
      avatar: "👨‍🎨",
      description: "负责网站开发、技术实现、系统架构设计",
    },
    {
      name: "宋诗琳",
      role: "数据分析师",
      avatar: "👩‍🔬",
      description: "负责Agent设计、用户友好的大语言模型优化",
    },
  ];

  const technologies = [
    {
      name: "React 19",
      icon: "⚛️",
      description: "最新版本前端框架",
      color: "badge-primary",
      features: ["Hooks状态管理", "组件化开发", "虚拟DOM优化"],
    },
    {
      name: "Vite",
      icon: "⚡",
      description: "现代化构建工具",
      color: "badge-secondary",
      features: ["快速热重载", "ES模块构建", "开发体验优化"],
    },
    {
      name: "Node.js",
      icon: "🟢",
      description: "服务端运行环境",
      color: "badge-accent",
      features: ["Express框架", "异步I/O", "高性能服务"],
    },
    {
      name: "Coze API",
      icon: "🤖",
      description: "AI大语言模型",
      color: "badge-info",
      features: ["流式响应", "多模态支持", "智能对话"],
    },
    {
      name: "Tailwind CSS",
      icon: "🎨",
      description: "原子化CSS框架",
      color: "badge-success",
      features: ["响应式设计", "组件库集成", "开发效率提升"],
    },
    {
      name: "Clerk Auth",
      icon: "🔐",
      description: "用户认证系统",
      color: "badge-warning",
      features: ["OAuth集成", "安全防护", "用户管理"],
    },
  ];

  const technicalFeatures = [
    {
      title: "流式响应系统",
      description:
        "基于Server-Sent Events (SSE)的实时流式响应，提供即时AI回复体验",
      icon: "🌊",
      details: [
        "实时消息流处理",
        "自动重连机制",
        "错误恢复能力",
        "状态管理优化",
      ],
    },
    {
      title: "多模态文件处理",
      description: "支持PDF、图片、文本等多种格式的智能解析和分析",
      icon: "📄",
      details: ["PDF文档解析", "图片OCR识别", "文本内容提取", "格式自动检测"],
    },
    {
      title: "智能对话管理",
      description: "完整的对话生命周期管理，支持多轮对话和上下文保持",
      icon: "💬",
      details: ["对话历史记录", "上下文关联", "会话状态管理", "消息持久化"],
    },
    {
      title: "响应式架构设计",
      description: "前后端分离架构，支持高并发和可扩展性",
      icon: "🏗️",
      details: ["RESTful API设计", "中间件架构", "错误处理机制", "性能监控"],
    },
  ];

  const projectStats = [
    {
      title: "代码行数",
      value: "5000+",
      description: "前后端代码总量",
      icon: "📊",
    },
    {
      title: "API接口",
      value: "15+",
      description: "RESTful接口数量",
      icon: "🔌",
    },
    {
      title: "组件数量",
      value: "20+",
      description: "React组件模块",
      icon: "🧩",
    },
    {
      title: "技术栈",
      value: "10+",
      description: "核心技术框架",
      icon: "🛠️",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 页面标题 */}
      <div className="hero bg-base-200 rounded-2xl p-8">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold">关于我们</h1>
            <p className="py-6 text-lg">
              我们致力于运用先进的人工智能技术，为用户提供专业、精准的简历分析服务，
              帮助求职者在竞争激烈的就业市场中脱颖而出
            </p>
          </div>
        </div>
      </div>

      {/* 公司介绍 */}
      <div className="hero bg-base-100 shadow-xl rounded-2xl p-8">
        <div className="w-full hero-content flex-col lg:flex-row justify-around">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold">我们的使命</h2>
            <p className="py-6 text-base-content/70">
              在当今快速发展的就业市场中，一份优秀的简历是成功求职的关键。
              我们运用最新的AI技术，为求职者提供深度、精准的简历分析，
              帮助他们发现自身优势，优化简历内容，提高求职成功率。
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="badge badge-primary badge-sm"></div>
                <span>智能识别简历关键信息</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="badge badge-secondary badge-sm"></div>
                <span>提供个性化优化建议</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="badge badge-accent badge-sm"></div>
                <span>量化分析求职成功率</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-8xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-2">创新驱动</h3>
            <p className="text-base-content/70">持续创新，为用户创造价值</p>
          </div>
        </div>
      </div>

      {/* 技术栈 */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">技术优势</h2>
          <p className="text-base-content/70 max-w-2xl mx-auto">
            我们采用业界领先的技术栈，确保系统的稳定性和分析结果的准确性
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="card-body">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{tech.icon}</div>
                  <div>
                    <h4 className="font-semibold text-lg">{tech.name}</h4>
                    <p className="text-sm text-base-content/70">
                      {tech.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {tech.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="card-actions justify-end mt-4">
                  <div className={`badge ${tech.color}`}>核心技术</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 技术特性 */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">核心技术特性</h2>
          <p className="text-base-content/70 max-w-2xl mx-auto">
            项目采用现代化的技术架构，实现了高性能、高可用的AI简历分析系统
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {technicalFeatures.map((feature, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{feature.icon}</div>
                  <div>
                    <h4 className="text-xl font-semibold">{feature.title}</h4>
                    <p className="text-base-content/70">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {feature.details.map((detail, idx) => (
                    <div key={idx} className="badge badge-outline badge-sm">
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 项目统计 */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">项目规模</h2>
          <p className="text-base-content/70 max-w-2xl mx-auto">
            展示项目的技术深度和开发规模
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {projectStats.map((stat, index) => (
            <div key={index} className="card bg-base-100 shadow-xl text-center">
              <div className="card-body">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="stat-value text-2xl">{stat.value}</div>
                <div className="stat-title text-sm">{stat.title}</div>
                <div className="stat-desc text-xs">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 团队介绍 */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">核心团队</h2>
          <p className="text-base-content/70 max-w-2xl mx-auto">
            我们拥有一支经验丰富、技术精湛的专业团队
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="card-body text-center">
                <div className="avatar placeholder mb-4">
                  <div className="bg-base-200 text-neutral-content rounded-full w-fit h-fit flex items-center justify-center pt-2">
                    <span className="text-5xl text-primary text-center">
                      {member.avatar}
                    </span>
                  </div>
                </div>
                <h4 className="text-xl font-semibold mb-2">{member.name}</h4>
                <div className="badge badge-primary mb-3">{member.role}</div>
                <p className="text-base-content/70 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 公司数据 */}
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">成立时间</div>
          <div className="stat-value text-primary">2025</div>
          <div className="stat-desc">专注AI简历分析</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">服务用户</div>
          <div className="stat-value text-secondary">10M+</div>
          <div className="stat-desc">遍布全球</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">用户满意度</div>
          <div className="stat-value text-accent">99.8%</div>
          <div className="stat-desc">用户反馈极佳</div>
        </div>
      </div>

      {/* 联系信息 */}
      <div className="hero bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">联系我们</h2>
            <p className="text-base-content/70 max-w-2xl mx-auto mb-8">
              如果您有任何问题或建议，欢迎随时与我们联系
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <div className="text-3xl mb-3">📧</div>
                  <h4 className="font-semibold mb-2">邮箱</h4>
                  <p className="text-base-content/70">
                    contact@resume-analysis.com
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <div className="text-3xl mb-3">📱</div>
                  <h4 className="font-semibold mb-2">电话</h4>
                  <p className="text-base-content/70">400-123-4567</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <div className="text-3xl mb-3">📍</div>
                  <h4 className="font-semibold mb-2">地址</h4>
                  <p className="text-base-content/70">北京市朝阳区科技园区</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
