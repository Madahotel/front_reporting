// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  // Derive isAuthenticated directly from the token's presence
  const isAuthenticated = !!token; 

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      // Idéalement, tu devrais valider le token via une API ici
      // For now, we'll assume it's valid if it exists.
      // In a real application, you'd send this token to your backend
      // to verify its validity and expiration.
      const isTokenValid = true; // This should be replaced with an actual API call
      if (isTokenValid) {
        setToken(storedToken);
      } else {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        logout();
      }
    } else {
      // Only show this toast if it's not the initial load and the user isn't already logging in.
      // You might want to refine when this toast appears to avoid annoying users on every page load.
      // toast("Vous n'êtes pas connecté.", { icon: "⚠️" });
    }
  }, []); // Empty dependency array means this runs once on mount

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    toast.success("Connexion réussie !");
  };

  const logout = () => {
    localStorage.removeItem('token');
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