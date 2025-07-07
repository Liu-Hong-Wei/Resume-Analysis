function About() {
  const teamMembers = [
    {
      name: "周海龙",
      role: "产品经理",
      avatar: "👩‍💼",
      description: "5年产品设计经验，深谙用户体验和市场需求",
    },
    {
      name: "刘宏伟",
      role: "前端工程师",
      avatar: "👨‍🎨",
      description: "专注于现代Web技术，打造流畅的用户界面",
    },
    {
      name: "宋诗琳",
      role: "数据分析师",
      avatar: "👩‍🔬",
      description: "专业的数据分析和可视化专家",
    },
  ];

  const technologies = [
    {
      name: "React",
      icon: "⚛️",
      description: "现代前端框架",
      color: "badge-primary",
    },
    {
      name: "Node.js",
      icon: "🟢",
      description: "服务端运行环境",
      color: "badge-secondary",
    },
    {
      name: "Python",
      icon: "🐍",
      description: "AI算法开发",
      color: "badge-accent",
    },
    {
      name: "TensorFlow",
      icon: "🧠",
      description: "机器学习框架",
      color: "badge-info",
    },
    {
      name: "MongoDB",
      icon: "🍃",
      description: "数据存储",
      color: "badge-success",
    },
    {
      name: "Docker",
      icon: "🐳",
      description: "容器化部署",
      color: "badge-warning",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 页面标题 */}
      <div className="hero bg-base-200">
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
      <div className="hero bg-base-100 shadow-xl">
        <div className="hero-content flex-col lg:flex-row gap-8">
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="card-body text-center">
                <div className="text-3xl mb-2">{tech.icon}</div>
                <h4 className="font-semibold mb-1">{tech.name}</h4>
                <p className="text-sm text-base-content/70 mb-2">
                  {tech.description}
                </p>
                <div className={`badge ${tech.color}`}>技术栈</div>
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
                  <div className="bg-neutral text-neutral-content rounded-full w-24">
                    <span className="text-3xl">{member.avatar}</span>
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
          <div className="stat-value text-primary">2020</div>
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
          <div className="stat-value text-secondary">50K+</div>
          <div className="stat-desc">遍布全国各地</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-accent">
            <svg
              xmlns="https://placehold.co/600x400"
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
          <div className="stat-title">分析准确率</div>
          <div className="stat-value text-accent">98%</div>
          <div className="stat-desc">AI算法优化</div>
        </div>
      </div>
    </div>
  );
}

export default About;
