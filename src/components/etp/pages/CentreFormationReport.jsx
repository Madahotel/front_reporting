import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import ExportButtons from "../../boutons/ExportButtons ";
import Select from "react-select"; // Import de React-Select
import makeAnimated from "react-select/animated"; // Pour les animations de React-Select
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faTimes,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons"; // Icônes pour les filtres et le tri

const animatedComponents = makeAnimated();

const CentreFormationReport = () => {
  // --- États du composant ---
  const [allFormationsData, setAllFormationsData] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [exportError, setExportError] = useState(null);

  // --- Nouveaux États pour les filtres multi-sélection ---
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCfps, setSelectedCfps] = useState([]); // Pour le filtre par Centre de Formation
  const [selectedFormationTypes, setSelectedFormationTypes] = useState([]); // Pour le filtre par Type de Formation (project_type)
  const [selectedStatuses, setSelectedStatuses] = useState([]); // Pour le filtre par Statut (project_status)
  const [selectedLocations, setSelectedLocations] = useState([]); // Pour le filtre par Lieu (salle_name + salle_quartier)

  // --- Références ---
  const searchRef = useRef(null);
  const tableBodyRef = useRef(null);

  // --- États de pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- Effets ---

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calculateItemsPerPage = useCallback(() => {
    if (!tableBodyRef.current) return;

    const headerAndFormHeight = 250; // Estimation de la hauteur de l'en-tête et du formulaire
    const footerHeight = 70; // Estimation de la hauteur du pied de page
    const rowHeight = 48; // Hauteur moyenne d'une ligne de tableau

    const availableHeight =
      window.innerHeight - headerAndFormHeight - footerHeight;
    const calculatedItems = Math.max(
      5,
      Math.floor(availableHeight / rowHeight)
    );

    setItemsPerPage((prevItemsPerPage) => {
      if (prevItemsPerPage !== calculatedItems) {
        setCurrentPage(1); // Réinitialiser la page si le nombre d'éléments par page change
      }
      return calculatedItems;
    });
  }, []);

  useEffect(() => {
    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);
    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, [calculateItemsPerPage]);

  const fetchAllFormations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/etp/reporting/client`);
      const data =
        response.data && response.data.all_learner
          ? response.data.all_learner
          : response.data;

      if (data && Array.isArray(data)) {
        // Ajouter un ID unique à chaque formation si elles n'en ont pas déjà un
        const dataWithIds = data.map((item, index) => ({
          ...item,
          uniqueId: item.id || `${item.emp_matricule}-${index}-${Date.now()}`,
        }));

        setAllFormationsData(dataWithIds);
        setFilteredFormations(dataWithIds); // Initialiser les données filtrées avec toutes les données
      } else {
        setAllFormationsData([]);
        setFilteredFormations([]);
        console.warn(
          "La réponse de l'API ne contenait pas un tableau pour 'all_learner'. Reçu:",
          response
        );
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des formations:", err);
      setError("Échec du chargement des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllFormations();
  }, [fetchAllFormations]);

  // --- Options pour les filtres multi-sélection (useMemo) ---
  const cfpOptions = useMemo(() => {
    const uniqueCfps = new Set();
    allFormationsData.forEach((item) => {
      if (item.cfp_name) {
        uniqueCfps.add(item.cfp_name);
      }
    });
    return Array.from(uniqueCfps).map((name) => ({ value: name, label: name }));
  }, [allFormationsData]);

  const formationTypeOptions = useMemo(() => {
    const uniqueTypes = new Set();
    allFormationsData.forEach((item) => {
      if (item.project_type) {
        uniqueTypes.add(item.project_type);
      }
    });
    return Array.from(uniqueTypes).map((type) => ({ value: type, label: type }));
  }, [allFormationsData]);

  const statusOptions = useMemo(() => {
    const uniqueStatuses = new Set();
    allFormationsData.forEach((item) => {
      if (item.project_status) {
        uniqueStatuses.add(item.project_status);
      }
    });
    return Array.from(uniqueStatuses).map((status) => ({ value: status, label: status }));
  }, [allFormationsData]);

  const locationOptions = useMemo(() => {
    const uniqueLocations = new Set();
    allFormationsData.forEach((item) => {
      if (item.salle_name || item.salle_quartier) {
        const locationString = `${item.salle_name || ''}, ${item.salle_quartier || ''}`.trim();
        if (locationString) {
          uniqueLocations.add(locationString);
        }
      }
    });
    return Array.from(uniqueLocations).map((loc) => ({ value: loc, label: loc }));
  }, [allFormationsData]);


  // --- Logique de filtrage et de recherche ---
  useEffect(() => {
    if (!allFormationsData.length && !loading) {
      setFilteredFormations([]);
      return;
    }

    const applyFilters = () => {
      let currentFiltered = allFormationsData;

      // Filtrer par terme de recherche (Nom, Prénom, Matricule, Module)
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        currentFiltered = currentFiltered.filter(
          (formation) =>
            (formation.emp_name &&
              formation.emp_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (formation.emp_firstname &&
              formation.emp_firstname.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (formation.emp_matricule &&
              formation.emp_matricule.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (formation.module_name &&
              formation.module_name.toLowerCase().includes(lowerCaseSearchTerm))
        );
      }

      // Filtrer par Centres de Formation (CFP)
      if (selectedCfps.length > 0) {
        const selectedCfpValues = selectedCfps.map(f => f.value);
        currentFiltered = currentFiltered.filter(
          (formation) => formation.cfp_name && selectedCfpValues.includes(formation.cfp_name)
        );
      }

      // Filtrer par Type de Formation (project_type)
      if (selectedFormationTypes.length > 0) {
        const selectedTypeValues = selectedFormationTypes.map(t => t.value);
        currentFiltered = currentFiltered.filter(
          (formation) => formation.project_type && selectedTypeValues.includes(formation.project_type)
        );
      }

      // Filtrer par Statut (project_status)
      if (selectedStatuses.length > 0) {
        const selectedStatusValues = selectedStatuses.map(s => s.value);
        currentFiltered = currentFiltered.filter(
          (formation) => formation.project_status && selectedStatusValues.includes(formation.project_status)
        );
      }

      // Filtrer par Lieu (salle_name + salle_quartier)
      if (selectedLocations.length > 0) {
        const selectedLocationValues = selectedLocations.map(l => l.value);
        currentFiltered = currentFiltered.filter(
          (formation) => {
            const locationString = `${formation.salle_name || ''}, ${formation.salle_quartier || ''}`.trim();
            return locationString && selectedLocationValues.includes(locationString);
          }
        );
      }

      setFilteredFormations(currentFiltered);
      setCurrentPage(1); // Réinitialiser la pagination après un filtrage
    };

    const handler = setTimeout(() => {
      applyFilters();
    }, 300); // Délais pour éviter des re-calculs trop fréquents lors de la saisie

    return () => {
      clearTimeout(handler);
    };
  }, [
    searchTerm,
    selectedCfps,
    selectedFormationTypes,
    selectedStatuses,
    selectedLocations,
    allFormationsData,
    loading,
  ]);

  // Logique pour les résultats de recherche instantanée (pour le champ de texte)
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const lowerTerm = searchTerm.toLowerCase();
    const results = allFormationsData
      .filter(
        (f) =>
          `${f.emp_name || ""} ${f.emp_firstname || ""}`
            .toLowerCase()
            .includes(lowerTerm) ||
          (f.emp_matricule && f.emp_matricule.toLowerCase().includes(lowerTerm))
      )
      .slice(0, 5); // Limiter à 5 résultats pour la suggestion

    setSearchResults(results);
    setShowResults(results.length > 0);
  }, [searchTerm, allFormationsData]);

  // --- Gestionnaires d'événements ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Afficher les résultats si le terme de recherche est suffisamment long et qu'il y a des résultats
    setShowResults(e.target.value.length > 1 && searchResults.length > 0);
  };

  const handleApprenantSelect = (apprenant) => {
    setSearchTerm(`${apprenant.emp_name || ''} ${apprenant.emp_firstname || ''}`.trim());
    setShowResults(false);
    // Pas besoin de setCurrentPage(1) ici, car l'useEffect de filtrage s'en chargera
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Le filtrage est déjà géré par l'useEffect, donc cette fonction peut être vide ou déclencher un re-fetch si nécessaire
  };

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedCfps([]);
    setSelectedFormationTypes([]);
    setSelectedStatuses([]);
    setSelectedLocations([]);
    setCurrentPage(1);
    setShowFilters(false); // Cacher les filtres après réinitialisation
  };

  // Compteur de filtres actifs
  const totalActiveFilters = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCfps.length > 0) count++;
    if (selectedFormationTypes.length > 0) count++;
    if (selectedStatuses.length > 0) count++;
    if (selectedLocations.length > 0) count++;
    return count;
  }, [searchTerm, selectedCfps, selectedFormationTypes, selectedStatuses, selectedLocations]);

  // --- Logique de pagination ---
  const totalPages = Math.ceil(filteredFormations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFormations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    const tableElement = document.getElementById("formations-table");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // --- Variants Framer Motion ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // CSS classes for table headers and cells
  const headerClass =
    "px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap";
  const cellClass = "px-3 py-3 whitespace-nowrap text-sm text-gray-700";

  // Display loading message
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
        <motion.div
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#7D3C7D]"
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
      </div>
    );
  }

  // Display data fetching error message
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-xl text-red-600">
        <FontAwesomeIcon icon={faTimes} className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-center">{error}</p>
        <motion.button
          onClick={fetchAllFormations}
          className="mt-6 px-6 py-2 bg-[#7D3C7D] text-white rounded-md hover:bg-[#6B2D6B] focus:outline-none focus:ring-2 focus:ring-[#7D3C7D] focus:ring-opacity-50 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Réessayer
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4 mx-auto gap-y-4 max-w-full items-center mt-20">
      {/* Section du formulaire de filtre */}
      <motion.div
        className="flex flex-col md:flex-row items-center justify-between w-full gap-4 p-4 bg-white rounded-xl shadow-lg z-20 sticky top-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Champ de recherche pour l'apprenant */}
        <div className="w-full md:w-auto flex-grow relative" ref={searchRef}>
          <label htmlFor="name_appr" className="sr-only">
            Rechercher un apprenant
          </label>
          <div className="relative">
            <input
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              type="text"
              id="name_appr"
              placeholder="Rechercher un apprenant (Nom, Prénom, Matricule...)"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchTerm.length > 1 && searchResults.length > 0) {
                  setShowResults(true);
                }
              }}
              aria-label="Rechercher un apprenant par nom, prénom ou matricule"
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
            <AnimatePresence>
              {showResults && searchResults.length > 0 && (
                <motion.div
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {searchResults.map((apprenant) => (
                    <div
                      key={apprenant.uniqueId}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleApprenantSelect(apprenant)}
                    >
                      <div className="font-medium">
                        {apprenant.emp_name} {apprenant.emp_firstname}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {apprenant.emp_matricule}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-wrap justify-end items-center gap-2 w-full md:w-auto">
          {/* Filter Toggle Button */}
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

          {/* Reset Filters Button */}
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

          {/* Export Buttons */}
          <ExportButtons
            xlEndpoint="/etp/reporting/exportXl/cl"
            pdfEndpoint="/etp/reporting/exportPdf/cl"
            xlFileName="FormationETP.xlsx"
            pdfFileName="reportingformationETP.pdf"
            data={filteredFormations} // Utiliser les données filtrées pour l'export
            onError={setExportError}
          />
        </div>
      </motion.div>

      {/* Filter Options Section */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-white rounded-xl shadow-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 z-10"
          >
            {/* Filter by Centre de Formation (CFP) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Centre de Formation
              </label>
              <Select
                isMulti
                options={cfpOptions}
                value={selectedCfps}
                onChange={setSelectedCfps}
                placeholder="Sélectionner CFP..."
                components={animatedComponents}
                className="text-sm"
                classNamePrefix="select"
                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
              />
            </div>

            {/* Filter by Type de Formation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de Formation
              </label>
              <Select
                isMulti
                options={formationTypeOptions}
                value={selectedFormationTypes}
                onChange={setSelectedFormationTypes}
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

            {/* Filter by Lieu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu
              </label>
              <Select
                isMulti
                options={locationOptions}
                value={selectedLocations}
                onChange={setSelectedLocations}
                placeholder="Sélectionner lieux..."
                components={animatedComponents}
                className="text-sm"
                classNamePrefix="select"
                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Error Message Display */}
      {exportError && (
        <div className="text-red-600 text-center mb-4">{exportError}</div>
      )}

      {/* Data Table */}
      <div className="w-full overflow-x-auto max-w-full bg-white rounded-md shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className={headerClass}>
                Centre
              </th>
              <th scope="col" className={headerClass}>
                Fonction
              </th>
              <th scope="col" className={headerClass}>
                Matricule
              </th>
              <th scope="col" className={headerClass}>
                Nom
              </th>
              <th scope="col" className={headerClass}>
                Formation
              </th>
              <th scope="col" className={headerClass}>
                Type
              </th>
              <th scope="col" className={headerClass}>
                Statut
              </th>
              <th scope="col" className={headerClass}>
                Lieu
              </th>
              <th scope="col" className={headerClass}>
                Début
              </th>
              <th scope="col" className={headerClass}>
                Fin
              </th>
              <th scope="col" className={headerClass + " text-center"}>
                Durée
              </th>
            </tr>
          </thead>
          <tbody
            className="bg-white divide-y divide-gray-200"
            aria-live="polite"
            ref={tableBodyRef}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.tr
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td
                    colSpan="11"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-[#7D3C7D] border-t-transparent rounded-full"
                      />
                      <span>Chargement en cours...</span>
                    </motion.div>
                  </td>
                </motion.tr>
              ) : error ? (
                <motion.tr
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td
                    colSpan="11"
                    className="px-6 py-4 text-center text-sm font-medium text-red-500"
                  >
                    {error}
                  </td>
                </motion.tr>
              ) : currentItems.length > 0 ? (
                <>
                  {currentItems.map((formation) => (
                    <motion.tr
                      key={formation.uniqueId}
                      className="hover:bg-gray-50"
                      variants={itemVariants}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      transition={{ duration: 0.2 }}
                    >
                      <td className={cellClass}>
                        {formation.cfp_name || "--"}
                      </td>
                      <td
                        className={`text-center px-3 py-2 whitespace-normal text-xs ${
                          formation.emp_fonction &&
                          formation.emp_fonction === "default_function"
                            ? "bg-gray-200"
                            : ""
                        }`}
                      >
                        {formation.emp_fonction &&
                        formation.emp_fonction !== "default_function"
                          ? formation.emp_fonction
                          : "--"}
                      </td>
                      <td className={cellClass}>
                        {formation.emp_matricule || "--"}
                      </td>
                      <td className={cellClass}>{`${
                        formation.emp_name || ""
                      } ${formation.emp_firstname || ""}`.trim() || "--"}</td>
                      <td className={cellClass}>
                        {formation.module_name || "--"}
                      </td>
                      <td
                        className={`px-3 py-3 whitespace-nowrap text-sm 
                          ${
                            formation.project_type === "Intra"
                              ? " text-blue-500"
                              : ""
                          }
                          ${
                            formation.project_type === "Inter"
                              ? " text-green-500"
                              : ""
                          }
                          ${
                            formation.project_type === "Externe"
                              ? "text-red-500"
                              : ""
                          }
                      `}
                      >
                        {formation.project_type || "--"}
                      </td>
                      <td className={cellClass}>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            formation.project_status === "Terminé"
                              ? "bg-green-100 text-green-800"
                              : formation.project_status === "En cours"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {formation.project_status || "--"}
                        </span>
                      </td>
                      <td className={cellClass}>
                        {`${formation.salle_name || ""}, ${
                          formation.salle_quartier || ""
                        }`.trim() || "--"}
                      </td>
                      <td className={cellClass}>
                        {formation.dateDebut || "--"}
                      </td>
                      <td className={cellClass}>{formation.dateFin || "--"}</td>
                      <td className={cellClass + " text-center"}>
                        {formation.dureeH !== undefined &&
                        formation.dureeH !== null
                          ? `${formation.dureeH} h`
                          : "--"}
                      </td>
                    </motion.tr>
                  ))}
                  {/* Remplir les lignes vides pour maintenir la hauteur du tableau */}
                  {Array.from({
                    length: itemsPerPage - currentItems.length,
                  }).map((_, i) => (
                    <tr key={`empty-row-${i}`} className="h-12">
                      <td colSpan="11" className="px-3 py-3 text-transparent">
                        .
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <motion.tr
                  key="no-data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td
                    colSpan="11"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Aucune donnée disponible avec les filtres actuels.
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Contrôles de pagination */}
      {filteredFormations.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 gap-2">
          <div className="text-sm text-gray-600">
            {filteredFormations.length} résultat
            {filteredFormations.length !== 1 ? "s" : ""}
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
                            ? "bg-[#7D3C7D] text-white"
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
  );
};

export default CentreFormationReport;
