import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavLayout from "./Layout/NavLayout";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";
import About from "./pages/About";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* 登录页面 - 不需要保护 */}
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<NavLayout />}>
          <Route index element={<Home />} />
          <Route
            path="analysis"
            element={
              // 受保护的路由
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            }
          />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
