import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import Register from "./pages/Register";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="app-container">
        <Header isAuthenticated={isAuthenticated} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/registrarse"
            element={<Register setIsAuthenticated={setIsAuthenticated} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
