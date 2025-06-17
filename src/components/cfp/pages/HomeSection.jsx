import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheckIcon, ChartBarIcon } from "@heroicons/react/24/solid";

const HomeSection = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen bg-gradient-to-br from-gray-100 to-purple-100 dark:from-gray-900 dark:to-purple-900 overflow-hidden relative">
      {/* Decorative Icons */}
      <div className="absolute top-10 left-10 animate-pulse">
        <ChartBarIcon className="w-8 h-8 text-purple-300 opacity-70" />
      </div>
      <div className="absolute bottom-10 right-10 animate-ping">
        <ChartBarIcon className="w-6 h-6 text-purple-400 opacity-50" />
      </div>

      {/* Main Content */}
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center justify-center text-center px-4 py-10 max-w-2xl"
      >
        <h2 className="mb-3 text-xl font-bold text-gray-800 dark:text-white md:text-3xl tracking-tight text-center">
          Gestion des rapports
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="mb-6 text-base text-gray-700 dark:text-gray-300 md:text-lg"
        >
          Générez, consultez et gérez des rapports détaillés sur vos formations,
          apprenants et indicateurs clés. Visualisez les performances, suivez
          les évolutions et exportez les données essentielles pour piloter vos
          actions pédagogiques avec précision.
        </motion.p>

        <Link
          to="/login"
          className="px-6 py-2 text-sm font-medium text-white bg-[#A462A4] rounded-full shadow-md hover:bg-[#8f4d90] transition duration-200 ease-in-out transform hover:scale-105 active:scale-95"
        >
          Accéder au reporting
        </Link>
      </motion.header>
    </div>
  );
};

export default HomeSection;
