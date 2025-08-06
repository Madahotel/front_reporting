import React, { useState, useEffect, useMemo, useContext } from "react";
import api from "../../utils/api"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserContext } from "../../context/UserContext"; 
import { formatMontant } from "../../utils/formatMontant"; 
import {
  faArrowDown,
  faEye,
  faSort,
  faFilter, 
  faTimes, 
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

const RevenueByReference = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeReferenceIds, setActiveReferenceIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [data, setData] = useState({
    references: [], 
    total_price: 0,
    totalProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Nouveaux états pour les filtres de sélection multiple
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState([]); // Pour le filtre par Référence
  const [selectedClients, setSelectedClients] = useState([]); // Pour le filtre par Clients

  const { setting } = useContext(UserContext);
  const currency = setting?.currency_code || "XOF";

  // Générer les années de manière dynamique
  const years = useMemo(() => {
    const yearsArray = [];
    for (let i = currentYear + 2; i >= currentYear - 2; i--) {
      yearsArray.push(i);
    }
    return yearsArray;
  }, [currentYear]);

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const fetchData = async (year) => {
    setLoading(true);
    setError(null);
    setActiveReferenceIds([]); // Réinitialise les détails ouverts lors du changement d'année
    try {
      const response = await api.get(
        `/cfp/reporting/chiffre/reference/${year}`
      );
      const backendData = response.data;

      const formattedReferences = backendData.references.map((reference) => ({
        ...reference,
        id: reference.id,
        percentage: parseFloat(reference.percentage),
        projects: reference.projects.map((project) => ({
          ...project,
          cost: parseFloat(project.total_ttc),
          start: project.dateDebut,
          end: project.dateFin,
          detail: `https://projets.forma-fusion.com/cfp/projets/${project.idProjet}/detail`,
          percentage: parseFloat(project.percentage),
        })),
      }));

      setData({
        references: formattedReferences,
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

  const toggleReferenceDetails = (referenceId) => {
    setActiveReferenceIds(
      (prevIds) =>
        prevIds.includes(referenceId)
          ? prevIds.filter((id) => id !== referenceId) // Supprime si déjà présent
          : [...prevIds, referenceId] // Ajoute si non présent
    );
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return faSort;
    }
    if (sortConfig.direction === "asc") {
      return faSortUp;
    }
    return faSortDown;
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Options pour le filtre "Référence" (basées sur les données brutes)
  const referenceOptions = useMemo(() => {
    return data.references.map((reference) => ({
      value: reference.id,
      label: reference.name,
    }));
  }, [data.references]);

  // Filtrage des données
  const filteredReferences = useMemo(() => {
    if (!data.references) return [];

    return data.references.filter((reference) => {
      // Filtre 1: Références sélectionnées
      const matchesReferences =
        selectedReferences.length === 0 ||
        selectedReferences.some((r) => r.value === reference.id);

      // Filtre 2: Clients sélectionnés
      const matchesClients =
        selectedClients.length === 0 ||
        reference.projects?.some((project) =>
          selectedClients.some((c) => c.value === project.etpName)
        );

      return matchesReferences && matchesClients;
    });
  }, [data.references, selectedReferences, selectedClients]);

  // Options de clients dynamiques (basées sur les références filtrées)
  const clientOptions = useMemo(() => {
    const clients = new Set();
    filteredReferences.forEach((reference) => {
      // Utilise filteredReferences ici
      reference.projects?.forEach((project) => {
        if (project.etpName) {
          clients.add(project.etpName);
        }
      });
    });
    return Array.from(clients).map((client) => ({
      value: client,
      label: client,
    }));
  }, [filteredReferences]); // Dépendance de filteredReferences

  // Tri des données filtrées
  const sortedReferences = useMemo(() => {
    let sortableReferences = [...filteredReferences];
    if (sortConfig.key) {
      sortableReferences.sort((a, b) => {
        let aValue, bValue;

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
    return sortableReferences;
  }, [filteredReferences, sortConfig]);

  const resetFilters = () => {
    setSelectedReferences([]);
    setSelectedClients([]);
  };

  const filteredTotals = useMemo(() => {
    const totalPrice = filteredReferences.reduce(
      (sum, reference) => sum + parseFloat(reference.total_ttc || 0),
      0
    );
    const totalProjects = filteredReferences.reduce(
      (sum, reference) => sum + (reference.count_project || 0),
      0
    );

    return { total_price: totalPrice, totalProjects };
  }, [filteredReferences]);

  // Compteur de filtres actifs
  const activeFiltersCount = [
    selectedReferences.length,
    selectedClients.length,
  ].reduce((a, b) => a + b, 0);

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
            icon={faTimes}
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
      className="flex flex-col w-full h-full p-4 md:p-6 bg-gray-50 min-h-screen mt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col w-full max-w-screen-2xl mx-auto">
        {/* Header avec filtres */}
        <motion.div
          // Augmentation du z-index pour s'assurer que les Select sont au-dessus
          className="bg-white rounded-xl shadow-lg p-6 mb-6 z-20 sticky top-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h1 className="text-xl font-bold text-gray-800 flex-grow">
              Chiffre d'affaires par Référence
            </h1>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faFilter} />
                <span>Filtres</span>
                {activeFiltersCount > 0 && (
                  <AnimatePresence>
                    <motion.span
                      className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                      }}
                    >
                      {activeFiltersCount}
                    </motion.span>
                  </AnimatePresence>
                )}
              </motion.button>

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
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              {activeFiltersCount > 0 && (
                <motion.button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  <span>Réinitialiser</span>
                </motion.button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                // Suppression de 'overflow-hidden' pour permettre aux menus Select de s'afficher correctement
                className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Filtre par Références */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Références
                  </label>
                  <Select
                    isMulti
                    options={referenceOptions}
                    value={selectedReferences}
                    onChange={setSelectedReferences}
                    placeholder="Sélectionner références..."
                    components={animatedComponents}
                    className="text-sm"
                    classNamePrefix="select"
                    // Ajout d'un style pour s'assurer que le menu est toujours visible
                    styles={{
                      menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    }}
                  />
                </div>

                {/* Filtre par Clients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clients
                  </label>
                  <Select
                    isMulti
                    options={clientOptions}
                    value={selectedClients}
                    onChange={setSelectedClients}
                    placeholder="Sélectionner clients..."
                    components={animatedComponents}
                    className="text-sm"
                    classNamePrefix="select"
                    // Ajout d'un style pour s'assurer que le menu est toujours visible
                    styles={{
                      menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Résumé des totaux filtrés */}
        <motion.div
          className="flex justify-between items-center mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {sortedReferences.length}
            </span>{" "}
            référence(s) trouvée(s)
          </p>
          <p className="text-sm font-medium text-gray-700">
            Total filtré:{" "}
            <span className="font-bold text-blue-600">
              {formatMontant(filteredTotals.total_price, currency)}
            </span>{" "}
            ({filteredTotals.totalProjects} projets)
          </p>
        </motion.div>

        {/* Tableau principal */}
        <motion.div
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <motion.tr variants={itemVariants}>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                  #
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("name")}
                >
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={getSortIcon("name")}
                      className={`mr-1 ${
                        sortConfig.key === "name"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span>Référence</span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("projects.length")}
                >
                  <div className="flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={getSortIcon("projects.length")}
                      className={`mr-1 ${
                        sortConfig.key === "projects.length"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span>Projets</span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("total_ttc")}
                >
                  <div className="flex items-center justify-end">
                    <FontAwesomeIcon
                      icon={getSortIcon("total_ttc")}
                      className={`mr-1 ${
                        sortConfig.key === "total_ttc"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span>Coût</span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("percentage")}
                >
                  <div className="flex items-center justify-end">
                    <FontAwesomeIcon
                      icon={getSortIcon("percentage")}
                      className={`mr-1 ${
                        sortConfig.key === "percentage"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span>Pourcentage</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                  Détails
                </th>
              </motion.tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedReferences.map((reference, index) => (
                <React.Fragment key={`${reference.id}-${index}`}>
                  <motion.tr
                    variants={itemVariants}
                    className={`transition-colors duration-200 ${
                      activeReferenceIds.includes(reference.id)
                        ? "bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reference.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {reference.count_project || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatMontant(reference.total_ttc, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {reference.percentage?.toFixed(2) || "0.00"} %
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      <motion.button
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReferenceDetails(reference.id);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FontAwesomeIcon
                          icon={faArrowDown}
                          className={`transition-transform duration-300 ${
                            activeReferenceIds.includes(reference.id)
                              ? "rotate-180 text-blue-600"
                              : ""
                          }`}
                        />
                      </motion.button>
                    </td>
                  </motion.tr>

                  <AnimatePresence>
                    {activeReferenceIds.includes(reference.id) && (
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
                                  {reference.projects?.map(
                                    (project, projectIndex) => (
                                      <motion.tr
                                        key={
                                          project.id_projet ||
                                          `${reference.id}-${projectIndex}`
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
                                          {project.etpName ? (
                                            project.etpName
                                          ) : (
                                            <span className="text-red-500 italic">
                                              Pas de client
                                            </span>
                                          )}
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
                                          {project.percentage?.toFixed(2) ||
                                            "0.00"}{" "}
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
                                            <FontAwesomeIcon icon={faEye} />
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
                  {filteredTotals.totalProjects}
                </td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                  {formatMontant(filteredTotals.total_price, currency)}
                </td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                  {filteredTotals.total_price > 0 ? "100.00" : "0.00"} %
                </td>
                <td className="px-6 py-3"></td>
              </motion.tr>
            </tfoot>
          </table>
          {sortedReferences.length === 0 && !loading && (
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
                Aucun résultat trouvé pour les critères sélectionnés.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RevenueByReference;
