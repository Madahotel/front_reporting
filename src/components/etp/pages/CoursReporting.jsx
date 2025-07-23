import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { FaFilter, FaHome, FaChartBar, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";
import ExportButtons from "../../boutons/ExportButtons ";

const CoursReporting = () => {
  const [selectedFormation, setSelectedFormation] = useState("all");
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportError, setExportError] = useState(null); // Define exportError state

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/etp/reporting/cours");
        const data = response.data;

        if (!data || !data.all_learner) {
          throw new Error(
            "Données de l'API mal formées : 'all_learner' manquant."
          );
        }

        setAllReports(data.all_learner);
        setFilteredReports(data.all_learner);

        const uniqueModules = new Set();
        data.all_learner.forEach((learner) => {
          if (learner.module_name) {
            uniqueModules.add(learner.module_name);
          }
        });

        const formattedFormations = [
          { value: "all", label: "Tous les modules" },
          ...Array.from(uniqueModules).map((moduleName) => ({
            value: moduleName,
            label: moduleName,
          })),
        ];
        setFormations(formattedFormations);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          `Impossible de charger les données. Veuillez réessayer. Détails: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedFormation === "all") {
      setFilteredReports(allReports);
    } else {
      const newFilteredReports = allReports.filter(
        (report) => report.module_name === selectedFormation
      );
      setFilteredReports(newFilteredReports);
    }
  }, [selectedFormation, allReports]);

  const handleFormationChange = (event) => {
    setSelectedFormation(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    // The filtering logic is already handled by the useEffect for selectedFormation
  };

  // Animation variants for Framer Motion
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
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4 mx-auto xl:p-0 gap-y-4 xl:container">
      {/* Header */}
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

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 md:px-0">
        <motion.div
          className="bg-white rounded-lg shadow-md overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-[#A462A4] hover:bg-[#A462A4b9] px-6 py-4 text-white">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Liste des rapports de formation
            </h2>
          </div>
          <div className="p-6">
            {/* Filter Form */}
            <motion.form
              onSubmit={handleFormSubmit}
              className="mb-6"
              variants={itemVariants}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="md:col-span-3">
                  <label htmlFor="formationSelect" className="sr-only">
                    Sélectionner une formation:
                  </label>
                  <select
                    id="formationSelect"
                    name="formation"
                    className="w-full select select-bordered text-slate-600 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedFormation}
                    onChange={handleFormationChange}
                  >
                    <option value="all">Tous les modules</option>
                    {formations
                      .filter((f) => f.value !== "all")
                      .map((formation) => (
                        <option
                          key={formation.value}
                          value={formation.value}
                          className="p-2 cursor-pointer input_formation option pointer hover:bg-slate-100 text-start"
                        >
                          {formation.label}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  id="filtrer"
                  type="submit"
                  className="py-2 px-4 font-semibold text-white bg-[#A462A4] hover:bg-[#A462A4b9] cursor-pointer rounded-md w-30"
                >
                  <FaFilter className="inline mr-2" />
                  Filtrer
                </button>
              </div>
            </motion.form>

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
              className="w-full overflow-x-auto"
              variants={itemVariants}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">
                  Rapport des Formations
                </h2>
                <div className="flex gap-2">
                  <ExportButtons
                    xlEndpoint="/etp/reporting/exportXlCours"
                    pdfEndpoint="/etp/reporting/exportPdfCours"
                    xlFileName="FormationETP.xlsx"
                    pdfFileName="reportingformationETP.pdf"
                    data={filteredReports}
                    onError={setExportError}
                  />
                </div>
              </div>
              <table className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Module
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Matricule
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nom et Prénom
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fonction
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Salle
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Statut
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Entreprise
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Dates (Début - Fin)
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Durée (H)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report, index) => (
                      <motion.tr
                        key={index}
                        className="hover:bg-gray-50"
                        variants={itemVariants}
                      >
                        <td className="px-3 py-2 whitespace-normal text-xs text-gray-900">
                          {report.module_name}
                        </td>
                        <td className="px-3 py-2 whitespace-normal text-xs text-gray-500">
                          {report.emp_matricule}
                        </td>
                        <td className="px-3 py-2 whitespace-normal text-xs text-gray-900">{`${report.emp_name} ${report.emp_firstname}`}</td>
                        <td
                          className={`text-center px-3 py-2 whitespace-normal text-xs ${
                            report.emp_fonction &&
                            report.emp_fonction === "default_function"
                              ? "text-gray-500"
                              : "text-red-500"
                          }`}
                        >
                          {report.emp_fonction &&
                          report.emp_fonction === "default_function"
                            ? report.emp_fonction
                            : "--"}
                        </td>

                        <td className="px-3 py-2 whitespace-normal text-xs text-gray-500">{`${report.salle_name} (${report.salle_quartier})`}</td>

                        <td
                          className={`px-3 py-3 whitespace-nowrap text-sm 
                        ${
                          report.project_type === "Intra"
                            ? " text-blue-500"
                            : ""
                        }
                        ${
                          report.project_type === "Inter"
                            ? " text-green-500"
                            : ""
                        }
                        ${
                          report.project_type === "Externe"
                            ? "text-red-500"
                            : ""
                        }
                    `}
                        >
                          {report.project_type}
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
                            {report.project_status}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-normal text-xs text-gray-500">
                          {report.etp_name}
                        </td>
                        <td className="px-3 py-2 whitespace-normal text-xs text-gray-500">{`${report.dateDebut} - ${report.dateFin}`}</td>
                        <td className="px-3 py-2 whitespace-normal text-xs text-gray-500">
                          {report.dureeH}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr variants={itemVariants}>
                      <td
                        colSpan="10"
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        {" "}
                        {/* Corrected colSpan to 10 */}
                        <p className="mb-1">
                          Aucun rapport disponible pour la formation
                          sélectionnée.
                        </p>
                        <p className="text-xs">
                          Veuillez essayer une autre sélection ou vérifier les
                          données.
                        </p>
                      </td>
                    </motion.tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CoursReporting;
