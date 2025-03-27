import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";

const App = () => {
  const [isAuthenticated, _setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="app-container">
        <Header isAuthenticated={isAuthenticated} />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
