import React, { useState, useEffect, useContext } from "react";
import api from "../../utils/api";
import { UserContext } from "../../context/UserContext";
import { formatMontant } from "../../utils/formatMontant";
// import { useParams, Link } from "react-router-dom";

const ProjectReporting = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [moduleDetails, setModuleDetails] = useState(null);
  const [projectsByYear, setProjectsByYear] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { setting } = useContext(UserContext);

  useEffect(() => {
    if (!setting) {
      console.warn("Setting n'est pas encore chargé");
    } else {
      console.log("Setting chargé:", setting);
    }
  }, [setting]);

  const currency = setting?.currency_code || "XOF";
  const [state, setState] = useState({
    customerInput: "",
    customerList: [],
    filteredCustomers: [],
    selectedCustomer: null,
    reportingData: null,
    loading: false,
    error: null,
  });

  // Fetch modules on component mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await api.get("/cfp/reporting/cours");
        setModules(response.data.cours || []);
      } catch (err) {
        console.error("Error fetching modules:", err);
        setError("Échec du chargement des modules.");
      }
    };
    fetchModules();
  }, []);

  const handleModuleChange = (event) => {
    setSelectedModule(event.target.value);
    setModuleDetails(null);
    setProjectsByYear({}); // Clear previous projects
  };

  const handleFilterSubmit = async (event) => {
    event.preventDefault();
    if (!selectedModule) {
      alert("Veuillez sélectionner un module.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/cfp/reporting/cours/${selectedModule}`);

      if (response.data.status === 200) {
        setModuleDetails(response.data.module || {});

        const backendGroupedProjects = Array.isArray(response.data.projects)
          ? response.data.projects
          : [];

        const transformedProjects = {};
        backendGroupedProjects.forEach((yearlyGroup) => {
          if (yearlyGroup.year && Array.isArray(yearlyGroup.modules)) {
            transformedProjects[yearlyGroup.year] = yearlyGroup.modules.map(
              (proj) => ({
                idProjet: proj.idProjet,
                client: proj.etp_name,
                type_projet: proj.project_type,
                date_debut: proj.dateDebut,
                date_fin: proj.dateFin,
                prix: proj.total_ttc,
                status: proj.project_status,
                lieu: proj.ville,
              })
            );
          }
        });

        setProjectsByYear(transformedProjects); // Set the transformed data
      } else {
        setError(
          response.data.message || "Aucun projet trouvé pour ce module."
        );
        setProjectsByYear({}); // Clear projects if no success
        setModuleDetails(null);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Échec du chargement des projets. Veuillez réessayer.");
      setProjectsByYear({}); // Clear projects on error
      setModuleDetails(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow pt-20 lg:pt-20">
      <div className="text-center mb-8">
        {/* <h1 className="text-2xl font-bold text-gray-800">Historique des Formations</h1> */}
        <p className="block text-sm font-medium text-gray-700 mb-1 pt-5">
          Veuillez sélectionner un module afin d’afficher son rapport de
          formation
        </p>
      </div>
      <div className="flex flex-col w-full px-4 mx-auto mt-2 xl:p-0 gap-y-4 xl:container align-center">
        <div className="flex justify-center w-full">
          <form className="flex gap-2" onSubmit={handleFilterSubmit}>
            <input type="hidden" name="_token" autoComplete="off" />
            <span className="inline-flex items-center">
              <select
                id="module"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200"
                value={selectedModule}
                onChange={handleModuleChange}
                disabled={loading}
              >
                <option value="" disabled>
                  Sélectionner le module
                </option>
                {modules.map((module) => (
                  <option key={module.idModule} value={module.idModule}>
                    {module.moduleName || "Module sans nom"}
                  </option>
                ))}
              </select>
            </span>
            <button
              type="submit"
              className="px-6 py-3 bg-[#9333EA] hover:bg-[#A462A4b9] text-white font-medium rounded-lg transition duration-200 cursor-pointer"
              disabled={loading || !selectedModule}
            >
              {loading ? "Chargement..." : "Filtrer"}
            </button>
          </form>
        </div>

        <div className="flex items-center w-full flex-column" id="results">
          {error && (
            <div className="w-full p-4 text-center text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {!selectedModule && !loading && (
            <div className="w-full p-8 text-center text-gray-500 bg-gray-50 rounded-md">
              Veuillez sélectionner un module pour afficher les projets.
            </div>
          )}

          {loading && (
            <div className="w-full p-8 text-center text-gray-500 bg-gray-50 rounded-md">
              Chargement des données...
            </div>
          )}

          {moduleDetails && Object.keys(projectsByYear).length > 0 && (
            <div
              id="tableReporting"
              className="w-full px-4 bg-white rounded-md shadow-sm xl:container"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <div>
                  <p className="text-xl font-semibold">
                    {moduleDetails.moduleName || "Module"}
                  </p>
                  <p>
                    Niveau: {moduleDetails.module_level_name || "Non spécifié"}
                  </p>
                </div>
              </div>

              {/* Now iterate over projectsByYear (the transformed data) */}
              {Object.entries(projectsByYear)
                .sort(([yearA], [yearB]) => yearB - yearA)
                .map(([year, yearProjects]) => (
                  <div key={year} className="mb-6">
                    <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg mt-4">
                      <span className="font-semibold">Année {year}</span>
                      <span className="bg-purple-700 text-white px-3 py-1 rounded-full text-sm">
                        {yearProjects.length}{" "}
                        {yearProjects.length > 1 ? "projets" : "projet"}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 mt-2">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Client
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type de projet
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Début
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Fin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Prix
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Lieu
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {yearProjects.map((project, index) => (
                            <tr
                              key={project.idProjet || index}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {index + 1}
                              </td>
                              <td
                                className={`px-4 py-2 whitespace-nowrap text-sm ${
                                  project.client
                                    ? project.client === "Pas de client"
                                      ? "text-red-500 font-semibold bg-yellow-100 p-1 rounded"
                                      : "text-gray-900"
                                    : "text-red-500 font-semibold"
                                }`}
                              >
                                {project.client ?? "Pas de client"}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full 
                                  ${
                                    project.type_projet === "Inter"
                                      ? "bg-purple-100 text-purple-800"
                                      : project.type_projet === "Intra"
                                      ? "bg-green-100 text-indigo-800"
                                      : project.type_projet === "Interne"
                                      ? "bg-pink-100 text-pink-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {project.type_projet ===
                                    "Inter-entreprise" && (
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                                    </svg>
                                  )}
                                  {project.type_projet ===
                                    "Intra-entreprise" && (
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                  {project.type_projet === "Sur-mesure" && (
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                  {project.type_projet}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {project.date_debut}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {project.date_fin}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatMontant(
                                  project.prix.toLocaleString(),
                                  currency
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                    ${
                                                                      project.status ===
                                                                      "Terminé"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : project.status ===
                                                                          "En cours"
                                                                        ? "bg-blue-100 text-blue-800"
                                                                        : "bg-gray-100 text-gray-800"
                                                                    }`}
                                >
                                  {project.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {project.lieu}
                              </td>
                              <td className="text-center">
                                <a
                                  href={`https://projets.forma-fusion.com/cfp/projets/${project.idProjet}/detail`}
                                  className="text-purple-700 hover:text-[#A462A4b9]"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <i className="fa-solid fa-eye"></i>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {selectedModule &&
            !loading &&
            moduleDetails &&
            Object.keys(projectsByYear).length === 0 && (
              <div className="w-full p-8 text-center text-gray-500 bg-gray-50 rounded-md">
                Aucun projet trouvé pour ce module.
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProjectReporting;
