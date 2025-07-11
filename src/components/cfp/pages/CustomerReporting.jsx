import React, { useState, useEffect, useCallback,useContext  } from "react";
import PropTypes from "prop-types"; // Keep PropTypes if you intend to use them
import api from "../../utils/api"; // Assuming this is correctly configured for your API
import { UserContext } from "../../context/UserContext"; // Assurez-vous que ce chemin est correct
import { formatMontant } from "../../utils/formatMontant";

const CustomerReporting = () => {
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

  const {
    customerInput,
    customerList,
    filteredCustomers,
    reportingData,
    loading,
    error,
  } = state;

  // Fetch all customers for the autocomplete list
  useEffect(() => {
    const fetchCustomerList = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await api.get("/cfp/reporting/client_list");

        // Ensure response.data is an array of objects with customerName and idCustomer
        if (response.data && Array.isArray(response.data)) {
          setState((prev) => ({
            ...prev,
            customerList: response.data,
            loading: false,
          }));
        } else {
          // Log the unexpected format for debugging
          console.error(
            "API response for client_list is not in the expected array format:",
            response.data
          );
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
  }, []); // Empty dependency array means this runs once on mount

  // Filter customers based on input
  useEffect(() => {
    if (!customerInput) {
      setState((prev) => ({ ...prev, filteredCustomers: [] }));
      return;
    }

    const filtered = customerList.filter(
      (customer) =>
        customer.customerName && // Ensure customerName exists
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
          reportingData: null,
        }));

        const response = await api.post("/cfp/reporting/search/customer", {
          customer: customerName,
        });

        // Check for success status explicitly if your API returns a `status` field
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
  ); // customerList is a dependency because it's used to find the customer

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
      filteredCustomers: [], // Clear suggestions after selection
      // You might want to immediately set selectedCustomer here if needed
      selectedCustomer: customer,
    }));
    fetchReportingData(customer.customerName);
  };

  // const formatCurrency = (amount) => {
  //   const numericAmount =
  //     typeof amount === "string" ? parseFloat(amount) : amount;
  //   if (isNaN(numericAmount)) return amount;

  //   return new Intl.NumberFormat("fr-MG", {
  //     style: "currency",
  //     currency: "MGA",
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 2,
  //   }).format(numericAmount);
  // };

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

    return reportingData.results.ca.map((yearData) => (
      <tr key={yearData.year} className="hover:bg-gray-50 even:bg-gray-50">
        <td className="p-3 font-medium">{yearData.year}</td>
        {Object.values(reportingData.months).map((monthName) => {
          const monthData = yearData.ca_customer.find(
            (m) => m.month === monthName
          );
          return (
            <td key={`${yearData.year}-${monthName}`} className="p-3">
              {monthData
                ? formatMontant(monthData.total_ttc,currency)
                : formatMontant(0)}
            </td>
          );
        })}
        <td className="p-3 font-semibold">
          {yearData.total ? formatMontant(yearData.total,currency) : formatMontant(0)}
        </td>
      </tr>
    ));
  };

  const renderMonthlyCountTable = (dataArray, keyToDisplay) => {
    if (!reportingData?.months || !dataArray || dataArray.length === 0) {
      return (
        <tr>
          <td colSpan={13} className="text-center text-gray-500 py-4">
            Aucune donnée mensuelle disponible.
          </td>
        </tr>
      );
    }

    return dataArray.map((yearData) => (
      <tr key={yearData.year} className="hover:bg-gray-50 even:bg-gray-50">
        <td className="p-3 font-medium">{yearData.year}</td>
        {Object.values(reportingData.months).map((monthName) => {
          const monthData = yearData[keyToDisplay].find(
            (m) => m.month === monthName
          );
          return (
            <td key={`${yearData.year}-${monthName}`} className="p-3">
              {monthData
                ? monthData.nb_project || monthData.nb_learner || 0
                : 0}
            </td>
          );
        })}
      </tr>
    ));
  };

  const renderSection = (title, content, count = null) => (
    <section className="mb-8 bg-white rounded-lg shadow-sm overflow-hidden">
      <header className="bg-gray-100 px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          {title}
          {count !== null && ` (${count})`}
        </h2>
      </header>
      <div className="p-6">{content}</div>
    </section>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-25 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          {/* <h1 className="text-2xl font-bold text-gray-800">Historique des Formations</h1> */}
          <p className="block text-sm font-medium text-gray-700 mb-1">
            Recherchez un client pour afficher son rapports de formation
          </p>
        </div>
      <div className="relative w-190 mx-auto">
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-grow">
            <input
              id="customer-search"
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200"
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
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200"
            disabled={loading || !customerInput}
          >
            {loading ? (
              <span className="flex items-center justify-center">
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
              </span>
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
          {/* Référents Section */}
          {renderSection(
            "Référents",
            reportingData.referents?.length > 0 ? (
              <ul className="space-y-4">
                {reportingData.referents.map((referent) => (
                  <li
                    key={referent.id || referent.email} // Use a unique key
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nom</p>
                        <p className="font-medium">{referent.name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{referent.email || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p>{referent.customerPhone || "-"}</p>
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Année
                    </th>
                    {reportingData.months &&
                      Object.values(reportingData.months).map((month) => (
                        <th
                          key={month}
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {month}
                        </th>
                      ))}
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Annuel
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
            "Nombre de projets par mois",
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Année
                    </th>
                    {reportingData.months &&
                      Object.values(reportingData.months).map((month) => (
                        <th
                          key={month}
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {month}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderMonthlyCountTable(
                    reportingData.results.count_projects,
                    "projects"
                  )}
                </tbody>
              </table>
            </div>,
            reportingData.total_project || 0
          )}

          {/* Nombre d'apprenants Section */}
          {renderSection(
            "Nombre d'apprenants par mois",
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Année
                    </th>
                    {reportingData.months &&
                      Object.values(reportingData.months).map((month) => (
                        <th
                          key={month}
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {month}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderMonthlyCountTable(
                    reportingData.results.learners,
                    "learners"
                  )}
                </tbody>
              </table>
            </div>,
            reportingData.total_learner || 0
          )}

          {/* Historique des projets Section (using story_projects) */}
          {renderSection(
            "Historique des projets",
            reportingData.results.story_projects?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Année
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mois
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Projet
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type de Projet
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coût TTC
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de Début
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de Fin
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportingData.results.story_projects.map((yearData) =>
                      yearData.story_projects.map((monthData) =>
                        monthData.projects.map((project) => (
                          <tr
                            key={project.idProjet}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-3 py-4 whitespace-nowrap">
                              {yearData.year}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              {monthData.month}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              {project.module_name}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              {project.project_type}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              {formatMontant(project.total_ttc,currency)}
                           
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              {project.dateDebut}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              {project.dateFin}
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Aucun historique de projet trouvé</p>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerReporting;
