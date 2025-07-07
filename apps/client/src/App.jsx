import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavLayout from "./Layout/NavLayout";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NavLayout />}>
          <Route index element={<Home />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
