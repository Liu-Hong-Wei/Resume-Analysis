import { useAuth } from "@clerk/clerk-react";
import Login from "../pages/Login";

/**
 * 受保护的路由组件
 * 只有登录用户才能访问
 */
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  // 如果认证状态还在加载中，显示加载动画
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // 如果用户未登录，使用Clerk的重定向组件
  if (!isSignedIn) {
    return <Login />;
  }

  // 如果用户已登录，渲染子组件
  return children;
};

export default ProtectedRoute;
