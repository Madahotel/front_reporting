import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  const isAuthenticated = !!token;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      const isTokenValid = true;
      if (isTokenValid) {
        setToken(storedToken);
      } else {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        logout();
      }
    } else {
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    toast.success("Connexion réussie !");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast("Déconnecté", { icon: "👋" });
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
