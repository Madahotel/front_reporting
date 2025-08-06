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

const RevenueByFolder = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeFolderIds, setActiveFolderIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [data, setData] = useState({
    folders: [],
    total_price: 0,
    totalProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Suppression des états de filtre non désirés
  // const [searchTerm, setSearchTerm] = useState("");
  // const [minPercentage, setMinPercentage] = useState("");
  // const [maxPercentage, setMaxPercentage] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);

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
    setActiveFolderIds([]);
    try {
      const response = await api.get(`/cfp/reporting/chiffre/dossier/${year}`);
      const backendData = response.data;

      const formattedFolders = backendData.folders.map((folder) => ({
        ...folder,
        id: folder.id,
        percentage: parseFloat(folder.percentage),
        projects: folder.projects.map((project) => ({
          ...project,
          cost: parseFloat(project.total_ttc),
          start: project.dateDebut,
          end: project.dateFin,
          detail: `https://projets.forma-fusion.com/cfp/projets/${folder.id}/detail`,
          percentage: parseFloat(project.percentage),
        })),
      }));

      setData({
        folders: formattedFolders,
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

  const toggleFoldersDetails = (folderId) => {
    setActiveFolderIds((prevIds) =>
      prevIds.includes(folderId)
        ? prevIds.filter((id) => id !== folderId)
        : [...prevIds, folderId]
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

  // Options pour les filtres (basées sur les données brutes)
  const folderOptions = useMemo(() => {
    return data.folders.map((folder) => ({
      value: folder.id,
      label: folder.name,
    }));
  }, [data.folders]);

  // Filtrage des données - Simplifié pour ne garder que dossiers et clients
  const filteredFolders = useMemo(() => {
    if (!data.folders) return [];

    return data.folders.filter((folder) => {
      // Filtre 1: Dossiers sélectionnés
      const matchesFolders =
        selectedFolders.length === 0 ||
        selectedFolders.some((f) => f.value === folder.id);

      // Filtre 2: Clients sélectionnés
      const matchesClients =
        selectedClients.length === 0 ||
        folder.projects?.some((project) =>
          selectedClients.some((c) => c.value === project.etpName)
        );

      return matchesFolders && matchesClients;
    });
  }, [data.folders, selectedFolders, selectedClients]);

  // Options de clients dynamiques (basées sur les dossiers filtrés)
  const clientOptions = useMemo(() => {
    const clients = new Set();
    filteredFolders.forEach((folder) => {
      folder.projects?.forEach((project) => {
        if (project.etpName) {
          clients.add(project.etpName);
        }
      });
    });
    return Array.from(clients).map((client) => ({
      value: client,
      label: client,
    }));
  }, [filteredFolders]);

  // Tri des données filtrées
  const sortedFolders = useMemo(() => {
    let sortableFolders = [...filteredFolders];
    if (sortConfig.key) {
      sortableFolders.sort((a, b) => {
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
    return sortableFolders;
  }, [filteredFolders, sortConfig]);

  const resetFilters = () => {
    // Suppression de la réinitialisation des filtres supprimés
    // setSearchTerm("");
    // setMinPercentage("");
    // setMaxPercentage("");
    setSelectedFolders([]);
    setSelectedClients([]);
  };

  const filteredTotals = useMemo(() => {
    const totalPrice = filteredFolders.reduce(
      (sum, folder) => sum + parseFloat(folder.total_ttc || 0),
      0
    );
    const totalProjects = filteredFolders.reduce(
      (sum, folder) => sum + (folder.count_project || 0),
      0
    );

    return { total_price: totalPrice, totalProjects };
  }, [filteredFolders]);

  // Mise à jour du compteur de filtres actifs
  const activeFiltersCount = [
    selectedFolders.length,
    selectedClients.length,
  ].reduce((a, b) => a + b, 0);

  // Animations
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
              Chiffre d'affaires par Dossiers
            </h1>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
                transition={{ duration: 0.3 }}
                // Suppression de 'overflow-hidden' pour permettre aux menus Select de s'afficher correctement
                className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Filtre par Dossiers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dossiers
                  </label>
                  <Select
                    isMulti
                    options={folderOptions}
                    value={selectedFolders}
                    onChange={setSelectedFolders}
                    placeholder="Sélectionner dossiers..."
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
              {sortedFolders.length}
            </span>{" "}
            dossier(s) trouvé(s)
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
                    <span>Dossier</span>
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
              {sortedFolders.map((folder, index) => (
                <React.Fragment key={`${folder.id}-${index}`}>
                  <motion.tr
                    variants={itemVariants}
                    className={`transition-colors duration-200 ${
                      activeFolderIds.includes(folder.id)
                        ? "bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {folder.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {folder.count_project || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatMontant(folder.total_ttc, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {folder.percentage?.toFixed(2) || "0.00"} %
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      <motion.button
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFoldersDetails(folder.id);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FontAwesomeIcon
                          icon={faArrowDown}
                          className={`transition-transform duration-300 ${
                            activeFolderIds.includes(folder.id)
                              ? "rotate-180 text-blue-600"
                              : ""
                          }`}
                        />
                      </motion.button>
                    </td>
                  </motion.tr>

                  <AnimatePresence>
                    {activeFolderIds.includes(folder.id) && (
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
                                    <th className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                      #
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                      Projet
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                      Référence
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                      Client
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                      Début - Fin
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                      Coût
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                      Pourcentage
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                      Détails
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-300">
                                  {folder.projects?.map(
                                    (project, projectIndex) => (
                                      <motion.tr
                                        key={
                                          project.id_projet ||
                                          `${folder.id}-${projectIndex}`
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
                                        <td
                                          className="max-w-[10rem] truncate px-2 py-2 text-sm text-gray-700"
                                          title={project.moduleName}
                                        >
                                          {project.moduleName}
                                        </td>
                                        <td
                                          className="max-w-[10rem] truncate px-2 py-2 text-sm text-gray-700"
                                          title={project.project_reference}
                                        >
                                          {project.project_reference}
                                        </td>
                                        <td
                                          className="max-w-[10rem] truncate px-2 py-2 text-sm text-gray-700"
                                          title={project.etpName}
                                        >
                                          {project.etpName ? (
                                            project.etpName
                                          ) : (
                                            <span className="text-red-500">
                                              Pas de Client
                                            </span>
                                          )}
                                        </td>
                                        <td className="max-w-[10rem] truncate px-2 py-2 text-sm text-gray-700">
                                          {project.dateDebut} -{" "}
                                          {project.dateFin}
                                        </td>
                                        <td className="max-w-[10rem] truncate px-2 py-2 text-sm text-gray-700">
                                          {formatMontant(
                                            project.total_ttc,
                                            currency
                                          )}
                                        </td>
                                        <td className="max-w-[10rem] truncate px-2 py-2 text-sm text-gray-700">
                                          {project.percentage?.toFixed(2) ||
                                            "0.00"}{" "}
                                          %
                                        </td>
                                        <td className="max-w-[10rem] truncate px-2 py-2 text-sm text-gray-700">
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
              {sortedFolders.length === 0 && (
                <motion.tr
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500 text-lg"
                  >
                    Aucun dossier trouvé pour les critères sélectionnés
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RevenueByFolder;
