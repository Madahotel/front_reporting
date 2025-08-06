import React, { useState, useEffect, useMemo, useContext } from "react";
import api from "../../utils/api";
import { UserContext } from "../../context/UserContext";
import { formatMontant } from "../../utils/formatMontant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faEye,
  faArrowUpWideShort,
  faFilter,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

const RevenueByCourse = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeModuleIds, setActiveModuleIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [data, setData] = useState({
    modules: [],
    total_price: 0,
    totalProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCourses, setSelectedCourses] = useState([]);

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

  const fetchData = async (year) => {
    setLoading(true);
    setError(null);
    setActiveModuleIds([]);
    try {
      const response = await api.get(`/cfp/reporting/chiffre/cours/${year}`);
      const backendData = response.data;

      const formattedModules = backendData.modules.map((module) => ({
        ...module,
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
    } catch (err) {
      setError(
        "Impossible de charger les données pour l'année sélectionnée. Veuillez réessayer."
      );
      console.error("Erreur lors de la récupération des données:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleDetails = (moduleId) => {
    setActiveModuleIds((prevIds) =>
      prevIds.includes(moduleId)
        ? prevIds.filter((id) => id !== moduleId)
        : [...prevIds, moduleId]
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

  const toggleCourseSelection = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilter("all");
    setSelectedCourses([]);
  };

  const filteredAndSortedModules = useMemo(() => {
    let filteredModules = [...data.modules];

    // Apply search filter
    if (searchTerm) {
      filteredModules = filteredModules.filter((module) =>
        module.module_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply active filter
    if (activeFilter === "withProjects") {
      filteredModules = filteredModules.filter(
        (module) => module.projects?.length > 0
      );
    } else if (activeFilter === "withoutProjects") {
      filteredModules = filteredModules.filter(
        (module) => !module.projects || module.projects.length === 0
      );
    }

    // Apply course selection filter
    if (selectedCourses.length > 0) {
      filteredModules = filteredModules.filter((module) =>
        selectedCourses.includes(module.id)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredModules.sort((a, b) => {
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

    return filteredModules;
  }, [data.modules, searchTerm, activeFilter, selectedCourses, sortConfig]);

  // Calculate filtered totals
  const filteredTotals = useMemo(() => {
    const totalPrice = filteredAndSortedModules.reduce(
      (sum, module) => sum + parseFloat(module.total_ttc || 0),
      0
    );
    const totalProjects = filteredAndSortedModules.reduce(
      (sum, module) => sum + (module.projects?.length || 0),
      0
    );

    return { totalPrice, totalProjects };
  }, [filteredAndSortedModules]);

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
              <div className="mt-20 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-gray-800">
                    Chiffre d'affaires par projet
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Analyse détaillée des revenus par cours et projet
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="text-gray-400"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher un cours..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <FontAwesomeIcon
                          icon={faTimes}
                          className="text-gray-400 hover:text-gray-600"
                        />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <label
                      htmlFor="yearSelect"
                      className="text-sm font-medium text-gray-700 whitespace-nowrap"
                    >
                      Année:
                    </label>
                    <select
                      id="yearSelect"
                      name="yearSelect"
                      className="w-24 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md appearance-none cursor-pointer focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
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
              </div>

              {/* Filters Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faFilter}
                        className="text-gray-500 mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Filtres:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setActiveFilter("all")}
                        className={`px-3 py-1 text-sm rounded-md ${
                          activeFilter === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Tous
                      </button>
                      <button
                        onClick={() => setActiveFilter("withProjects")}
                        className={`px-3 py-1 text-sm rounded-md ${
                          activeFilter === "withProjects"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Avec projets
                      </button>
                      <button
                        onClick={() => setActiveFilter("withoutProjects")}
                        className={`px-3 py-1 text-sm rounded-md ${
                          activeFilter === "withoutProjects"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Sans projets
                      </button>
                    </div>
                  </div>
                  {(searchTerm || activeFilter !== "all" || selectedCourses.length > 0) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-1" />
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>

                {/* Course Selection Filter */}
                {data.modules.length > 0 && (
                  <div className="mt-4">
                    <details className="group">
                      <summary className="flex items-center justify-between p-2 cursor-pointer text-sm font-medium text-gray-700">
                        <span>Filtrer par cours spécifiques</span>
                        <FontAwesomeIcon
                          icon={faArrowDown}
                          className="w-4 h-4 text-gray-500 transition-transform duration-200 group-open:rotate-180"
                        />
                      </summary>
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200 max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {data.modules.map((module) => (
                            <div
                              key={module.id}
                              className="flex items-center"
                            >
                              <input
                                type="checkbox"
                                id={`course-${module.id}`}
                                checked={selectedCourses.includes(module.id)}
                                onChange={() => toggleCourseSelection(module.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`course-${module.id}`}
                                className="ml-2 text-sm text-gray-700 truncate"
                                title={module.module_name}
                              >
                                {module.module_name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  </div>
                )}
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
                        onClick={() => requestSort("module_name")}
                      >
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={faArrowUpWideShort}
                            className={`mr-1 ${
                              sortConfig.key === "module_name"
                                ? "text-blue-500"
                                : "text-gray-400"
                            }`}
                          />
                          <span>Cours</span>
                          {sortConfig.key === "module_name" && (
                            <span className="ml-1 text-xs text-blue-500">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("projects.length")}
                      >
                        <div className="flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faArrowUpWideShort}
                            className={`mr-1 ${
                              sortConfig.key === "projects.length"
                                ? "text-blue-500"
                                : "text-gray-400"
                            }`}
                          />
                          <span>Nombre de projet</span>
                          {sortConfig.key === "projects.length" && (
                            <span className="ml-1 text-xs text-blue-500">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("total_ttc")}
                      >
                        <div className="flex items-center justify-end">
                          <FontAwesomeIcon
                            icon={faArrowUpWideShort}
                            className={`mr-1 ${
                              sortConfig.key === "total_ttc"
                                ? "text-blue-500"
                                : "text-gray-400"
                            }`}
                          />
                          <span>Coût</span>
                          {sortConfig.key === "total_ttc" && (
                            <span className="ml-1 text-xs text-blue-500">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
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
                    {filteredAndSortedModules.length > 0 ? (
                      filteredAndSortedModules.map((module, index) => (
                        <React.Fragment key={module.id}>
                          <motion.tr
                            variants={itemVariants}
                            className={`transition-colors duration-200 ${
                              activeModuleIds.includes(module.id)
                                ? "bg-blue-100"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => toggleModuleDetails(module.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                {selectedCourses.includes(module.id) && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                )}
                                {module.module_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              <span
                                className={`px-2 py-1 rounded-full ${
                                  module.projects?.length > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {module.projects?.length || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatMontant(module.total_ttc, currency)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              <span
                                className={`${
                                  parseFloat(module.percentage || 0) > 0
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {module.percentage?.toFixed(2) || "0.00"} %
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              <motion.button
                                id={`toggleButton-${module.id}`}
                                className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleModuleDetails(module.id);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FontAwesomeIcon
                                  icon={faArrowDown}
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
                            {activeModuleIds.includes(module.id) && (
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
                                          {module.projects?.length > 0 ? (
                                            module.projects.map(
                                              (project, projectIndex) => (
                                                <motion.tr
                                                  key={
                                                    project.id_projet ??
                                                    `${module.id}-${projectIndex}`
                                                  }
                                                  initial={{
                                                    opacity: 0,
                                                    y: 10,
                                                  }}
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
                                                  <td
                                                    className={`px-4 py-2 whitespace-nowrap text-sm ${
                                                      project.etpName ===
                                                      "Pas de client"
                                                        ? "text-red-500 font-semibold"
                                                        : "text-gray-900"
                                                    }`}
                                                  >
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
                                                      rel="noopener noreferrer"
                                                    >
                                                      <FontAwesomeIcon
                                                        icon={faEye}
                                                      />
                                                    </motion.a>
                                                  </td>
                                                </motion.tr>
                                              )
                                            )
                                          ) : (
                                            <tr>
                                              <td
                                                colSpan="7"
                                                className="px-4 py-4 text-center text-sm text-gray-500"
                                              >
                                                Aucun projet associé à ce cours
                                              </td>
                                            </tr>
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
                      ))
                    ) : (
                      <motion.tr
                        variants={itemVariants}
                        className="hover:bg-gray-50"
                      >
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          Aucun cours ne correspond à vos critères de recherche
                        </td>
                      </motion.tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <motion.tr variants={itemVariants}>
                      <td
                        colSpan="2"
                        className="px-6 py-3 text-sm font-medium text-gray-900 text-right uppercase"
                      >
                        Total filtré
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 text-center">
                        {filteredTotals.totalProjects}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatMontant(filteredTotals.totalPrice, currency)}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                        {filteredAndSortedModules.length > 0
                          ? (
                              (filteredTotals.totalPrice / data.total_price) *
                              100
                            ).toFixed(2)
                          : "0.00"}{" "}
                        %
                      </td>
                      <td className="px-6 py-3"></td>
                    </motion.tr>
                    {filteredAndSortedModules.length !== data.modules.length && (
                      <motion.tr variants={itemVariants}>
                        <td
                          colSpan="2"
                          className="px-6 py-3 text-sm font-medium text-gray-900 text-right uppercase"
                        >
                          Total général
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
                    )}
                  </tfoot>
                </table>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueByCourse;