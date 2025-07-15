import React, { useState, useEffect, useMemo, useContext } from "react";
import api from "../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserContext } from "../../context/UserContext";
import { formatMontant } from "../../utils/formatMontant";
import {
  faArrowDown,
  faEye,
  faSort, // Utiliser une icône de tri générique
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

const RevenueByMonth = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  // Change activeClientId to an array to store multiple expanded client IDs
  const [activeMonthIds, setActiveMonthIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [data, setData] = useState({
    months: [], // Renommé de 'modules' à 'months'
    total_price: 0,
    totalProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const years = useMemo(() => {
    const yearsArray = [];
    // Affiche l'année actuelle, l'année précédente et l'année suivante
    for (let i = -1; i <= 1; i++) {
      yearsArray.push(currentYear + i);
    }
    return yearsArray.sort((a, b) => b - a);
  }, [currentYear]);

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const { setting } = useContext(UserContext);
  const currency = setting?.currency_code || "XOF";
  // Vous n'utilisez pas `state` dans ce composant pour l'instant,
  // donc cette déclaration peut être supprimée si elle n'est pas utilisée ailleurs.
  // const [state, setState] = useState({
  //   customerInput: "",
  //   customerList: [],
  //   filteredCustomers: [],
  //   selectedCustomer: null,
  //   reportingData: null,
  //   loading: false,
  //   error: null,
  // });

  const fetchData = async (year) => {
    setLoading(true);
    setError(null);
    setActiveMonthIds([]);
    try {
      const response = await api.get(`/cfp/reporting/chiffre/mois/${year}`);
      const backendData = response.data;

      const formattedMonths = backendData.months.map((month) => ({
        ...month,
        // Utilise 'monthValue' comme identifiant unique pour le mois,
        // ce qui est correct pour les opérations liées au mois lui-même (comme l'expansion/réduction).
        id: month.monthValue,
        percentage: parseFloat(month.percentage),
        projects: month.projects.map((project) => ({
          ...project,
          cost: parseFloat(project.total_ttc),
          start: project.dateDebut,
          end: project.dateFin,
          // CORRECTION IMPORTANTE ICI :
          // Pour le détail d'un *projet*, l'URL doit utiliser l'ID du *projet* (`project.idProjet`).
          // L'ancienne version utilisait `month.monthValue`, ce qui aurait mené à la page de détail du mois,
          // et non à celle du projet spécifique.
          detail: `https://projets.forma-fusion.com/cfp/projets/${project.idProjet}/detail`,
          percentage: parseFloat(project.percentage),
        })),
      }));

      setData({
        months: formattedMonths,
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

  // Cette fonction ajoute/retire les IDs de mois du tableau activeMonthIds
  const toggleMonthDetails = (monthId) => {
    setActiveMonthIds(
      (prevIds) =>
        prevIds.includes(monthId)
          ? prevIds.filter((id) => id !== monthId) // Supprime si déjà présent
          : [...prevIds, monthId] // Ajoute si non présent
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

  // Tri des mois
  const sortedMonths = useMemo(() => {
    let sortableMonths = [...(data?.months || [])]; // sécurisé
    if (sortConfig.key) {
      sortableMonths.sort((a, b) => {
        let aValue, bValue;

        // Custom sort for project count (reste inchangé car il se base sur .length)
        if (sortConfig.key === "projects.length") {
          aValue = a.projects?.length || 0;
          bValue = b.projects?.length || 0;
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

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
    return sortableMonths;
  }, [data.months, sortConfig]);

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
              <div className="mt-20 flex flex-col md:flex-row justify-between items-center mb-6 ">
                <motion.h1
                  className="text-xl font-bold text-gray-800"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Chiffre d'affaires par Mois
                </motion.h1>
                <motion.div
                  className="flex items-center space-x-2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label
                    htmlFor="yearSelect"
                    className="text-sm font-medium text-gray-700"
                  >
                    Année:
                  </label>
                  <select
                    id="yearSelect"
                    name="yearSelect"
                    className="w-28 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={selectedYear}
                    onChange={handleYearChange}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </motion.div>
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
                        onClick={() => requestSort("month_name")}
                      >
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={faSort}
                            className="mr-1 text-gray-400"
                          />
                          <span>Mois</span>
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("projects.length")}
                      >
                        <div className="flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faSort}
                            className="mr-1 text-gray-400"
                          />
                          <span>Nombre de projet</span>
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("total_ttc")}
                      >
                        <div className="flex items-center justify-end">
                          <FontAwesomeIcon
                            icon={faSort}
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
                    {sortedMonths.map((month, index) => (
                      <React.Fragment key={`${month.monthValue}-${index}`}>
                        {" "}
                        {/* Correction ici */}
                        <motion.tr
                          variants={itemVariants}
                          className={`transition-colors duration-200 ${
                            activeMonthIds.includes(month.monthValue) // Correction ici
                              ? "bg-blue-100"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {month.month_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {month.count_project || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatMontant(month.total_ttc, currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {month.percentage?.toFixed(2) || "0.00"} %
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            <motion.button
                              id={`toggleButton-${month.monthValue}`} // Correction ici
                              className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMonthDetails(month.monthValue); // Correction ici
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FontAwesomeIcon
                                icon={faArrowDown}
                                className={`transition-transform duration-300 ${
                                  activeMonthIds.includes(month.monthValue) // Correction ici
                                    ? "rotate-180 text-blue-600"
                                    : ""
                                }`}
                              />
                            </motion.button>
                          </td>
                        </motion.tr>
                        <AnimatePresence>
                          {activeMonthIds.includes(month.monthValue) && ( // Correction ici
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
                                            Projet
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Référence
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Client
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Début - Fin
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Coût
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Pourcentage
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Voir Détails
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-300">
                                        {month.projects?.map(
                                          (project, projectIndex) => (
                                            <motion.tr
                                              key={
                                                project.idProjet ||
                                                `${month.monthValue}-${projectIndex}` // Correction ici
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
                                                {project.moduleName}
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {project.project_reference}
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {project.etpName}
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-left">
                                                {project.dateDebut} -{" "}
                                                {project.dateFin}
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                                {formatMontant(
                                                  project.total_ttc,
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
                                                  rel="noopener noreferrer"
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
                        {formatCurrency(data.total_price)}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                        100 %
                      </td>
                      <td className="px-6 py-3"></td>
                    </motion.tr>
                  </tfoot>
                </table>
              </motion.div>

              {sortedMonths.length === 0 && !loading && (
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
                    Aucun Mois trouvé pour l'année sélectionnée
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

export default RevenueByMonth;
