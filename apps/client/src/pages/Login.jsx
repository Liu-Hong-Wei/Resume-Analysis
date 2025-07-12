import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const [showHint, setShowHint] = useState(false);

  // 如果用户已登录，重定向到分析页面
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/analysis");
    }
  }, [isLoaded, isSignedIn, navigate]);

  // 显示提示信息
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(true);
    }, 500); // 0.5秒后显示提示

    return () => clearTimeout(timer);
  }, []);

  // 如果还在加载认证状态，显示加载状态
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg mb-4"></span>
          <p className="text-base-content/70">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body text-center">
          <SignedOut>
            <div className="mb-8">
              <div className="avatar placeholder mb-4">
                <div className="bg-gradient-to-r from-primary via-secondary to-accent text-primary-content rounded-xl w-20 h-20 shadow-lg">
                  <span className="text-3xl font-bold">R</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">欢迎使用简历分析系统</h1>
              <p className="text-base-content/70 mb-6">
                登录后即可开始使用AI分析您的简历
              </p>
            </div>

            {/* 登录提示 */}
            {showHint && (
              <div className="alert alert-info mb-6 animate-fade-in transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div>
                  <h3 className="font-bold">快速开始</h3>
                  <div className="text-xs">
                    点击下方按钮即可登录或注册新账户
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {/* 主要登录按钮 */}
                <SignInButton
                  mode="modal"
                  forceRedirectUrl="/analysis"
                  fallbackRedirectUrl="/analysis"
                >
                  <button className="btn btn-primary btn-lg w-full group relative overflow-hidden">
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                      🔐
                    </span>
                    <span className="ml-2">登录 / 注册</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
                </SignInButton>

              {/* 功能特色 */}
              <div className="bg-base-200/50 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-sm mb-3 text-base-content/80">
                  ✨ 系统特色功能
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-base-content/60">
                  <div className="flex items-center gap-1">
                    <span>🤖</span>
                    <span>AI智能分析</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📊</span>
                    <span>详细报告</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💬</span>
                    <span>模拟面试</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📈</span>
                    <span>优化建议</span>
                  </div>
                </div>
              </div>

              {/* 使用条款 */}
              <div className="text-xs text-base-content/50 mt-6">
                <p>使用我们的服务即表示您同意我们的</p>
                <div className="flex justify-center gap-2 mt-1">
                  <button className="link link-primary">服务条款</button>
                  <span>和</span>
                  <button className="link link-primary">隐私政策</button>
                </div>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="mb-8">
              <div className="alert alert-success animate-pulse">
                <span className="text-lg">✅</span>
                <div>
                  <h3 className="font-bold">登录成功！</h3>
                  <div className="text-sm">正在跳转到分析页面...</div>
                </div>
              </div>
              <div className="mt-4">
                <UserButton afterSignOutUrl="/login" />
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate("/analysis")}
                  className="btn btn-primary btn-sm"
                >
                  立即开始分析
                </button>
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default Login;
