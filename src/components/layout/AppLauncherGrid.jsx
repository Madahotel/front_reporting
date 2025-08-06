import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";

const AppIcon = ({ iconUrl, label, colorClass }) => (
  <div
    className={`w-12 h-12 flex items-center justify-center rounded-xl ${colorClass} mb-2 transition-all hover:shadow-lg`}
  >
    {iconUrl ? (
      <img
        src={iconUrl}
        alt={label}
        className="w-8 h-8 object-contain p-1"
        style={{ backgroundColor: "transparent" }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            label
          )}&background=ffffff&color=000000&bold=true`;
        }}
      />
    ) : (
      <span className="text-black text-lg font-bold">
        {label.charAt(0).toUpperCase()}
      </span>
    )}
  </div>
);

const AppLauncherGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  const categoryConfig = {
    PÉDAGOGIE: {
      colorClass: "bg-blue-500 hover:bg-blue-600",
      textClass: "text-blue-700",
    },
    ADMINISTRATION: {
      colorClass: "bg-green-500 hover:bg-green-600",
      textClass: "text-green-700",
    },
    LOGISTIQUE: {
      colorClass: "bg-purple-500 hover:bg-purple-600",
      textClass: "text-purple-700",
    },
    "ANALYTICS & ÉVALUATION": {
      colorClass: "bg-orange-400 hover:bg-orange-600",
      textClass: "text-orange-700",
    },
    AUTRES: {
      colorClass: "bg-gray-500 hover:bg-gray-600",
      bgClass: "bg-gray-50",
      textClass: "text-gray-700",
    },
  };

  useEffect(() => {
    const fetchAppLaunchers = async () => {
      try {
        const response = await api.get("/app_launcher");
        if (!response.data) throw new Error("Aucune donnée reçue de l'API");

        const responseData = response.data.data || [];
        if (!Array.isArray(responseData))
          throw new Error("Format de données invalide");

        const formattedCategories = responseData.map((category) => {
          const config = categoryConfig[category.name] || categoryConfig["AUTRES"];

          return {
            name: category.name,
            bgClass: config.bgClass,
            textClass: config.textClass,
            items: Array.isArray(category.items)
              ? category.items.map((item) => ({
                  id: `${item.label}-${item.link}`,
                  label: item.label,
                  href: item.link,
                  icon: item.icone
                    ? `https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/${item.icone}`
                    : null,
                  colorClass: config.colorClass,
                }))
              : [],
          };
        });

        setCategories(formattedCategories);
      } catch (err) {
        console.error("Erreur de chargement:", err);
        setError(err.message || "Erreur lors du chargement des applications");
      } finally {
        setLoading(false);
      }
    };

    fetchAppLaunchers();
  }, []);

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent border-purple-500"></div>
        <p className="text-gray-600 text-sm">Chargement des applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 rounded-lg bg-red-50">
        <p className="text-red-600 font-medium text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-4 -mt-7">
      <AnimatePresence>
        {filteredCategories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            {searchQuery
              ? `Aucune application trouvée pour "${searchQuery}"`
              : "Aucune application disponible."}
          </motion.div>
        ) : (
          filteredCategories.map((category) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div
                className={`px-4 py-3 rounded-lg sticky top-0 z-10 -mt-2 ${category.bgClass}`}
              >
                <h3
                  className={`text-xs text-center font-semibold ${category.textClass}`}
                >
                  {category.name}
                </h3>
              </div>

     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-1 gap-y -mt-8">



                {category.items.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      setSelectedApp(item.id);
                      if (item.href) {
                        window.open(item.href, "_blank", "noopener,noreferrer");
                      }
                    }}
                    whileHover={{ y: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center p-4 rounded-xl transition-all${
                      selectedApp === item.id
                        ? "bg-blue-100 border border-blue-200 shadow-xs"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <AppIcon
                      iconUrl={item.icon}
                      label={item.label}
                      colorClass={item.colorClass}
                    />
                    <span className="text-[10px] font-medium text-gray-700 text-center">
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppLauncherGrid;
