import React, { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import api from "../utils/api";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";

const LoginUser = () => {
  const { state } = useLocation();
  const initialEmail = state?.email || "";
  const [email] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { login } = useAuth();

  const handleLoginSuccess = (userData, token, redirectTo) => {
    if (token && userData) {
      login(token); // Stocke le token côté AuthContext
      setUser(userData); // Met à jour le contexte utilisateur

      setSuccess(true);
      setTimeout(() => {
        // Redirection vers la route déterminée par le backend
        if (redirectTo) {
          navigate(`/${redirectTo}`, { replace: true });
        } else {
          // Route de secours si le backend ne spécifie pas de redirection
          navigate("/reporting/formation", { replace: true });
        }
      }, 1200);
    } else {
      setError("Erreur lors de la connexion. Veuillez réessayer.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      // Assure que le statut est 200 et qu'un token est présent
      if (response.status === 200 && response.data.token) {
        handleLoginSuccess(
          response.data.user,
          response.data.token,
          response.data.redirect_to // Récupère la route de redirection du backend
        );
      } else {
        // Gestion des erreurs de réponse API
        setError(response.data.message || "Identifiants invalides.");
      }
    } catch (err) {
      // Gestion des erreurs réseau ou serveur
      setError(
        err.response?.data?.message || "Impossible de contacter le serveur."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-100">
      <motion.div
        className="w-full max-w-md bg-[#f1f1f4] rounded-2xl shadow-xl p-8"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center mb-6">
          <img
            src={`${import.meta.env.BASE_URL}Logo_mark.svg`}
            alt="Logo"
            className="w-24 h-24 mt-2 animate-pulse"
          />
          <h1 className="text-2xl font-extrabold text-[#A462A4] mt-4">
            Entrez votre mot de passe
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Adresse email
            </label>
            <p className="bg-gray-100 p-2 rounded text-gray-800">{email}</p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              className="text-red-600 mb-4 text-sm bg-red-100 border border-red-400 rounded-md p-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: [0, -5, 5, -5, 5, 0] }}
              transition={{ duration: 0.6 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#A462A4] text-white py-2 rounded-md hover:bg-[#924b92] transition flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isLoading ? "Connexion..." : "Connexion"}
          </motion.button>

          {success && (
            <motion.div
              className="mt-6 px-6 py-3 bg-green-100 dark:bg-green-800/20 rounded-xl text-green-700 dark:text-green-300 text-center text-lg font-medium shadow-md flex items-center justify-center space-x-3"
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <HandThumbUpIcon className="w-6 h-6 text-green-500" />
              <span>Connexion réussie</span>
            </motion.div>
          )}

          <div className="text-right mt-3">
            <Link
              to="https://dossiers.forma-fusion.com/resend_password"
              className="text-sm text-[#A462A4] underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </form>

        <p className="pt-6 text-center text-sm text-[#a462a4] underline">
          <Link to="/register">Pas encore de compte ? Inscrivez-vous</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginUser;