import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Header from "./components/Header";
import Home from "./pages/Home";
import Register from "./pages/Register";
import theme from "./theme/theme";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
};

export default App;
