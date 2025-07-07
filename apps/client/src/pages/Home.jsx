function Home() {
  const features = [
    {
      icon: "📄",
      title: "智能解析",
      description: "自动识别简历中的关键信息，提取技能、经验等核心要素",
    },
    {
      icon: "📊",
      title: "深度分析",
      description: "基于AI技术对简历进行全面分析，提供专业建议",
    },
    {
      icon: "🎯",
      title: "优化建议",
      description: "针对不同职位需求，提供个性化的简历优化建议",
    },
    {
      icon: "📈",
      title: "效果评估",
      description: "量化分析简历质量，预测求职成功率",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 英雄区域 */}
      <div className="hero min-h-[30vh] bg-gradient-to-r from-primary to-secondary">
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">智能简历分析系统</h1>
            <p className="mb-5">
              运用先进的人工智能技术，为您的简历提供专业、精准的分析和优化建议，
              助您在求职路上脱颖而出
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary">开始分析</button>
              <button className="btn btn-outline btn-secondary">
                了解更多
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 功能特性 */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">核心功能</h2>
          <p className="text-base-content/70 max-w-2xl mx-auto">
            我们提供全方位的简历分析服务，帮助您打造完美的求职简历
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="card-body text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="card-title justify-center">{feature.title}</h3>
                <p className="text-base-content/70">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 统计数据 */}
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
          <div className="stat-title">成功分析案例</div>
          <div className="stat-value text-primary">10,000+</div>
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
          <div className="stat-title">用户满意度</div>
          <div className="stat-value text-secondary">95%</div>
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
          <div className="stat-title">求职成功率提升</div>
          <div className="stat-value text-accent">80%</div>
        </div>
      </div>

      {/* 特色服务 */}
      <div className="hero bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img
            src="https://daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg"
            className="max-w-sm rounded-lg shadow-2xl"
          />
          <div>
            <h1 className="text-5xl font-bold">为什么选择我们？</h1>
            <p className="py-6">
              我们拥有先进的AI技术和专业的分析团队，能够为您提供最准确、最全面的简历分析服务。
              无论您是应届毕业生还是职场老手，我们都能帮助您优化简历，提升求职竞争力。
            </p>
            <button className="btn btn-primary">立即体验</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
