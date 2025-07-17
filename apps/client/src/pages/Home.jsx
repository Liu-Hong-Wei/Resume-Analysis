import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const features = [
    {
      icon: "📊",
      title: "简历评估",
      description: "基于AI技术深度分析简历内容，识别关键信息并提供专业改进建议",
    },
    {
      icon: "✏️",
      title: "简历生成",
      description: "根据您的需求和背景，智能生成个性化的简历内容和结构",
    },
    {
      icon: "🤖",
      title: "模拟面试",
      description: "基于简历内容进行AI模拟面试，帮助您提前准备面试问题",
    },
    {
      icon: "💬",
      title: "智能对话",
      description: "支持多轮对话交互，深入分析简历并提供个性化建议",
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      <div className="hero min-h-[50vh] rounded-2xl bg-gradient-to-tl from-primary/90 to-secondary/90">
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-lg">
            <h1 className="mb-5 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-accent to-primary">
              智简对话
            </h1>
            <h3 className="mb-5 text-3xl font-bold">你的简历分析助手</h3>
            <div className="mb-5 text-lg">
              基于先进的大模型，对您的简历进行深度分析，并提供专业的改进建议，
              还可以通过模拟面试，提前准备面试问题，让您的求职之路更加顺畅。
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/login")}
              >
                开始分析
              </button>
              <button
                className="btn btn-outline btn-secondary"
                onClick={() => navigate("/about")}
              >
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
            我们提供三种专业的简历分析服务，满足您不同的求职需求
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
          <div className="stat-title">支持文件格式</div>
          <div className="stat-value text-primary">PDF/图片</div>
          <div className="stat-desc">最大20MB</div>
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
          <div className="stat-title">分析类型</div>
          <div className="stat-value text-secondary">3种</div>
          <div className="stat-desc">评估/生成/面试</div>
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
          <div className="stat-title">技术架构</div>
          <div className="stat-value text-accent">现代化</div>
          <div className="stat-desc">React + Node.js</div>
        </div>
      </div>

      {/* 特色服务 */}
      <div className="hero bg-base-200 rounded-2xl p-8">
        <div className="hero-content flex-col lg:flex-row-reverse ">
          <div className="w-full flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold">为什么选择我们？</h1>
            <p className="py-6 text-center">
              我们采用先进的大模型技术，
              为您提供稳定、高效的简历分析服务。支持流式响应，实时获取分析结果，
              让您的简历分析体验更加流畅。
            </p>
            <div className="space-y-3 mb-6 flex flex-row justify-around w-full">
              <div className="flex items-center gap-3">
                <div className="badge badge-primary badge-sm"></div>
                <span>基于Coze AI的智能分析</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="badge badge-secondary badge-sm"></div>
                <span>支持多种文件格式上传</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="badge badge-accent badge-sm"></div>
                <span>实时流式响应技术</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-lg mr"
              onClick={() => navigate("/login")}
            >
              立即体验
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
