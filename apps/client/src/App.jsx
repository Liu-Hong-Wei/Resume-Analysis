import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavLayout from "./Layout/NavLayout";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";
import About from "./pages/About";
import Chat from "./pages/Chat";
import TestChat from "./pages/TestChat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NavLayout />}>
          <Route index element={<Home />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="chat" element={<Chat />} />
          <Route path="test" element={<TestChat />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
