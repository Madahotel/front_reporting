import React, { useState, useEffect, useMemo, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { formatMontant } from "../../utils/formatMontant";
import api from "../../utils/api";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import Select from "react-select";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";

const RevenueByProject = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [projects, setProjects] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { setting } = useContext(UserContext);
  const [showFilters, setShowFilters] = useState(false);

  // États pour les filtres
  const [selectedFormations, setSelectedFormations] = useState([]);
  const [selectedReferences, setSelectedReferences] = useState([]);
  const [allFormations, setAllFormations] = useState([]);
  const [allReferences, setAllReferences] = useState([]);

  useEffect(() => {
    if (!setting) {
      console.warn("Setting n'est pas encore chargé");
    } else {
      console.log("Setting chargé:", setting);
    }
  }, [setting]);

  const currency = setting?.currency_code || "XOF";

  const years = useMemo(() => {
    return [currentYear + 1, currentYear, currentYear - 1];
  }, [currentYear]);

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const fetchData = async (year) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/cfp/reporting/chiffre/projet/${year}`);
      const formattedProjects = response.data.projects.map((project) => ({
        id: project.id_projet,
        formation: project.module_name,
        reference: project.project_reference,
        debut: project.date_debut,
        fin: project.date_fin,
        cout: project.total_ttc,
        pourcentage: `${project.percentage} %`,
        detail: `/reporting/project/detail/${project.idProjet}`,
      }));

      setProjects(formattedProjects);
      setTotalPrice(response.data.total_price);

      // Extraire les formations et références uniques pour les filtres
      const uniqueFormations = [
        ...new Set(formattedProjects.map((p) => p.formation)),
      ];
      const uniqueReferences = [
        ...new Set(formattedProjects.map((p) => p.reference)),
      ];

      setAllFormations(uniqueFormations.map((f) => ({ value: f, label: f })));
      setAllReferences(uniqueReferences.map((r) => ({ value: r, label: r })));

      setCurrentPage(1);
    } catch (err) {
      setError(
        "Impossible de charger les données pour l'année sélectionnée. Veuillez réessayer."
      );
      console.error("Erreur lors de la récupération des données:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les projets en fonction des sélections
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const formationMatch =
        selectedFormations.length === 0 ||
        selectedFormations.some((f) => f.value === project.formation);

      const referenceMatch =
        selectedReferences.length === 0 ||
        selectedReferences.some((r) => r.value === project.reference);

      return formationMatch && referenceMatch;
    });
  }, [projects, selectedFormations, selectedReferences]);

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

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const sortTable = (columnName) => {
    const sorted = [...filteredProjects].sort((a, b) => {
      if (
        typeof a[columnName] === "string" &&
        isNaN(parseFloat(a[columnName]))
      ) {
        return a[columnName].localeCompare(b[columnName]);
      }

      const valA = parseFloat(String(a[columnName]).replace(/[^0-9.-]+/g, ""));
      const valB = parseFloat(String(b[columnName]).replace(/[^0-9.-]+/g, ""));

      if (!isNaN(valA) && !isNaN(valB)) return valA - valB;

      if (columnName === "debut" || columnName === "fin") {
        return new Date(a[columnName]) - new Date(b[columnName]);
      }

      return 0;
    });

    setProjects(sorted);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const resetFilters = () => {
    setSelectedFormations([]);
    setSelectedReferences([]);
  };

  const hasActiveFilters =
    selectedFormations.length > 0 || selectedReferences.length > 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-4">
        <svg
          className="w-16 h-16 text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-xl text-red-700 font-semibold text-center">
          Une erreur est survenue :
        </p>
        <p className="text-md text-red-600 mt-2 text-center">{error}</p>
        <button
          onClick={() => fetchData(selectedYear)}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col w-full h-full p-4 md:p-8 mt-15"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col w-full max-w-screen-2xl mx-auto min-h-screen">
        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 mb-8"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Chiffre d'affaires par projet
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredProjects.length} projets trouvés
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                    showFilters
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : hasActiveFilters
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <Filter size={16} />
                  Filtres
                  {showFilters ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {hasActiveFilters && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                      {selectedFormations.length + selectedReferences.length}
                    </span>
                  )}
                </button>
                <label
                  htmlFor="yearSelect"
                  className="text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  Année:
                </label>
                <select
                  id="yearSelect"
                  name="yearSelect"
                  className="w-full md:w-32 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md cursor-pointer focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
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

          {/* Filtres avancés */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 -mt-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Filtres avancés
                </h3>
                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      <X size={14} />
                      Réinitialiser
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    <X size={14} />
                    Fermer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formation
                  </label>
                  <Select
                    options={allFormations}
                    value={selectedFormations}
                    onChange={setSelectedFormations}
                    isMulti
                    placeholder="Sélectionner une ou plusieurs formations..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    noOptionsMessage={() => "Aucune option disponible"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Référence
                  </label>
                  <Select
                    options={allReferences}
                    value={selectedReferences}
                    onChange={setSelectedReferences}
                    isMulti
                    placeholder="Sélectionner une ou plusieurs références..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    noOptionsMessage={() => "Aucune option disponible"}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Badges des filtres actifs */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedFormations.map((formation) => (
                <span
                  key={formation.value}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {formation.label}
                  <button
                    onClick={() =>
                      setSelectedFormations(
                        selectedFormations.filter(
                          (f) => f.value !== formation.value
                        )
                      )
                    }
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {selectedReferences.map((reference) => (
                <span
                  key={reference.value}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {reference.label}
                  <button
                    onClick={() =>
                      setSelectedReferences(
                        selectedReferences.filter(
                          (r) => r.value !== reference.value
                        )
                      )
                    }
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <motion.div className="overflow-x-auto" variants={itemVariants}>
            {currentProjects.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                      onClick={() => sortTable("formation")}
                    >
                      Formation
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                      onClick={() => sortTable("reference")}
                    >
                      Référence
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                      onClick={() => sortTable("debut")}
                    >
                      Début
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                      onClick={() => sortTable("fin")}
                    >
                      Fin
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                      onClick={() => sortTable("cout")}
                    >
                      Coût
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                      onClick={() => sortTable("pourcentage")}
                    >
                      Pourcentage
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Détail
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProjects.map((project, index) => (
                    <motion.tr
                      key={project.id}
                      className="hover:bg-gray-50"
                      variants={itemVariants}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td
                        className="px-4 py-3 max-w-xs truncate text-sm text-gray-900"
                        title={project.formation}
                      >
                        {project.formation}
                      </td>
                      <td
                        className="px-4 py-3 max-w-xs truncate text-sm text-gray-900"
                        title={project.reference}
                      >
                        {project.reference}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                        {project.debut}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                        {project.fin}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatMontant(project.cout, currency)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                        {project.pourcentage}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                        <Link
                          to={`https://projets.forma-fusion.com/cfp/projets/${project.id}/detail`}
                          className="text-indigo-600 hover:text-indigo-900"
                          target="_blank"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td
                      colSpan="5"
                      className="px-4 py-3 text-right text-sm text-gray-700 uppercase"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      {formatMontant(
                        filteredProjects.reduce(
                          (sum, project) => sum + parseFloat(project.cout || 0),
                          0
                        ),
                        currency
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      100 %
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {selectedFormations.length > 0 ||
                  selectedReferences.length > 0
                    ? "Aucun projet ne correspond à vos critères de recherche"
                    : "Aucun projet trouvé pour l'année sélectionnée"}
                </h3>
                <div className="mt-6">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {selectedFormations.length > 0 ||
                    selectedReferences.length > 0
                      ? "Réinitialiser les filtres"
                      : "Réessayer"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Affichage de{" "}
                <span className="font-medium">{indexOfFirstItem + 1}</span> à{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredProjects.length)}
                </span>{" "}
                sur{" "}
                <span className="font-medium">{filteredProjects.length}</span>{" "}
                résultats
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 border rounded-md text-sm font-medium ${
                          currentPage === number
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {number}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RevenueByProject;
