import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";

// Composant de carte métrique optimisé
const MetricCard = ({
  title,
  value,
  unit = "",
  icon: IconComponent,
  color = "indigo",
}) => {
  const colorClasses = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      iconBg: "bg-indigo-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      iconBg: "bg-purple-100",
    },
    blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" },
    pink: { bg: "bg-pink-50", text: "text-pink-600", iconBg: "bg-pink-100" },
  };

  const { bg, text, iconBg } = colorClasses[color];

  return (
    <motion.div
      whileHover={{
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 10 },
      }}
      className={`${bg} rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
          <motion.p
            className={`text-xl font-bold ${text}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {value}{" "}
            {unit && (
              <span className="text-xs font-normal text-gray-400">{unit}</span>
            )}
          </motion.p>
        </div>
        {IconComponent && (
          <motion.div
            className={`${iconBg} p-2 rounded-lg`}
            whileHover={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.6 }}
          >
            <IconComponent className="h-5 w-5 text-current" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Icons as separate components for better tree-shaking
const UsersIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const UserCheckIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const CurrencyEuroIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CashIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const WarningIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const ReportingRevenue = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("current");

  const getCurrentYear = useCallback(() => new Date().getFullYear(), []);
  const getPreviousYear = useCallback(
    () => getCurrentYear() - 1,
    [getCurrentYear]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/etp/reporting/chiffre");
        setData(response.data);
      } catch (e) {
        setError(e.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = useCallback((value) => {
    if (typeof value !== "number" || isNaN(value)) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
    }).format(value);
  }, []);

  const displayData =
    selectedYear === "current"
      ? {
          total_trained: data?.total_trained,
          unique_trained: data?.unique_trained,
          total_YTD: data?.total_YTD,
          cost_by_employee: data?.cost_by_employee,
          monthly_finished: data?.finished_data,
          monthly_forecast: data?.forecast_data,
          monthly_students: data?.histogram_data,
          year_title: `${getCurrentYear()}`,
        }
      : {
          total_trained: data?.last_total_trained,
          unique_trained: data?.last_unique_trained,
          total_YTD: data?.last_year_YTD,
          cost_by_employee: data?.last_cost_by_employee,
          monthly_finished: data?.last_year_prices,
          monthly_forecast: Array(12).fill(0),
          monthly_students: Array(12).fill(0),
          year_title: `${getPreviousYear()}`,
        };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50"
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
            transition: {
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            },
          }}
          className="h-16 w-16 rounded-full border-4 border-indigo-500 border-t-transparent"
        />
      </motion.div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="max-w-md w-full p-6 bg-white rounded-2xl shadow-xl text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              transition: { repeat: Infinity, duration: 2 },
            }}
            className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4"
          >
            <WarningIcon className="h-8 w-8 text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">
            {error || "Aucune donnée disponible"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen mt-30"
    >
      <motion.div
        layout
        className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header with smooth gradient animation */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 60,
            damping: 12,
            delay: 0.2,
          }}
          className="bg-[#A462A4] hover:bg-[#A462A4b9] px-6 py-4 text-white"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl font-bold">Tableau de Bord</h1>
              <p className="mt-2 opacity-90">
                Analyse des performances de formation
              </p>
            </motion.div>

            <motion.div
              className="flex gap-3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedYear("current")}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  selectedYear === "current"
                    ? "bg-white text-indigo-600 shadow-lg"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                {getCurrentYear()}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedYear("previous")}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  selectedYear === "previous"
                    ? "bg-white text-indigo-600 shadow-lg"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                {getPreviousYear()}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="p-6 md:p-8">
          {/* Key metrics with staggered animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Indicateurs Clés -{" "}
              <span className="text-indigo-600">{displayData.year_title}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  title: "Total formés",
                  value: displayData.total_trained,
                  unit: "apprenants",
                  icon: UsersIcon,
                  color: "purple",
                },
                {
                  title: "Formés uniques",
                  value: displayData.unique_trained,
                  unit: "apprenants",
                  icon: UserCheckIcon,
                  color: "indigo",
                },
                {
                  title: "Coût total",
                  value: formatCurrency(displayData.total_YTD),
                  icon: CurrencyEuroIcon,
                  color: "blue",
                },
                {
                  title: "Coût par employé",
                  value: formatCurrency(displayData.cost_by_employee),
                  icon: CashIcon,
                  color: "pink",
                },
              ].map((metric, i) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <MetricCard {...metric} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Monthly table with smooth transitions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Performances Mensuelles -{" "}
              <span className="text-indigo-600">{displayData.year_title}</span>
            </h2>

            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <motion.table
                className="min-w-full table-fixed divide-y divide-gray-200"
                layout
              >
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Mois",
                      "Données finales",
                      "Prévisions",
                      "Apprenants",
                    ].map((header, i) => (
                      <th
                        key={header}
                        className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${
                          i === 0 ? "text-left" : "text-right"
                        } text-gray-500`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence mode="wait">
                    {data.months.map((month, index) => (
                      <motion.tr
                        key={`${month}-${selectedYear}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.03,
                        }}
                        className="hover:bg-gray-50"
                        whileHover={{ scale: 1.005 }}
                      >
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                          {month}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatCurrency(
                            displayData.monthly_finished?.[index] || 0
                          )}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {displayData.monthly_forecast?.[index] === "null"
                            ? "0 MGA"
                            : formatCurrency(
                                displayData.monthly_forecast[index] || 0
                              )}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {displayData.monthly_students[index] || 0} apprenants
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </motion.table>
            </div>
          </motion.div>

          {/* Notifications with attention-grabbing animation */}
          {data.notifications?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="mt-8"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Notifications
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {data.notifications.map((notification, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: {
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 300,
                        },
                      }}
                      whileHover={{ x: 5 }}
                      className="flex items-start p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          transition: { repeat: Infinity, duration: 1.5 },
                        }}
                      >
                        <WarningIcon className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                      </motion.div>
                      <p className="text-yellow-800 text-sm">
                        {notification.message}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReportingRevenue;
