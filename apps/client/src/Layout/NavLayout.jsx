import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import UserMenu from "../components/UserMenu";

function NavLayout() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 监听滚动事件，实现导航栏背景变化效果
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: "首页", icon: "🏠" },
    { path: "/analysis", label: "简历分析", icon: "💬" },
    // { path: "/chat", label: "AI对话", icon: "💬" },
    { path: "/about", label: "关于我们", icon: "ℹ️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* 导航栏 */}
      <div
        className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out navbar-mobile-optimized ${
          isScrolled
            ? "bg-base-100/95 backdrop-blur-md shadow-lg border-b border-base-300/20"
            : "navbar-glass"
        }`}
      >
        <div className="navbar-start">
          {/* 移动端菜单按钮 */}
          <div className="dropdown xl:hidden">
            <div
              tabIndex={0}
              role="button"
              className={`btn btn-ghost btn-sm transition-all duration-200 ${
                isMobileMenuOpen ? "btn-active" : ""
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isMobileMenuOpen ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className={`menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100/95 backdrop-blur-md rounded-box w-64 border border-base-300/20 transition-all duration-300 dropdown-animate-in ${
                isMobileMenuOpen
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
            >
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary ${
                      location.pathname === item.path
                        ? "bg-primary/20 text-primary font-semibold"
                        : "text-base-content/80"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logo */}
          <Link
            to="/"
            className="btn btn-ghost text-xl hover:bg-primary/10 transition-all duration-200"
          >
            <div className="avatar placeholder">
              <div className="bg-gradient-to-r from-primary via-secondary to-accent text-primary-content rounded-xl w-10 h-10 shadow-lg">
                <span className="text-lg font-bold">R</span>
              </div>
            </div>
            <span className="ml-3 font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              简历分析系统
            </span>
          </Link>
        </div>

        {/* 桌面端导航菜单 */}
        <div className="navbar-center hidden xl:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary relative group nav-item-hover ${
                    location.pathname === item.path
                      ? "bg-primary/20 text-primary font-semibold"
                      : "text-base-content/80"
                  }`}
                >
                  <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                  {location.pathname === item.path && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 用户菜单 */}
        <div className="navbar-end">
          <UserMenu />
        </div>
      </div>

      {/* 主要内容区域 */}
      <main className="pt-20 h-screen">
        <div
          className={`mx-auto h-full w-full ${
            location.pathname === "/analysis"
              ? ""
              : "px-4 py-8 max-w-7xl container "
          }`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default NavLayout;
