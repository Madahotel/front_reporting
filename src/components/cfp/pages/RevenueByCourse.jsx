import React, { useState, useEffect, useMemo, useContext } from "react";
import api from "../../utils/api";
import { UserContext } from "../../context/UserContext";
import { formatMontant } from "../../utils/formatMontant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faEye,
  faArrowUpWideShort,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

const RevenueByCourse = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  // Change activeModuleId to an array to store multiple expanded module IDs
  const [activeModuleIds, setActiveModuleIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [data, setData] = useState({
    modules: [],
    total_price: 0,
    totalProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const years = useMemo(() => {
    const yearsArray = [];
    for (let i = -1; i <= 1; i++) {
      yearsArray.push(currentYear + i);
    }
    return yearsArray.sort((a, b) => b - a);
  }, [currentYear]);

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const { setting } = useContext(UserContext);

  useEffect(() => {
    if (!setting) {
      console.warn("Setting n'est pas encore chargé");
    } else {
      console.log("Setting chargé:", setting);
    }
  }, [setting]);

  const currency = setting?.currency_code || "XOF";
  const [state, setState] = useState({
    customerInput: "",
    customerList: [],
    filteredCustomers: [],
    selectedCustomer: null,
    reportingData: null,
    loading: false,
    error: null,
  });

  const fetchData = async (year) => {
    setLoading(true);
    setError(null);
    setActiveModuleIds([]); // Close all open details when data reloads
    try {
      const response = await api.get(`/cfp/reporting/chiffre/cours/${year}`);
      const backendData = response.data;

      const formattedModules = backendData.modules.map((module) => ({
        ...module,
        // Ajoutez ceci pour uniformiser la clé d'ID si vous préférez utiliser 'id' partout
        id: module.id_module,
        percentage: parseFloat(module.percentage),
        projects: module.projects.map((project) => ({
          ...project,
          cost: parseFloat(project.total_ttc),
          percentage: parseFloat(project.percentage),
          start: project.date_debut,
          end: project.date_fin,
          detail: `https://projets.forma-fusion.com/cfp/projets/${project.idProjet}/detail`,
        })),
      }));

      setData({
        modules: formattedModules,
        total_price: backendData.total_price,
        totalProjects: backendData.totalProjects,
      });

      setData({
        modules: formattedModules,
        total_price: backendData.total_price,
        totalProjects: backendData.totalProjects,
      });
    } catch (err) {
      setError(
        "Impossible de charger les données pour l'année sélectionnée. Veuillez réessayer."
      );
      console.error("Erreur lors de la récupération des données:", err);
    } finally {
      setLoading(false);
    }
  };

  // This function now adds/removes module IDs from the activeModuleIds array
  const toggleModuleDetails = (moduleId) => {
    setActiveModuleIds(
      (prevIds) =>
        prevIds.includes(moduleId)
          ? prevIds.filter((id) => id !== moduleId) // Remove if already present
          : [...prevIds, moduleId] // Add if not present
    );
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedModules = useMemo(() => {
    let sortableModules = [...data.modules];
    if (sortConfig.key) {
      sortableModules.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableModules;
  }, [data.modules, sortConfig]);

  const formatCurrency = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return "0";
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(number)
      .replace(",", " ");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const expandVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  // Alternating colors for sub-tables
  const subTableColors = [
    "bg-blue-50",
    "bg-indigo-50",
    "bg-purple-50",
    "bg-pink-50",
  ];

  if (loading) {
    return (
      <motion.div
        className="flex justify-center items-center min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <motion.p
          className="ml-4 text-lg text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Chargement des données...
        </motion.p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          <FontAwesomeIcon
            icon={faEye}
            className="w-16 h-16 text-red-500 mb-4"
          />
        </motion.div>
        <motion.p
          className="text-xl text-red-700 font-semibold text-center"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          Une erreur est survenue :
        </motion.p>
        <motion.p
          className="text-md text-red-600 mt-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {error}
        </motion.p>
        <motion.button
          onClick={() => fetchData(selectedYear)}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Réessayer
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col w-full h-full p-4 md:p-6 bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col w-full max-w-screen-2xl px-4 md:px-8 mx-auto min-h-screen">
        <div className="w-full h-full">
          <div className="h-[calc(100%-100px)] overflow-auto">
            <motion.div
              className="px-4 pb-6 transition-all duration-300 bg-white rounded-xl shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mt-20 flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
                  Chiffre d'affaires par projet
                </h1>
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="yearSelect"
                    className="text-md font-medium text-gray-700"
                  >
                    Année:
                  </label>
                  <select
                    id="yearSelect"
                    name="yearSelect"
                    className="w-32 px-3 py-2 text-base font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md appearance-none cursor-pointer focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
                    value={selectedYear}
                    onChange={handleYearChange}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <motion.div
                className="overflow-hidden rounded-lg border border-gray-200"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <motion.tr variants={itemVariants}>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg"></th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("name")}
                      >
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={faArrowUpWideShort}
                            className="mr-1 text-gray-400"
                          />
                          <span>Cours</span>
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("projectCount")}
                      >
                        <div className="flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faArrowUpWideShort}
                            className="mr-1 text-gray-400"
                          />
                          <span>Nombre de projet</span>
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("cost")}
                      >
                        <div className="flex items-center justify-end">
                          <FontAwesomeIcon
                            icon={faArrowUpWideShort}
                            className="mr-1 text-gray-400"
                          />
                          <span>Coût</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pourcentage
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                        Détails
                      </th>
                    </motion.tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedModules.map((module, index) => (
                      <React.Fragment key={module.id}>
                        <motion.tr
                          variants={itemVariants}
                          className={`transition-colors duration-200 ${
                            activeModuleIds.includes(module.id)
                              ? "bg-blue-100"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => toggleModuleDetails(module.id)} // Clickable row for details
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {module.module_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {module.projects?.length || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatMontant(module.total_ttc, currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {module.percentage?.toFixed(2) || "0.00"} %
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            <motion.button
                              // Assurez-vous que l'ID utilise module.id après la modification ci-dessus
                              id={`toggleButton-${module.id}`}
                              className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Utilisez module.id car nous l'avons mappé ci-dessus
                                toggleModuleDetails(module.id);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FontAwesomeIcon
                                icon={faArrowDown}
                                // Condition correcte : vérifie si l'ID du module est dans le tableau des IDs actifs
                                className={`transition-transform duration-300 ${
                                  activeModuleIds.includes(module.id)
                                    ? "rotate-180 text-blue-600"
                                    : ""
                                }`}
                              />
                            </motion.button>
                          </td>
                        </motion.tr>

                        <AnimatePresence>
                          {activeModuleIds.includes(module.id) && ( // Check if module.id is in the activeModuleIds array
                            <motion.tr
                              variants={expandVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className={`${
                                subTableColors[index % subTableColors.length]
                              } border-t border-gray-300`}
                            >
                              <td colSpan="6" className="px-0 py-0">
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                  className="px-6 py-4"
                                >
                                  <div className="overflow-hidden rounded-lg border border-gray-300">
                                    <table className="min-w-full divide-y divide-gray-300">
                                      <thead className="bg-gray-200">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            #
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Référence
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Client
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Début - Fin
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Coût
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Pourcentage
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Détails
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-300">
                                        {module.projects?.map(
                                          (project, projectIndex) => (
                                            <motion.tr
                                              key={
                                                project.id_projet ??
                                                `${module.id}-${projectIndex}`
                                              }
                                              initial={{ opacity: 0, y: 10 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              transition={{
                                                delay: projectIndex * 0.05,
                                              }}
                                              className="hover:bg-opacity-80 transition-colors duration-200"
                                            >
                                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {projectIndex + 1}
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {project.project_reference}
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {project.etpName}
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {project.dateDebut} -{" "}
                                                {project.dateFin}
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                                {formatMontant(
                                                  project.cost,
                                                  currency
                                                )}{" "}
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {project.percentage?.toFixed(
                                                  2
                                                ) || "0.00"}{" "}
                                                %
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                                <motion.a
                                                  href={project.detail}
                                                  className="inline-block p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                                  whileHover={{ scale: 1.1 }}
                                                  whileTap={{ scale: 0.95 }}
                                                  target="_blank"
                                                >
                                                  <FontAwesomeIcon
                                                    icon={faEye}
                                                  />
                                                </motion.a>
                                              </td>
                                            </motion.tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </motion.div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <motion.tr variants={itemVariants}>
                      <td
                        colSpan="2"
                        className="px-6 py-3 text-sm font-medium text-gray-900 text-right uppercase"
                      >
                        Total
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 text-center">
                        {data.totalProjects}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatMontant(data.total_price, currency)}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                        100 %
                      </td>
                      <td className="px-6 py-3"></td>
                    </motion.tr>
                  </tfoot>
                </table>
              </motion.div>

              {sortedModules.length === 0 && !loading && (
                <motion.div
                  className="flex flex-col items-center justify-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FontAwesomeIcon
                    icon={faEye}
                    className="w-12 h-12 text-gray-400 mb-4"
                  />
                  <p className="text-lg text-gray-600">
                    Aucun cours trouvé pour l'année sélectionnée
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueByCourse;
