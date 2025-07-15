import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheckIcon, ChartBarIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

const HomeSection = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full min-h-screen bg-gradient-to-br from-[#f9f9fb] to-white overflow-hidden px-6 md:px-16 lg:px-24 py-16 lg:py-24">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 animate-float">
        <ChartBarIcon className="w-10 h-10 text-purple-400 opacity-60" />
      </div>
      <div className="absolute bottom-12 right-12 animate-pulse-slow">
        <ShieldCheckIcon className="w-8 h-8 text-purple-500 opacity-40" />
      </div>
      <div className="absolute top-1/3 right-20 w-32 h-32 rounded-full bg-purple-100 opacity-20 blur-xl"></div>

      {/* Illustration Section */}
      <motion.div
        className="flex-1 max-w-md lg:max-w-xl mb-12 md:mb-0 md:pr-8 lg:pr-12"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative">
          <div className="absolute -inset-4 bg-purple-200 rounded-2xl opacity-20 blur-lg"></div>
          <img
            src={`${import.meta.env.BASE_URL}At_the_office.gif`}
            alt="Illustration de gestion de rapports"
            className="relative w-full h-auto rounded-2xl shadow-xl border-4 border-white"
          />
        </div>
      </motion.div>

      {/* Content Section */}
      <motion.div
        className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-md lg:max-w-xl"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="mb-6 text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Optimisez votre gestion <span className="text-purple-600">de rapports</span>
          </h2>

          <p className="mb-8 text-lg md:text-xl text-gray-600 leading-relaxed">
            Générez, consultez et gérez des rapports détaillés sur vos formations,
            apprenants et indicateurs clés. Visualisez les performances, suivez
            les évolutions et exportez les données essentielles pour piloter vos
            actions pédagogiques avec précision.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-purple-600 hover:to-purple-700 group"
            >
              Accéder au reporting
              <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomeSection;