import React, { useState, useEffect, useCallback, useContext } from "react";
import PropTypes from "prop-types";
import api from "../../utils/api";
import { UserContext } from "../../context/UserContext";
import { formatMontant } from "../../utils/formatMontant";
import { Bar } from "react-chartjs-2";

// Importez et enregistrez les composants Chart.js nécessaires
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CustomerReporting = () => {
  const { setting } = useContext(UserContext);

  // Styles constants
  const tableHeaderStyle =
    "px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-100 border-b border-gray-200";
  const tableCellStyle =
    "px-4 py-3 whitespace-nowrap text-sm text-gray-800 border-b border-gray-200";
  const totalCellStyle =
    "px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 bg-gray-50 border-b border-gray-200";

  const [state, setState] = useState({
    customerInput: "",
    customerList: [],
    filteredCustomers: [],
    selectedCustomer: null,
    reportingData: null,
    loading: false,
    error: null,
  });

  // State pour forcer le re-montage du graphique (résout l'erreur "Canvas is already in use")
  const [chartKey, setChartKey] = useState(0);

  const {
    customerInput,
    customerList,
    filteredCustomers,
    reportingData,
    loading,
    error,
  } = state;

  const currency = setting?.currency_code || "XOF";

  useEffect(() => {
    if (!setting) {
      console.warn("Setting n'est pas encore chargé");
    } else {
      console.log("Setting chargé:", setting);
    }
  }, [setting]);

  // Fetch all customers for the autocomplete list
  useEffect(() => {
    const fetchCustomerList = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await api.get("/cfp/reporting/client_list");

        if (response.data && Array.isArray(response.data)) {
          setState((prev) => ({
            ...prev,
            customerList: response.data,
            loading: false,
          }));
        } else {
          console.error("API response format unexpected:", response.data);
          throw new Error(
            "Format de réponse invalide pour la liste de clients."
          );
        }
      } catch (err) {
        console.error("Error fetching customer list:", err);
        setState((prev) => ({
          ...prev,
          error:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des clients",
          loading: false,
        }));
      }
    };

    fetchCustomerList();
  }, []);

  // Filter customers based on input
  useEffect(() => {
    if (!customerInput) {
      setState((prev) => ({ ...prev, filteredCustomers: [] }));
      return;
    }

    const filtered = customerList.filter(
      (customer) =>
        customer.customerName &&
        customer.customerName
          .toLowerCase()
          .includes(customerInput.toLowerCase())
    );

    setState((prev) => ({ ...prev, filteredCustomers: filtered }));
  }, [customerInput, customerList]);

  // Function to fetch reporting data for a specific customer
  const fetchReportingData = useCallback(
    async (customerName) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          reportingData: null, // Réinitialiser reportingData avant une nouvelle recherche
        }));

        const response = await api.post("/cfp/reporting/search/customer", {
          customer: customerName,
        });

        if (!response.data || response.data.status !== 200) {
          throw new Error(
            response.data?.message ||
              "Aucune donnée de rapport trouvée pour ce client."
          );
        }

        const foundCustomer = customerList.find(
          (c) =>
            c.customerName &&
            c.customerName.toLowerCase() === customerName.toLowerCase()
        ) || { customerName, idCustomer: null };

        setState((prev) => ({
          ...prev,
          reportingData: response.data,
          selectedCustomer: foundCustomer,
          loading: false,
        }));
        // Incrémenter la clé pour forcer le re-montage du graphique Chart.js
        setChartKey((prevKey) => prevKey + 1);
      } catch (err) {
        console.error("Error fetching reporting data:", err);
        setState((prev) => ({
          ...prev,
          error:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors de la récupération des données",
          loading: false,
        }));
      }
    },
    [customerList]
  );

  const handleInputChange = (e) => {
    setState((prev) => ({ ...prev, customerInput: e.target.value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (customerInput) {
      fetchReportingData(customerInput);
    }
  };

  const handleCustomerSelect = (customer) => {
    setState((prev) => ({
      ...prev,
      customerInput: customer.customerName,
      filteredCustomers: [],
      selectedCustomer: customer,
    }));
    fetchReportingData(customer.customerName);
  };

  const renderCARows = () => {
    if (
      !reportingData?.results?.ca ||
      reportingData.results.ca.length === 0 ||
      !reportingData.months
    ) {
      return (
        <tr>
          <td colSpan={13} className="text-center text-gray-500 py-4">
            Aucune donnée de chiffre d'affaires disponible.
          </td>
        </tr>
      );
    }

    return reportingData.results.ca.map((yearData) => {
      const annualTotal = yearData.ca_customer.reduce(
        (sum, month) => sum + Number(month?.total_ttc || 0),
        0
      );

      return (
        <React.Fragment key={yearData.year}>
          <tr className="hover:bg-gray-50">
            <td className={tableCellStyle}>{yearData.year}</td>
            {Object.values(reportingData.months).map((monthName) => {
              const monthData = yearData.ca_customer.find(
                (m) => m.month === monthName
              );
              return (
                <td
                  key={`${yearData.year}-${monthName}`}
                  className={tableCellStyle}
                >
                  {monthData
                    ? formatMontant(monthData.total_ttc, currency)
                    : formatMontant(0)}
                </td>
              );
            })}
            <td className={totalCellStyle}>
              {formatMontant(annualTotal, currency)}
            </td>
          </tr>
        </React.Fragment>
      );
    });
  };

  const renderMonthlyCountTable = (
    dataArray,
    keyToDisplay,
    showAnnualTotal = false
  ) => {
    if (!reportingData?.months || !dataArray || dataArray.length === 0) {
      return (
        <tr>
          <td colSpan={13} className="text-center text-gray-500 py-4">
            Aucune donnée mensuelle disponible.
          </td>
        </tr>
      );
    }

    return dataArray.map((yearData) => {
      const annualTotal = yearData[keyToDisplay].reduce(
        (sum, month) => sum + (month?.nb_project || month?.nb_learner || 0),
        0
      );

      return (
        <React.Fragment key={yearData.year}>
          <tr className="hover:bg-gray-50">
            <td className={tableCellStyle}>{yearData.year}</td>
            {Object.values(reportingData.months).map((monthName) => {
              const monthData = yearData[keyToDisplay].find(
                (m) => m.month === monthName
              );
              return (
                <td
                  key={`${yearData.year}-${monthName}`}
                  className={tableCellStyle}
                >
                  {monthData
                    ? monthData.nb_project || monthData.nb_learner || 0
                    : 0}
                </td>
              );
            })}
            {showAnnualTotal && (
              <td className={totalCellStyle}>{annualTotal}</td>
            )}
          </tr>
        </React.Fragment>
      );
    });
  };

  const renderSection = (title, content, count = null) => (
    <section className="mb-8 bg-white rounded-lg shadow-sm overflow-hidden">
      <header className="bg-gray-100 px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          {title}
          {count !== null && (
            <span className="ml-2 text-gray-500 font-normal">({count})</span>
          )}
        </h2>
      </header>
      <div className="p-6">{content}</div>
    </section>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 mt-13">
      <div className="text-center mb-8">
        <p className="block text-sm font-medium text-gray-700 mb-1">
          Recherchez un client pour afficher son rapports de formation
        </p>
      </div>

      <div className="relative w-full mx-auto mb-8">
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-grow">
            <input
              id="customer-search"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Saisissez le nom d'une entreprise..."
              value={customerInput}
              onChange={handleInputChange}
              autoComplete="off"
              disabled={loading}
            />
            {filteredCustomers.length > 0 && customerInput && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <li
                    key={customer.idCustomer}
                    className="px-4 py-2 cursor-pointer hover:bg-purple-50 transition-colors"
                    onMouseDown={() => handleCustomerSelect(customer)}
                  >
                    {customer.customerName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center min-w-[180px]"
            disabled={loading || !customerInput}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Chargement...
              </>
            ) : (
              "Générer le rapport"
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Une erreur est survenue
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {reportingData && (
        <div className="space-y-8">
          {/* Résumé Global */}
          <section className="bg-white rounded-lg shadow-sm overflow-hidden">
            <header className="bg-gray-100 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Résumé Global
              </h2>
            </header>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-600 font-medium">Total CA</p>
                <p className="text-2xl font-bold text-purple-800">
                  {formatMontant(
                    reportingData.results.ca.reduce(
                      (total, year) => total + (year.total || 0),
                      0
                    ),
                    currency
                  )}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">
                  Total Projets
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {reportingData.total_project || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-600 font-medium">
                  Total Apprenants
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {reportingData.total_learner || 0}
                </p>
              </div>
            </div>
          </section>

          {/* Graphique CA */}
          {reportingData?.results?.ca &&
            reportingData.results.ca.length > 0 &&
            renderSection(
              "Visualisation du chiffre d'affaires",
              <div className="h-64">
                <Bar
                  // Ajout de la prop key ici. Chaque fois que chartKey change,
                  // React va détruire l'ancien composant Bar et en monter un nouveau,
                  // résolvant l'erreur "Canvas is already in use".
                  key={chartKey}
                  data={{
                    labels: Object.values(reportingData.months),
                    datasets: reportingData.results.ca.map((yearData) => ({
                      label: yearData.year,
                      data: Object.values(reportingData.months).map((month) => {
                        const monthData = yearData.ca_customer.find(
                          (m) => m.month === month
                        );
                        return monthData ? monthData.total_ttc : 0;
                      }),
                      backgroundColor:
                        yearData.year === new Date().getFullYear().toString()
                          ? "rgba(147, 51, 234, 0.7)"
                          : "rgba(209, 213, 219, 0.7)",
                    })),
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) =>
                            formatMontant(value, currency, true),
                        },
                      },
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            return formatMontant(context.raw, currency);
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            )}

          {/* Référents Section */}
          {renderSection(
            "Référents",
            reportingData.referents?.length > 0 ? (
              <ul className="space-y-4">
                {reportingData.referents.map((referent) => (
                  <li
                    key={referent.id || referent.email}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nom</p>
                        <p className="font-medium">{referent.name || "Non renseigné"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{referent.email || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p>{referent.customerPhone || "Non renseigné"}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Aucun référent trouvé</p>
            )
          )}

          {/* Évaluation du chiffre d'affaires Section */}
          {renderSection(
            "Évaluation du chiffre d'affaires",
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className={tableHeaderStyle}>Année</th>
                    {reportingData.months &&
                      Object.values(reportingData.months).map((month) => (
                        <th key={month} className={tableHeaderStyle}>
                          {month}
                        </th>
                      ))}
                    <th className={`${tableHeaderStyle} bg-yellow-100`}>
                      <span className="text-red-600 font-semibold">
                        Total Annuel
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderCARows()}
                </tbody>
              </table>
            </div>
          )}

          {/* Nombre de projets Section */}
          {renderSection(
            "Nombre de projets",
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className={tableHeaderStyle}>Année</th>
                    {reportingData.months &&
                      Object.values(reportingData.months).map((month) => (
                        <th key={month} className={tableHeaderStyle}>
                          {month}
                        </th>
                      ))}
                    <th className={`${tableHeaderStyle} bg-yellow-100`}>
                      <span className="text-red-600 font-semibold">
                        Total Annuel
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderMonthlyCountTable(
                    reportingData.results.count_projects,
                    "projects",
                    true
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Nombre d'apprenants Section */}
          {renderSection(
            "Nombre d'apprenants",
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className={tableHeaderStyle}>Année</th>
                    {reportingData.months &&
                      Object.values(reportingData.months).map((month) => (
                        <th key={month} className={tableHeaderStyle}>
                          {month}
                        </th>
                      ))}
                    <th className={`${tableHeaderStyle} bg-yellow-100`}>
                      <span className="text-red-600 font-semibold">
                        Total Annuel
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderMonthlyCountTable(
                    reportingData.results.learners,
                    "learners",
                    true
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Historique des projets Section */}
          {renderSection(
            "Historique des projets",
            reportingData.results.story_projects?.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className={tableHeaderStyle}>Année</th>
                      <th className={tableHeaderStyle}>Mois</th>
                      <th className={tableHeaderStyle}>Projet</th>
                      <th className={tableHeaderStyle}>Type de Projet</th>
                      <th className={tableHeaderStyle}>Coût TTC</th>
                      <th className={tableHeaderStyle}>Date de Début</th>
                      <th className={tableHeaderStyle}>Date de Fin</th>
                      <th className={tableHeaderStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      let totalCost = 0;
                      const projects = [];

                      reportingData.results.story_projects.forEach(
                        (yearData) => {
                          yearData.story_projects.forEach((monthData) => {
                            monthData.projects.forEach((project) => {
                              totalCost += parseFloat(project.total_ttc) || 0;
                              projects.push(
                                <tr
                                  key={project.idProjet}
                                  className="hover:bg-gray-50"
                                >
                                  <td className={tableCellStyle}>
                                    {yearData.year}
                                  </td>
                                  <td className={tableCellStyle}>
                                    {monthData.month}
                                  </td>
                                  <td className={tableCellStyle}>
                                    {project.module_name}
                                  </td>
                                  <td className={tableCellStyle}>
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        project.project_type ===
                                        "Inter-entreprise"
                                          ? "bg-purple-100 text-purple-800"
                                          : project.project_type ===
                                            "Intra-entreprise"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      {project.project_type}
                                    </span>
                                  </td>
                                  <td className={tableCellStyle}>
                                    {formatMontant(project.total_ttc, currency)}
                                  </td>
                                  <td className={tableCellStyle}>
                                    {project.dateDebut}
                                  </td>
                                  <td className={tableCellStyle}>
                                    {project.dateFin}
                                  </td>
                                  <td className={tableCellStyle}>
                                    <a
                                      href={`https://projets.forma-fusion.com/cfp/projets/${project.idProjet}/detail`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-600 hover:text-purple-900"
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                      </svg>
                                    </a>
                                  </td>
                                </tr>
                              );
                            });
                          });
                        }
                      );

                      return [
                        ...projects,
                        <tr key="total" className="bg-gray-50 font-semibold">
                          <td className={totalCellStyle} colSpan={4}>
                            Total Général
                          </td>
                          <td className={totalCellStyle}>
                            {formatMontant(totalCost, currency)}
                          </td>
                          <td className={totalCellStyle} colSpan={3}></td>
                        </tr>,
                      ];
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Aucun historique de projet trouvé</p>
            ),
            reportingData.results.story_projects?.reduce(
              (total, year) =>
                total +
                year.story_projects.reduce(
                  (sum, month) => sum + month.projects.length,
                  0
                ),
              0
            ) || 0
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerReporting;
