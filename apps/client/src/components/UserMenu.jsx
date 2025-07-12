import { useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [imageError, setImageError] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  // 处理退出登录
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirectUrl: "/login" });
    } catch (error) {
      console.error("退出登录失败:", error);
      setIsSigningOut(false);
    }
  };

  // 处理头像加载错误
  const handleImageError = () => {
    setImageError(true);
  };

  // 获取用户显示名称
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    return "用户";
  };

  // 获取用户头像
  const getUserAvatar = () => {
    if (imageError || !user?.imageUrl) {
      // 使用用户名首字母作为默认头像
      const initials = getDisplayName().charAt(0).toUpperCase();
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-semibold text-lg">
          {initials}
        </div>
      );
    }

    return (
      <img
        alt="用户头像"
        src={user.imageUrl}
        className="object-cover w-10 h-10 rounded-full"
        onError={handleImageError}
      />
    );
  };

  // 格式化邮箱显示
  const getDisplayEmail = () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return "未设置邮箱";

    // 如果邮箱太长，截断显示
    if (email.length > 25) {
      return email.substring(0, 22) + "...";
    }
    return email;
  };

  // 加载状态
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full"></div>
        <div className="hidden md:flex flex-col gap-1">
          <div className="skeleton h-3 w-16"></div>
          <div className="skeleton h-2 w-12"></div>
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!isSignedIn) {
    return (
      <button
        className="btn btn-secondary btn-outline btn-sm"
        onClick={() => navigate("/login")}
      >
        登录 / 注册
      </button>
    );
  }

  return (
    <div className="dropdown dropdown-end">
      {/* 用户头像按钮 */}
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost flex items-center gap-3 hover:bg-primary/10 transition-all duration-200 px-2 group"
      >
        <div className="relative">{getUserAvatar()}</div>

        {/* 桌面端显示用户信息 */}
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium text-base-content line-clamp-1">
            {getDisplayName()}
          </span>
        </div>

        {/* 下拉箭头 */}
        <svg
          className="w-4 h-4 text-base-content/60 transition-transform duration-200 group-focus:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* 下拉菜单 */}
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content mt-3 z-[1] p-3 shadow-xl bg-base-100/95 backdrop-blur-md rounded-box w-72 border border-base-300/20 dropdown-animate-in"
      >
        {/* 用户信息头部 */}
        <li className="mb-3">
          <button
            onClick={() => openUserProfile()}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200"
          >
            <div className="relative">{getUserAvatar()}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base-content truncate">
                {getDisplayName()}
              </div>
              <div className="text-sm text-base-content/70 truncate">
                {user?.primaryEmailAddress?.emailAddress || "未设置邮箱"}
              </div>
              {user?.createdAt && (
                <div className="text-xs text-base-content/50">
                  加入时间:{" "}
                  {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                </div>
              )}
            </div>
          </button>
        </li>

        <div className="divider my-2"></div>

        {/* 退出登录 */}
        <li>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-error/10 hover:text-error transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">🚪</span>
            <div className="flex-1 text-left">
              <div className="font-medium">
                {isSigningOut ? "正在退出..." : "退出登录"}
              </div>
              <div className="text-xs text-base-content/60">
                安全退出当前账户
              </div>
            </div>
            {isSigningOut && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default UserMenu;
