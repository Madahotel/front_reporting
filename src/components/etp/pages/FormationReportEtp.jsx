import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../utils/api";
import FormationFilter from "./FormationFilter";
import { format } from "date-fns";

const FormationReportEtp = () => {
  const [dateRange, setDateRange] = useState({
    range: "all",
    startDate: null,
    endDate: null,
    label: "Tous les dates",
  });
  const [selectedFormation, setSelectedFormation] = useState("all");
  const [formationData, setFormationData] = useState([]);
  const [formationsList, setFormationsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayDateRange, setDisplayDateRange] = useState("");
  const [displayFormationName, setDisplayFormationName] = useState(
    "Toutes les formations"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const tableBodyRef = useRef(null);

  const calculateItemsPerPage = useCallback(() => {
    if (tableBodyRef.current) {
      const tableBodyHeight = tableBodyRef.current.offsetHeight;
      const rowHeight = 48;
      const calculatedItems = Math.max(
        5,
        Math.floor(tableBodyHeight / rowHeight)
      );
      setItemsPerPage(calculatedItems);
    } else {
      const windowHeight = window.innerHeight;
      const estimatedRows = Math.max(5, Math.floor((windowHeight - 300) / 48));
      setItemsPerPage(estimatedRows);
    }
  }, []);

  useEffect(() => {
    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);
    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, [calculateItemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [formationData, selectedFormation, dateRange]);

  const fetchAllFormationsList = useCallback(async () => {
    try {
      const response = await api.get("/etp/reporting/formation");
      const formations =
        response.data.all_etp_formation || response.data.all_cfp_formation;

      if (response.status === 200 && Array.isArray(formations)) {
        setFormationsList(formations);
      } else {
        console.error(
          "Erreur: Format de réponse inattendu pour la liste des formations complètes.",
          response.data
        );
        setError(
          "Impossible de charger la liste des formations pour le filtre. Veuillez vérifier la configuration de l'API."
        );
        setFormationsList([]);
      }
    } catch (err) {
      console.error(
        "Erreur lors de la récupération de la liste complète des formations :",
        err
      );
      setError(
        "Impossible de charger la liste des formations. " +
          (err.response?.data?.message || err.message)
      );
      setFormationsList([]);
    }
  }, []);

  useEffect(() => {
    fetchAllFormationsList();
  }, [fetchAllFormationsList]);

  const fetchFilteredFormationData = useCallback(
    async (currentDateRange, currentFormation) => {
      setLoading(true);
      setError(null);

      const daterangePayload =
        currentDateRange.range === "all" ||
        !currentDateRange.startDate ||
        !currentDateRange.endDate
          ? "01/01/1900 - 12/31/2999"
          : `${format(currentDateRange.startDate, "MM/dd/yyyy")} - ${format(
              currentDateRange.endDate,
              "MM/dd/yyyy"
            )}`;

      const payload = {
        daterange: daterangePayload,
        formation: currentFormation,
      };

      try {
        const response = await api.post(
          "etp/reporting/filterFormation",
          payload
        );

        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = response.data;

        if (Array.isArray(data.all_learner)) {
          setFormationData(data.all_learner);
        } else {
          console.error(
            "Erreur: 'all_learner' n'est pas un tableau dans la réponse filtrée.",
            data
          );
          setFormationData([]);
          setError("Format de données de rapport inattendu.");
        }

        if (data.data_filter && data.data_filter.length === 2) {
          setDisplayDateRange(data.data_filter[0]);
          setDisplayFormationName(data.data_filter[1]);
        } else {
          setDisplayDateRange(currentDateRange.label);
          const foundFormation = formationsList.find(
            (f) => String(f.idModule) === String(currentFormation)
          );
          setDisplayFormationName(
            currentFormation === "all"
              ? "Toutes les formations"
              : foundFormation?.module_name || `ID: ${currentFormation}`
          );
        }
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des données filtrées :",
          err
        );
        setError(
          "Impossible de charger les données. Veuillez réessayer plus tard. " +
            (err.response?.data?.message || err.message)
        );
        setFormationData([]);
      } finally {
        setLoading(false);
      }
    },
    [formationsList]
  );

  useEffect(() => {
    if (formationsList.length > 0 || selectedFormation === "all") {
      fetchFilteredFormationData(dateRange, selectedFormation);
    }
  }, [
    fetchFilteredFormationData,
    dateRange,
    selectedFormation,
    formationsList,
  ]);

  const handleFilter = useCallback(
    ({ dateRange: newDateRange, formation: newFormation }) => {
      setDateRange(newDateRange);
      setSelectedFormation(newFormation);
    },
    []
  );

  const totalPages = Math.ceil(formationData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = formationData.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = useCallback(() => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (
        currentPage > 2 + Math.floor(maxPagesToShow / 2) &&
        currentPage <= totalPages - Math.floor(maxPagesToShow / 2)
      ) {
        pageNumbers.push("...");
        for (
          let i = currentPage - Math.floor((maxPagesToShow - 3) / 2);
          i <= currentPage + Math.floor((maxPagesToShow - 3) / 2);
          i++
        ) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
      } else if (currentPage <= 2 + Math.floor(maxPagesToShow / 2)) {
        for (let i = 2; i <= maxPagesToShow - 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
      } else {
        pageNumbers.push("...");
        for (let i = totalPages - (maxPagesToShow - 2); i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      }
      if (!pageNumbers.includes(totalPages)) {
        if (pageNumbers[pageNumbers.length - 1] !== "...") {
          pageNumbers.push("...");
        }
        pageNumbers.push(totalPages);
      }
    }
    return [...new Set(pageNumbers)];
  }, [currentPage, totalPages]);

  return (
    <div className="flex-grow pt-20 lg:pt-20">
      <div className="flex flex-col w-full px-4 mx-auto xl:p-0 gap-y-4 xl:container">
        <div className="bg-white rounded-lg shadow-xs border border-gray-100 p-4">
          <FormationFilter
            onFilter={handleFilter}
            loading={loading}
            formationsList={formationsList}
            initialDateRange={dateRange}
            initialSelectedFormation={selectedFormation}
            setDateRange={setDateRange}
            setSelectedFormation={setSelectedFormation}
          />
        </div>

        <div className="bg-white rounded-lg shadow-xs border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Résultats des formations
                </h2>
                <div className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Dates :</span>{" "}
                  {displayDateRange} |
                  <span className="font-medium ml-2">Formation :</span>{" "}
                  {displayFormationName}
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                {formationData.length}{" "}
                {formationData.length === 1 ? "résultat" : "résultats"}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Matricule
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nom
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fonction
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Formation
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Statut
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Lieu
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Entreprise
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dates
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Durée
                  </th>
                </tr>
              </thead>
              <tbody
                ref={tableBodyRef}
                className="bg-white divide-y divide-gray-200"
              >
                {loading && (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-5 py-4 text-center text-sm text-gray-500"
                    >
                      <div className="flex justify-center items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Chargement des données...
                      </div>
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-5 py-4 text-center text-sm text-red-600"
                    >
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && currentData.length === 0 && (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-5 py-4 text-center text-sm text-gray-500"
                    >
                      Aucune donnée de formation trouvée pour les filtres
                      actuels ou sur cette page.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  currentData.map((data, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-900">
                        {data.emp_matricule}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">
                          {data.emp_firstname} {data.emp_name}
                        </div>
                      </td>
                      <td
                        className={`text-center px-3 py-2 whitespace-normal text-xs ${
                          data.emp_fonction &&
                          data.emp_fonction === "default_function"
                            ? "bg-gray-200"
                            : ""
                        }`}
                      >
                        {data.emp_fonction &&
                        data.emp_fonction === "default_function"
                          ? data.emp_fonction
                          : "Non défini"}
                      </td>

                      <td className="px-5 py-3 text-sm text-gray-900">
                        {data.module_name}
                      </td>
                      <td
                        className={`px-3 py-3 whitespace-nowrap text-sm 
                          ${data.project_type === "Intra" ? "text-blue-500" : ""}
                          ${data.project_type === "Inter" ? "text-green-500" : ""}
                          ${data.project_type === "Externe" ? "text-red-500" : ""}
                        `}
                      >
                        {data.project_type}
                      </td>

                      <td className="px-5 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            data.project_status === "Terminé"
                              ? "bg-green-100 text-green-800"
                              : data.project_status === "En cours"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {data.project_status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {data.salle_name && data.salle_quartier
                          ? `${data.salle_name}, ${data.salle_quartier}`
                          : "Non spécifié"}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-900">
                        {data.etp_name}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">
                        {data.dateDebut} au {data.dateFin}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {data.dureeH} H
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && !error && formationData.length > 0 && totalPages > 1 && (
            <div className="flex justify-between items-center px-5 py-3 border-t border-gray-100">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((pageNumber, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof pageNumber === "number" && goToPage(pageNumber)
                    }
                    className={`px-3 py-1 text-sm rounded-lg ${
                      currentPage === pageNumber
                        ? "bg-purple-600 text-white"
                        : typeof pageNumber === "number"
                        ? "text-gray-700 hover:bg-gray-200"
                        : "text-gray-500 cursor-default"
                    }`}
                    disabled={typeof pageNumber !== "number"}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormationReportEtp;
