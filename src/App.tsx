import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };
  useEffect(() => {
    const auth = localStorage.getItem("auth_token");
    if (auth) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="App">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            fontWeight: "500",
          },
          success: {
            duration: 3000,
            style: {
              background: "#10B981",
              color: "#fff",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "#EF4444",
              color: "#fff",
            },
          },
        }}
      />
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
