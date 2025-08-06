import React, { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import ExportButtons from "../../boutons/ExportButtons ";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faTimes,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

const animatedComponents = makeAnimated();

const ReportingEmploye = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportError, setExportError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  // Renommé de selectedFunctions à selectedFullNames
  const [selectedFullNames, setSelectedFullNames] = useState([]); // For emp_name + emp_firstname
  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]); // For project_type
  const [selectedProjectStatuses, setSelectedProjectStatuses] = useState([]); // For project_status

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("etp/reporting/apprenant");

        if (response.data && Array.isArray(response.data.all_learner)) {
          setData(response.data.all_learner);
        } else {
          setData([]);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset current page to 1 whenever search term or sort/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortColumn, sortDirection, selectedFullNames, selectedProjectTypes, selectedProjectStatuses]);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle table column sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Get the sort indicator (arrow up/down) for table headers
  const getSortIndicator = (column) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? (
        <FontAwesomeIcon icon={faSortUp} className="ml-1 text-blue-500" />
      ) : (
        <FontAwesomeIcon icon={faSortDown} className="ml-1 text-blue-500" />
      );
    }
    return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400" />;
  };

  // Options for filters - Now for Full Names
  const fullNameOptions = useMemo(() => {
    const uniqueFullNames = new Set();
    data.forEach((item) => {
      if (item.emp_name || item.emp_firstname) {
        const fullName = `${item.emp_name || ''} ${item.emp_firstname || ''}`.trim();
        if (fullName) {
          uniqueFullNames.add(fullName);
        }
      }
    });
    return Array.from(uniqueFullNames).map((name) => ({
      value: name,
      label: name,
    }));
  }, [data]);

  const projectTypeOptions = useMemo(() => {
    const uniqueTypes = new Set();
    data.forEach((item) => {
      if (item.project_type) {
        uniqueTypes.add(item.project_type);
      }
    });
    return Array.from(uniqueTypes).map((type) => ({
      value: type,
      label: type,
    }));
  }, [data]);

  const projectStatusOptions = useMemo(() => {
    const uniqueStatuses = new Set();
    data.forEach((item) => {
      if (item.project_status) {
        uniqueStatuses.add(item.project_status);
      }
    });
    return Array.from(uniqueStatuses).map((status) => ({
      value: status,
      label: status,
    }));
  }, [data]);

  // Filter and Sort the data
  const filteredAndSortedData = useMemo(() => {
    let currentFilteredData = [...data];

    // Apply search term filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFilteredData = currentFilteredData.filter(
        (item) =>
          (item.emp_name &&
            item.emp_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.emp_firstname &&
            item.emp_firstname.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.module_name &&
            item.module_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.emp_matricule &&
            item.emp_matricule.toString().includes(lowerCaseSearchTerm))
      );
    }

    // Apply full name filter
    if (selectedFullNames.length > 0) {
      const values = selectedFullNames.map((f) => f.value);
      currentFilteredData = currentFilteredData.filter((item) => {
        const fullName = `${item.emp_name || ''} ${item.emp_firstname || ''}`.trim();
        return fullName && values.includes(fullName);
      });
    }

    // Apply project type filter
    if (selectedProjectTypes.length > 0) {
      const values = selectedProjectTypes.map((t) => t.value);
      currentFilteredData = currentFilteredData.filter((item) =>
        item.project_type && values.includes(item.project_type)
      );
    }

    // Apply project status filter
    if (selectedProjectStatuses.length > 0) {
      const values = selectedProjectStatuses.map((s) => s.value);
      currentFilteredData = currentFilteredData.filter((item) =>
        item.project_status && values.includes(item.project_status)
      );
    }

    // Apply sorting
    if (sortColumn) {
      currentFilteredData.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        if (aValue === null || aValue === undefined) return sortDirection === "asc" ? 1 : -1;
        if (bValue === null || bValue === undefined) return sortDirection === "asc" ? -1 : 1;

        return 0;
      });
    }

    return currentFilteredData;
  }, [data, searchTerm, selectedFullNames, selectedProjectTypes, selectedProjectStatuses, sortColumn, sortDirection]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedFullNames([]); // Réinitialise le filtre par nom complet
    setSelectedProjectTypes([]);
    setSelectedProjectStatuses([]);
    setSortColumn(null);
    setSortDirection("asc");
    setCurrentPage(1);
  };

  // Count active filters (excluding search term as it's always visible)
  const activeFiltersCount = [
    selectedFullNames.length, // Maintenant basé sur selectedFullNames
    selectedProjectTypes.length,
    selectedProjectStatuses.length,
  ].reduce((acc, count) => acc + (count > 0 ? 1 : 0), 0);
  // Add 1 if search term is active
  const totalActiveFilters = activeFiltersCount + (searchTerm ? 1 : 0);


  // CSS classes for table headers and cells
  const headerClass =
    "px-2 py-2 text-left text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap hover:bg-gray-100";
  const cellClass =
    "px-2 py-2 text-[12px] sm:text-sm text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis";

  // Display loading message
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
        Chargement des données...
      </div>
    );
  }

  // Display data fetching error message
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-4 mx-auto gap-y-4 max-w-full items-center mt-20">
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 p-4 bg-white rounded-xl shadow-lg z-20 sticky top-4">
        {/* Search Input Form */}
        <form className="w-full md:w-auto flex-grow" onSubmit={(e) => e.preventDefault()}>
          <label className="input input-bordered w-full flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-200 rounded-lg">
            <input
              className="grow px-2 py-1 outline-none"
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Rechercher par nom, module ou matricule..."
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              ></path>
            </svg>
          </label>
        </form>

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
            xlEndpoint="/etp/reporting/exportXl/app"
            pdfEndpoint="/etp/reporting/exportPdf/app"
            xlFileName="FormationETP.xlsx"
            pdfFileName="reportingformationETP.pdf"
            data={filteredAndSortedData}
            onError={setExportError}
          />
        </div>
      </div>

      {/* Filter Options Section */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-white rounded-xl shadow-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 z-10"
          >
            {/* Filter by Nom Complet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom Complet
              </label>
              <Select
                isMulti
                options={fullNameOptions} // Utilise les options de nom complet
                value={selectedFullNames} // Utilise l'état pour les noms complets
                onChange={setSelectedFullNames} // Met à jour l'état des noms complets
                placeholder="Sélectionner noms..."
                components={animatedComponents}
                className="text-sm"
                classNamePrefix="select"
                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
              />
            </div>

            {/* Filter by Type de Projet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de Projet
              </label>
              <Select
                isMulti
                options={projectTypeOptions}
                value={selectedProjectTypes}
                onChange={setSelectedProjectTypes}
                placeholder="Sélectionner types..."
                components={animatedComponents}
                className="text-sm"
                classNamePrefix="select"
                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
              />
            </div>

            {/* Filter by Statut du Projet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut du Projet
              </label>
              <Select
                isMulti
                options={projectStatusOptions}
                value={selectedProjectStatuses}
                onChange={setSelectedProjectStatuses}
                placeholder="Sélectionner statuts..."
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
        <table className="min-w-[1200px] w-full table-auto text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th
                className={headerClass}
                onClick={() => handleSort("emp_matricule")}
              >
                Matricule {getSortIndicator("emp_matricule")}
              </th>
              <th
                className={headerClass}
                onClick={() => handleSort("emp_name")}
              >
                Nom Complet {getSortIndicator("emp_name")}
              </th>
              <th
                className={headerClass}
                onClick={() => handleSort("emp_fonction")}
              >
                Fonction {getSortIndicator("emp_fonction")}
              </th>
              <th
                className={headerClass}
                onClick={() => handleSort("module_name")}
              >
                Module {getSortIndicator("module_name")}
              </th>
              <th
                className={headerClass}
                onClick={() => handleSort("project_type")}
              >
                Type {getSortIndicator("project_type")}
              </th>
              <th
                className={headerClass}
                onClick={() => handleSort("project_status")}
              >
                Statut {getSortIndicator("project_status")}
              </th>
              <th
                className={headerClass}
                onClick={() => handleSort("salle_name")}
              >
                Lieu {getSortIndicator("salle_name")}
              </th>
              <th
                className={headerClass}
                onClick={() => handleSort("etp_name")}
              >
                Entreprise {getSortIndicator("etp_name")}
              </th>
              <th
                className={headerClass}
                onClick={() => handleSort("dateDebut")}
              >
                Dates {getSortIndicator("dateDebut")}
              </th>
              <th className={headerClass} onClick={() => handleSort("dureeH")}>
                Durée {getSortIndicator("dureeH")}
              </th>
              <th
                className={headerClass + " text-right"}
                onClick={() => handleSort("taux_de_presence")}
              >
                Présence {getSortIndicator("taux_de_presence")}
              </th>
            </tr>
          </thead>
          <AnimatePresence>
            <motion.tbody
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white divide-y divide-gray-200"
            >
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <motion.tr
                    key={item.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="text-sm text-gray-800 hover:bg-gray-50"
                  >
                    <td className={cellClass}>{item.emp_matricule}</td>
                    <td className={cellClass}>
                      {item.emp_name} {item.emp_firstname}
                    </td>

                    <td
                      className={`text-center px-3 py-2 whitespace-normal text-xs ${
                        item.emp_fonction &&
                        item.emp_fonction === "default_function"
                          ? "bg-gray-200"
                          : ""
                      }`}
                    >
                      {item.emp_fonction &&
                      item.emp_fonction === "default_function"
                        ? item.emp_fonction
                        : "Non défini"}
                    </td>
                    <td className={cellClass}>{item.module_name}</td>

                    <td
                      className={`px-3 py-3 whitespace-nowrap text-sm 
                        ${item.project_type === "Intra" ? " text-blue-500" : ""}
                        ${item.project_type === "Inter" ? " text-green-500" : ""}
                        ${item.project_type === "Externe" ? "text-red-500" : ""}
                    `}
                    >
                      {item.project_type}
                    </td>
                    <td className={cellClass}>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.project_status === "Terminé"
                            ? "bg-green-100 text-green-800"
                            : item.project_status === "Supprimé"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.project_status}
                      </span>
                    </td>
                    <td className={cellClass}>
                      {item.salle_name || ""} {item.salle_quartier || ""}
                    </td>
                    <td className={cellClass}>{item.etp_name}</td>
                    <td className={cellClass}>
                      {item.dateDebut} au {item.dateFin}
                    </td>
                    <td className={cellClass + " text-center"}>
                      {item.dureeH}h
                    </td>
                    <td className={cellClass + " text-right"}>
                      {item.taux_de_presence !== null
                        ? `${item.taux_de_presence} %`
                        : "%"}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td
                    colSpan="11"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Aucune donnée trouvée.
                  </td>
                </motion.tr>
              )}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredAndSortedData.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 mb-8">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportingEmploye;
