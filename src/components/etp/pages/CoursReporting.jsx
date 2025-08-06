import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../../utils/api";
import { FaFilter, FaHome, FaChartBar, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import ExportButtons from "../../boutons/ExportButtons ";
import Select from "react-select"; // Import React-Select
import makeAnimated from "react-select/animated"; // For animated select options
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons"; // For reset icon

const animatedComponents = makeAnimated();

const CoursReporting = () => {
  // --- Component States ---
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportError, setExportError] = useState(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // General search input

  // Multi-select filter states
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedSalles, setSelectedSalles] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedEnterprises, setSelectedEnterprises] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page

  // Refs
  const tableBodyRef = useRef(null); // Used for dynamic itemsPerPage calculation
  const searchInputRef = useRef(null); // For handling click outside search results

  // --- Effects ---

  // Handle click outside for search results dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        // setShowResults(false); // No longer needed as search is part of main filter
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Dynamic items per page calculation (optional, but good for responsiveness)
  const calculateItemsPerPage = useCallback(() => {
    if (!tableBodyRef.current) return;

    const headerHeight = 150; // Approximate height of header and filter section
    const footerHeight = 80; // Approximate height of pagination footer
    const rowHeight = 48; // Approximate height of each table row

    const availableHeight = window.innerHeight - headerHeight - footerHeight;
    const calculatedItems = Math.max(5, Math.floor(availableHeight / rowHeight));

    setItemsPerPage((prevItemsPerPage) => {
      if (prevItemsPerPage !== calculatedItems) {
        setCurrentPage(1); // Reset page if items per page changes
      }
      return calculatedItems;
    });
  }, []);

  useEffect(() => {
    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);
    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, [calculateItemsPerPage]);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/etp/reporting/cours");
        const data = response.data;

        if (!data || !Array.isArray(data.all_learner)) {
          throw new Error(
            "Données de l'API mal formées : 'all_learner' manquant ou non un tableau."
          );
        }

        // Add a unique ID to each report item for React keys
        const dataWithIds = data.all_learner.map((item, index) => ({
          ...item,
          uniqueId: item.id || `${item.emp_matricule}-${item.module_name}-${index}-${Date.now()}`,
        }));

        setAllReports(dataWithIds);
        setFilteredReports(dataWithIds); // Initialize filtered reports
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          `Impossible de charger les données. Veuillez réessayer. Détails: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // --- Options for Multi-select Filters (useMemo for performance) ---
  const moduleOptions = useMemo(() => {
    const uniqueModules = new Set();
    allReports.forEach((item) => {
      if (item.module_name) {
        uniqueModules.add(item.module_name);
      }
    });
    return Array.from(uniqueModules).map((name) => ({ value: name, label: name }));
  }, [allReports]);

  const nameOptions = useMemo(() => {
    const uniqueNames = new Set();
    allReports.forEach((item) => {
      const fullName = `${item.emp_name || ""} ${item.emp_firstname || ""}`.trim();
      if (fullName) {
        uniqueNames.add(fullName);
      }
    });
    return Array.from(uniqueNames).map((name) => ({ value: name, label: name }));
  }, [allReports]);

  const salleOptions = useMemo(() => {
    const uniqueSalles = new Set();
    allReports.forEach((item) => {
      const salleString = `${item.salle_name || ""} (${item.salle_quartier || ""})`.trim();
      if (salleString && salleString !== "()") {
        uniqueSalles.add(salleString);
      }
    });
    return Array.from(uniqueSalles).map((salle) => ({ value: salle, label: salle }));
  }, [allReports]);

  const typeOptions = useMemo(() => {
    const uniqueTypes = new Set();
    allReports.forEach((item) => {
      if (item.project_type) {
        uniqueTypes.add(item.project_type);
      }
    });
    return Array.from(uniqueTypes).map((type) => ({ value: type, label: type }));
  }, [allReports]);

  const statusOptions = useMemo(() => {
    const uniqueStatuses = new Set();
    allReports.forEach((item) => {
      if (item.project_status) {
        uniqueStatuses.add(item.project_status);
      }
    });
    return Array.from(uniqueStatuses).map((status) => ({ value: status, label: status }));
  }, [allReports]);

  const enterpriseOptions = useMemo(() => {
    const uniqueEnterprises = new Set();
    allReports.forEach((item) => {
      if (item.etp_name) {
        uniqueEnterprises.add(item.etp_name);
      }
    });
    return Array.from(uniqueEnterprises).map((name) => ({ value: name, label: name }));
  }, [allReports]);

  // --- Filtering Logic ---
  useEffect(() => {
    if (!allReports.length && !loading) {
      setFilteredReports([]);
      return;
    }

    const applyFilters = () => {
      let currentFiltered = [...allReports];

      // Filter by Modules
      if (selectedModules.length > 0) {
        const values = selectedModules.map((m) => m.value);
        currentFiltered = currentFiltered.filter(
          (report) => report.module_name && values.includes(report.module_name)
        );
      }

      // Filter by Names
      if (selectedNames.length > 0) {
        const values = selectedNames.map((n) => n.value);
        currentFiltered = currentFiltered.filter((report) => {
          const fullName = `${report.emp_name || ""} ${report.emp_firstname || ""}`.trim();
          return fullName && values.includes(fullName);
        });
      }

      // Filter by Salles
      if (selectedSalles.length > 0) {
        const values = selectedSalles.map((s) => s.value);
        currentFiltered = currentFiltered.filter((report) => {
          const salleString = `${report.salle_name || ""} (${report.salle_quartier || ""})`.trim();
          return salleString && values.includes(salleString);
        });
      }

      // Filter by Types
      if (selectedTypes.length > 0) {
        const values = selectedTypes.map((t) => t.value);
        currentFiltered = currentFiltered.filter(
          (report) => report.project_type && values.includes(report.project_type)
        );
      }

      // Filter by Statuses
      if (selectedStatuses.length > 0) {
        const values = selectedStatuses.map((s) => s.value);
        currentFiltered = currentFiltered.filter(
          (report) => report.project_status && values.includes(report.project_status)
        );
      }

      // Filter by Enterprises
      if (selectedEnterprises.length > 0) {
        const values = selectedEnterprises.map((e) => e.value);
        currentFiltered = currentFiltered.filter(
          (report) => report.etp_name && values.includes(report.etp_name)
        );
      }

      // Apply general search term (if any)
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        currentFiltered = currentFiltered.filter(
          (report) =>
            (report.module_name && report.module_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (report.emp_name && report.emp_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (report.emp_firstname && report.emp_firstname.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (report.emp_matricule && report.emp_matricule.toString().toLowerCase().includes(lowerCaseSearchTerm)) ||
            (report.salle_name && report.salle_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (report.salle_quartier && report.salle_quartier.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (report.etp_name && report.etp_name.toLowerCase().includes(lowerCaseSearchTerm))
        );
      }

      setFilteredReports(currentFiltered);
      setCurrentPage(1); // Reset pagination after filter changes
    };

    const handler = setTimeout(() => {
      applyFilters();
    }, 300); // Debounce for better performance

    return () => {
      clearTimeout(handler);
    };
  }, [
    allReports,
    searchTerm,
    selectedModules,
    selectedNames,
    selectedSalles,
    selectedTypes,
    selectedStatuses,
    selectedEnterprises,
    loading,
  ]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    const tableElement = document.getElementById("reports-table");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // --- Event Handlers ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedModules([]);
    setSelectedNames([]);
    setSelectedSalles([]);
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedEnterprises([]);
    setCurrentPage(1);
    setShowFilters(false); // Hide filters after reset
  };

  // Count active filters for the badge
  const totalActiveFilters = useMemo(() => {
    let count = 0;
    if (searchTerm) count++; // Search term is always visible, but counts if active
    if (selectedModules.length > 0) count++;
    if (selectedNames.length > 0) count++;
    if (selectedSalles.length > 0) count++;
    if (selectedTypes.length > 0) count++;
    if (selectedStatuses.length > 0) count++;
    if (selectedEnterprises.length > 0) count++;
    return count;
  }, [
    searchTerm,
    selectedModules,
    selectedNames,
    selectedSalles,
    selectedTypes,
    selectedStatuses,
    selectedEnterprises,
  ]);

  // --- Framer Motion Variants ---
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-blue-500 text-4xl mr-3" />
        <span className="text-gray-600">Chargement des données...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-8 text-center"
        role="alert"
      >
        <p className="font-bold">Erreur</p>
        <p>{error}</p>
        <motion.button
          onClick={() => window.location.reload()} // Simple reload to retry
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Recharger la page
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4 mx-auto xl:p-0 gap-y-4 xl:container">
      {/* Header Section */}
      <div className="bg-white py-4 shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-800">
                <FaChartBar className="inline mr-2 text-blue-500" />
                Reporting par formation
              </h1>
            </div>
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a
                    href="#"
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    <FaHome className="mr-2" />
                    Accueil
                  </a>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-sm font-medium text-gray-500">
                      Reporting par formation
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-6 md:px-0">
        <motion.div
          className="bg-white rounded-lg shadow-md overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-[#A462A4] py-4 px-6 text-white flex justify-between items-center">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Liste des rapports de formation
            </h2>
            <div className="flex gap-2">
              <ExportButtons
                xlEndpoint="/etp/reporting/exportXlCours"
                pdfEndpoint="/etp/reporting/exportPdfCours"
                xlFileName="FormationETP.xlsx"
                pdfFileName="reportingformationETP.pdf"
                data={filteredReports} // Export filtered data
                onError={setExportError}
              />
            </div>
          </div>

          <div className="p-6">
            {/* Filter Controls Section */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 mb-6">
              {/* General Search Input */}
              <div className="w-full md:w-auto flex-grow relative" ref={searchInputRef}>
                <input
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  type="text"
                  placeholder="Rechercher tout (Module, Nom, Matricule, Salle, Entreprise...)"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Rechercher dans tous les champs"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Filter Toggle & Reset Buttons */}
              <div className="flex flex-wrap justify-end items-center gap-2 w-full md:w-auto">
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
                  <FaFilter />
                  <span>Filtres</span>
                  {totalActiveFilters > 0 && (
                    <AnimatePresence>
                      <motion.span
                        className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        {totalActiveFilters}
                      </motion.span>
                    </AnimatePresence>
                  )}
                </motion.button>

                {totalActiveFilters > 0 && (
                  <motion.button
                    onClick={resetAllFilters}
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

            {/* Collapsible Filter Dropdowns */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full bg-white rounded-xl shadow-inner p-6 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border border-gray-100"
                >
                  {/* Filter by Modules */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modules
                    </label>
                    <Select
                      isMulti
                      options={moduleOptions}
                      value={selectedModules}
                      onChange={setSelectedModules}
                      placeholder="Sélectionner modules..."
                      components={animatedComponents}
                      className="text-sm"
                      classNamePrefix="select"
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>

                  {/* Filter by Nom et Prénom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom et Prénom
                    </label>
                    <Select
                      isMulti
                      options={nameOptions}
                      value={selectedNames}
                      onChange={setSelectedNames}
                      placeholder="Sélectionner noms..."
                      components={animatedComponents}
                      className="text-sm"
                      classNamePrefix="select"
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>

                  {/* Filter by Salle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salle
                    </label>
                    <Select
                      isMulti
                      options={salleOptions}
                      value={selectedSalles}
                      onChange={setSelectedSalles}
                      placeholder="Sélectionner salles..."
                      components={animatedComponents}
                      className="text-sm"
                      classNamePrefix="select"
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>

                  {/* Filter by Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <Select
                      isMulti
                      options={typeOptions}
                      value={selectedTypes}
                      onChange={setSelectedTypes}
                      placeholder="Sélectionner types..."
                      components={animatedComponents}
                      className="text-sm"
                      classNamePrefix="select"
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>

                  {/* Filter by Statut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <Select
                      isMulti
                      options={statusOptions}
                      value={selectedStatuses}
                      onChange={setSelectedStatuses}
                      placeholder="Sélectionner statuts..."
                      components={animatedComponents}
                      className="text-sm"
                      classNamePrefix="select"
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>

                  {/* Filter by Entreprise */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entreprise
                    </label>
                    <Select
                      isMulti
                      options={enterpriseOptions}
                      value={selectedEnterprises}
                      onChange={setSelectedEnterprises}
                      placeholder="Sélectionner entreprises..."
                      components={animatedComponents}
                      className="text-sm"
                      classNamePrefix="select"
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Display Export Error if any */}
            {exportError && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                role="alert"
              >
                <p className="font-bold">Erreur d'exportation</p>
                <p>{exportError}</p>
              </div>
            )}

            {/* Table */}
            <motion.div
              className="w-full overflow-x-auto rounded-md shadow-lg border border-gray-100"
              variants={itemVariants}
            >
              <table id="reports-table" className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Module
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Matricule
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Nom et Prénom
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Fonction
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Salle
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Type
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Statut
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Entreprise
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Dates (Début - Fin)
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Durée (H)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200" ref={tableBodyRef}>
                  <AnimatePresence mode="wait">
                    {currentItems.length > 0 ? (
                      currentItems.map((report) => (
                        <motion.tr
                          key={report.uniqueId}
                          className="hover:bg-gray-50"
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={{ duration: 0.2 }}
                        >
                          <td className="px-3 py-2 whitespace-normal text-xs text-gray-900">
                            {report.module_name || "--"}
                          </td>
                          <td className="px-3 py-2 whitespace-normal text-xs text-gray-500">
                            {report.emp_matricule || "--"}
                          </td>
                          <td className="px-3 py-2 whitespace-normal text-xs text-gray-900">
                            {`${report.emp_name || ""} ${report.emp_firstname || ""}`.trim() || "--"}
                          </td>
                          <td
                            className={`text-center px-3 py-2 whitespace-normal text-xs ${
                              report.emp_fonction &&
                              report.emp_fonction === "default_function"
                                ? "text-gray-500"
                                : "text-red-500"
                            }`}
                          >
                            {report.emp_fonction && report.emp_fonction === "default_function" ? report.emp_fonction : "Non défini"}
                          </td>
                          <td className="px-3 py-2 whitespace-normal text-xs text-gray-500">
                            {`${report.salle_name || ""} (${report.salle_quartier || ""})`.trim() || "--"}
                          </td>
                          <td
                            className={`px-3 py-3 whitespace-nowrap text-sm 
                            ${report.project_type === "Intra" ? " text-blue-500" : ""}
                            ${report.project_type === "Inter" ? " text-green-500" : ""}
                            ${report.project_type === "Externe" ? "text-red-500" : ""}
                          `}
                          >
                            {report.project_type || "--"}
                          </td>
                          <td className="px-3 py-2 whitespace-normal text-xs">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                report.project_status === "Terminé"
                                  ? "bg-green-100 text-green-800"
                                  : report.project_status === "En cours"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {report.project_status || "--"}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-normal text-xs text-gray-500">
                            {report.etp_name || "--"}
                          </td>
                          <td className="px-3 py-2 whitespace-normal text-xs text-gray-500">
                            {`${report.dateDebut || "--"} - ${report.dateFin || "--"}`}
                          </td>
                          <td className="px-3 py-2 whitespace-normal text-xs text-gray-500">
                            {report.dureeH !== undefined && report.dureeH !== null ? `${report.dureeH} h` : "--"}
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr variants={itemVariants}>
                        <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
                          <p className="mb-1">Aucun rapport disponible avec les filtres actuels.</p>
                          <p className="text-xs">Veuillez essayer une autre sélection ou vérifier les données.</p>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>

            {/* Pagination Controls */}
            {filteredReports.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 gap-2 mt-4">
                <div className="text-sm text-gray-600">
                  {filteredReports.length} résultat{filteredReports.length !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Précédent
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => {
                        const isVisible =
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 2 && pageNum <= currentPage + 2);

                        const isEllipsis =
                          (pageNum === 2 && currentPage > 3) ||
                          (pageNum === totalPages - 1 && currentPage < totalPages - 2);

                        if (isVisible) {
                          return (
                            <button
                              key={`page-${pageNum}`}
                              onClick={() => paginate(pageNum)}
                              className={`w-8 h-8 flex items-center justify-center text-sm rounded-md ${
                                currentPage === pageNum
                                  ? "bg-[#A462A4] text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (isEllipsis) {
                          return (
                            <span key={`ellipsis-${pageNum}`} className="px-2">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    )}
                  </div>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CoursReporting;
