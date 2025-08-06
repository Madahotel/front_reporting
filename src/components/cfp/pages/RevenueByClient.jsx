import React, { useState, useEffect, useMemo, useContext } from "react";
import api from "../../utils/api";
import { UserContext } from "../../context/UserContext";
import { formatMontant } from "../../utils/formatMontant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faEye,
  faSort,
  faFilter,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

const RevenueByClient = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeClientIds, setActiveClientIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [data, setData] = useState({
    customers: [],
    total_price: 0,
    totalProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    clients: [],
    includeNoClient: true,
    searchTerm: ""
  });

  const { setting } = useContext(UserContext);

  // Gestion des filtres
  const handleStatusFilter = (filter) => {
    setFilters(prev => ({ ...prev, status: filter }));
  };

  const handleClientSelection = (clientId) => {
    setFilters(prev => ({
      ...prev,
      clients: prev.clients.includes(clientId)
        ? prev.clients.filter(id => id !== clientId)
        : [...prev.clients, clientId]
    }));
  };

  const handleIncludeNoClient = () => {
    setFilters(prev => ({ ...prev, includeNoClient: !prev.includeNoClient }));
  };

  const handleSearch = (term) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      clients: [],
      includeNoClient: true,
      searchTerm: ""
    });
  };

  // Chargement des données
  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const fetchData = async (year) => {
    setLoading(true);
    setError(null);
    setActiveClientIds([]);
    try {
      const response = await api.get(`/cfp/reporting/chiffre/client/${year}`);
      const backendData = response.data;

      // Correction ici: pour chaque client sans id, on utilise une clé unique basée sur l'index
      const formattedCustomers = backendData.customers.map((customer, index) => ({
        ...customer,
        // Correction de la clé ici :
        // On utilise l'id_customer s'il existe, sinon on crée une clé unique avec l'index
        id: customer.id_customer || `no-client-${index}`,
        percentage: parseFloat(customer.percentage),
        projects: customer.projects.map((project, projectIndex) => ({
          ...project,
          // Même logique pour les projets : id_projet ou une clé unique avec l'index
          id_projet: project.id_projet || `no-id-${projectIndex}-${index}`,
          cost: parseFloat(project.total_ttc),
          start: project.date_debut,
          end: project.date_fin,
          detail: `https://projets.forma-fusion.com/cfp/projets/${project.idProjet}/detail`,
          percentage: parseFloat(project.percentage),
        })),
      }));

      setData({
        customers: formattedCustomers,
        total_price: backendData.total_price,
        totalProjects: backendData.totalProjects,
      });
    } catch (err) {
      setError("Impossible de charger les données pour l'année sélectionnée. Veuillez réessayer.");
      console.error("Erreur lors de la récupération des données:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
  const toggleClientDetails = (clientId) => {
    setActiveClientIds((prevIds) =>
      prevIds.includes(clientId)
        ? prevIds.filter((id) => id !== clientId)
        : [...prevIds, clientId]
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

  // Filtrage et tri des données
  const filteredAndSortedCustomers = useMemo(() => {
    let filteredCustomers = [...data.customers];

    // Filtre par recherche
    if (filters.searchTerm) {
      filteredCustomers = filteredCustomers.filter((customer) =>
        customer.etp_name?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (filters.status === "withProjects") {
      filteredCustomers = filteredCustomers.filter(
        (customer) => customer.projects?.length > 0
      );
    } else if (filters.status === "withoutProjects") {
      filteredCustomers = filteredCustomers.filter(
        (customer) => !customer.projects || customer.projects.length === 0
      );
    }

    // Filtre par clients sélectionnés
    if (filters.clients.length > 0) {
      filteredCustomers = filteredCustomers.filter((customer) =>
        filters.clients.includes(customer.id)
      );
    }

    // Filtre "Pas de client"
    if (!filters.includeNoClient) {
      filteredCustomers = filteredCustomers.filter(
        (customer) => customer.etp_name
      );
    }

    // Tri
    if (sortConfig.key) {
      filteredCustomers.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === "projects.length") {
          aValue = a.projects?.length || 0;
          bValue = b.projects?.length || 0;
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (sortConfig.key === "etp_name") {
          aValue = aValue || "zzzzzzzzzz";
          bValue = bValue || "zzzzzzzzzz";
        }

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

    return filteredCustomers;
  }, [data.customers, filters, sortConfig]);

  // Calcul des totaux
  const filteredTotals = useMemo(() => {
    const totalPrice = filteredAndSortedCustomers.reduce(
      (sum, customer) => sum + parseFloat(customer.total_ttc || 0),
      0
    );
    const totalProjects = filteredAndSortedCustomers.reduce(
      (sum, customer) => sum + (customer.projects?.length || 0),
      0
    );
    return { totalPrice, totalProjects };
  }, [filteredAndSortedCustomers]);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const expandVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeInOut" } },
  };

  const subTableColors = ["bg-blue-50", "bg-indigo-50", "bg-purple-50", "bg-pink-50"];

  // Affichage du loading
  if (loading) {
    return (
      <motion.div className="flex justify-center items-center min-h-screen bg-gray-50"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}/>
        <motion.p className="ml-4 text-lg text-gray-700"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          Chargement des données...
        </motion.p>
      </motion.div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <motion.div className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}>
          <FontAwesomeIcon icon={faEye} className="w-16 h-16 text-red-500 mb-4"/>
        </motion.div>
        <motion.p className="text-xl text-red-700 font-semibold text-center"
          initial={{ y: -20 }} animate={{ y: 0 }}>
          Une erreur est survenue :
        </motion.p>
        <motion.p className="text-md text-red-600 mt-2 text-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {error}
        </motion.p>
        <motion.button onClick={() => fetchData(selectedYear)}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Réessayer
        </motion.button>
      </motion.div>
    );
  }

  const currency = setting?.currency_code || "XOF";
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i - 1).sort((a, b) => b - a);

  return (
    <motion.div className="flex flex-col w-full h-full p-4 md:p-6 bg-gray-50"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col w-full max-w-screen-2xl px-4 md:px-8 mx-auto min-h-screen">
        <div className="w-full h-full">
          <div className="h-[calc(100%-100px)] overflow-auto">
            <motion.div className="px-4 pb-6 transition-all duration-300 bg-white rounded-xl shadow-lg"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              
              {/* En-tête */}
              <div className="mt-20 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    Chiffre d'affaires par Client
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Analyse détaillée des revenus par client et projet
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faSearch} className="text-gray-400"/>
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher un client..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={filters.searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                    {filters.searchTerm && (
                      <button onClick={() => handleSearch("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <FontAwesomeIcon icon={faTimes} className="text-gray-400 hover:text-gray-600"/>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="yearSelect" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Année:
                    </label>
                    <select
                      id="yearSelect"
                      className="w-24 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md appearance-none cursor-pointer focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
                      value={selectedYear}
                      onChange={handleYearChange}
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Filtres */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faFilter} className="text-gray-500 mr-2"/>
                      <span className="text-sm font-medium text-gray-700">Filtres:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStatusFilter("all")}
                        className={`px-3 py-1 text-sm rounded-md ${
                          filters.status === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Tous
                      </button>
                      <button
                        onClick={() => handleStatusFilter("withProjects")}
                        className={`px-3 py-1 text-sm rounded-md ${
                          filters.status === "withProjects" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Avec projets
                      </button>
                      <button
                        onClick={() => handleStatusFilter("withoutProjects")}
                        className={`px-3 py-1 text-sm rounded-md ${
                          filters.status === "withoutProjects" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Sans projets
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.includeNoClient}
                        onChange={handleIncludeNoClient}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Inclure "Pas de client"</span>
                    </label>
                    {(filters.searchTerm || filters.status !== "all" || filters.clients.length > 0 || !filters.includeNoClient) && (
                      <button onClick={clearFilters}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                        <FontAwesomeIcon icon={faTimes} className="mr-1"/>
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </div>

                {/* Sélection des clients */}
                {data.customers.length > 0 && (
                  <div className="mt-4">
                    <details className="group">
                      <summary className="flex items-center justify-between p-2 cursor-pointer text-sm font-medium text-gray-700">
                        <span>Filtrer par clients spécifiques</span>
                        <FontAwesomeIcon icon={faArrowDown} className="w-4 h-4 text-gray-500 transition-transform duration-200 group-open:rotate-180"/>
                      </summary>
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200 max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {data.customers
                            .filter((customer) => customer.etp_name)
                            .map((customer, index) => (
                              <div key={`client-filter-${customer.id}`} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`client-${customer.id}`}
                                  checked={filters.clients.includes(customer.id)}
                                  onChange={() => handleClientSelection(customer.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={`client-${customer.id}`}
                                  className="ml-2 text-sm text-gray-700 truncate"
                                  title={customer.etp_name}
                                >
                                  {customer.etp_name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>

              {/* Tableau principal */}
              <motion.div className="overflow-hidden rounded-lg border border-gray-200"
                variants={containerVariants} initial="hidden" animate="visible">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <motion.tr variants={itemVariants}>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg"></th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("etp_name")}
                      >
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={faSort}
                            className={`mr-1 ${sortConfig.key === "etp_name" ? "text-blue-500" : "text-gray-400"}`}
                          />
                          <span>Client</span>
                          {sortConfig.key === "etp_name" && (
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
                            icon={faSort}
                            className={`mr-1 ${sortConfig.key === "projects.length" ? "text-blue-500" : "text-gray-400"}`}
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
                            icon={faSort}
                            className={`mr-1 ${sortConfig.key === "total_ttc" ? "text-blue-500" : "text-gray-400"}`}
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
                    {filteredAndSortedCustomers.length > 0 ? (
                      filteredAndSortedCustomers.map((customer, index) => (
                        <React.Fragment key={`customer-${customer.id}`}>
                          <motion.tr
                            variants={itemVariants}
                            className={`transition-colors duration-200 ${
                              activeClientIds.includes(customer.id) ? "bg-blue-100" : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                {filters.clients.includes(customer.id) && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                )}
                                {customer?.etp_name ? (
                                  customer.etp_name
                                ) : (
                                  <span className="text-red-500 font-medium italic">Pas de client</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              <span className={`px-2 py-1 rounded-full ${
                                customer.projects?.length > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}>
                                {customer.projects?.length || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatMontant(customer.total_ttc, currency)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              <span className={`${
                                parseFloat(customer.percentage || 0) > 0 ? "text-green-600" : "text-gray-500"
                              }`}>
                                {customer.percentage?.toFixed(2) || "0.00"} %
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              <motion.button
                                className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleClientDetails(customer.id);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FontAwesomeIcon
                                  icon={faArrowDown}
                                  className={`transition-transform duration-300 ${
                                    activeClientIds.includes(customer.id) ? "rotate-180 text-blue-600" : ""
                                  }`}
                                />
                              </motion.button>
                            </td>
                          </motion.tr>

                          <AnimatePresence>
                            {activeClientIds.includes(customer.id) && (
                              <motion.tr
                                variants={expandVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={`${subTableColors[index % subTableColors.length]} border-t border-gray-300`}
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
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">#</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Projet</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Référence Projet</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Début - Fin</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Coût</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Pourcentage</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Voir Détails</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-300">
                                          {customer.projects?.length > 0 ? (
                                            customer.projects.map((project, projectIndex) => (
                                              <motion.tr
                                                // Correction de la clé ici
                                                key={`project-${customer.id}-${project.id_projet}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: projectIndex * 0.05 }}
                                                className="hover:bg-opacity-80 transition-colors duration-200"
                                              >
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                  {projectIndex + 1}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                  {project.moduleName}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                  {project.projectReference}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-left">
                                                  {project.dateDebut} - {project.dateFin}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                                  {formatMontant(project.total_ttc, currency)}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                                  {project.percentage?.toFixed(2) || "0.00"} %
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                                  <a href={project.detail} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-200">
                                                    <FontAwesomeIcon icon={faEye} />
                                                  </a>
                                                </td>
                                              </motion.tr>
                                            ))
                                          ) : (
                                            <tr>
                                              <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500 italic">
                                                Aucun projet pour ce client.
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
                      <tr>
                        <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center italic">
                          Aucune donnée disponible pour l'année sélectionnée.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>     
  );
};

export default RevenueByClient;