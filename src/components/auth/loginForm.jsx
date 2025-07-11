import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null); // Gère l'affichage d'un message d'erreur
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      navigate("/dossiers");
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Réinitialise l'erreur avant la requête

    try {
      const response = await api.post("/check-email", { email }); // Correction de la requête API

      if (response.data.exists) {
        navigate("/login/user", { state: { email } }); // L'email existe, redirection vers login
      } else {
        navigate("/register", { state: { email } });
      }
    } catch (error) {
      setError("Une erreur est survenue. Veuillez réessayer."); // Gestion des erreurs
      console.error("Erreur de vérification d'email:", error);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-100 py-8 px-4">
      <motion.div
        className="w-full max-w-md bg-[#f1f1f4] rounded-2xl shadow-xl p-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="flex flex-col items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <img
            src={`${import.meta.env.BASE_URL}Logo_mark.svg`}
            alt="Logo"
            className="w-24 h-24 mt-2 animate-pulse"
          />
          <h1 className="text-2xl font-extrabold text-purple-600 mt-4">
            Connectez-vous
          </h1>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6 space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-semibold mb-2"
            >
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre-email@exemple.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A462A4] transition"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p> // Affichage d'erreur
          )}

          <motion.button
            type="submit"
            className="cursor-pointer w-full bg-purple-700 text-white font-semibold py-2 rounded-lg hover:bg-[#924b92] transition duration-300 flex items-center justify-center gap-2 shadow-md"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Continuer
            <motion.span
              className="inline-block"
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, repeatType: "loop", duration: 1.2, ease: "easeInOut", delay: 0.2 }}
            >
              ➡️
            </motion.span>
          </motion.button>
        </form>

        <p className="pt-6 text-center text-sm text-[#a462a4] underline hover:text-[#9d4ed4] transition-all duration-300">
          <a href="/register">Pas encore de compte ? Inscrivez-vous</a>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginForm;
