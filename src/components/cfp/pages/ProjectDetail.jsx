import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import ProjectActionsDropdown from "./ProjectActionsDropdown";
import { FaChartSimple } from "react-icons/fa6";
import { FaExclamationTriangle } from "react-icons/fa";
import { FaInfoCircle } from "react-icons/fa";
import {
  FaFolder,
  FaPen,
  FaHandshake,
  FaUtensils,
  FaDownload,
  FaUsers,
  FaCalendarDay,
  FaLandmark,
  FaBuilding,
  FaUserGraduate,
  FaChalkboard,
  FaBullseye,
  FaBoxOpen,
  FaStar,
  FaChevronDown,
  FaFilePdf,
  FaClock,
  FaDollarSign,
  FaEnvelope,
  FaEye,
  FaPlus,
} from "react-icons/fa6";
import ParticipantsAccordion from "./ParticipantsAccordion";
import EntrepriseAccordion from "./EntrepriseAccordion";

// --- Image Utility Constants and Functions ---
const DIGITALOCEAN_MODULES_BASE_URL =
  "https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/modules/";
const DEFAULT_PLACEHOLDER_FILENAME = "placeholder.webp";

const DIGITALOCEAN_COMPANIES_BASE_URL =
  "https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/companies/";
const DEFAULT_COMPANY_LOGO_FILENAME = "placeholder_company.webp";

const getModuleImageUrl = (filename) => {
  if (!filename || typeof filename !== "string") {
    return `${DIGITALOCEAN_MODULES_BASE_URL}${DEFAULT_PLACEHOLDER_FILENAME}`;
  }

  const cleanPath = filename.trim();

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  if (
    cleanPath.includes("..") ||
    cleanPath.startsWith("/") ||
    cleanPath.startsWith("\\")
  ) {
    console.warn(
      "Chemin d'image potentiellement non sécurisé détecté:",
      cleanPath
    );
    return `${DIGITALOCEAN_MODULES_BASE_URL}${DEFAULT_PLACEHOLDER_FILENAME}`;
  }

  const formattedFilename = cleanPath.startsWith("/")
    ? cleanPath.substring(1)
    : cleanPath;
  return `${DIGITALOCEAN_MODULES_BASE_URL}${formattedFilename}`;
};

const getCompanyLogoUrl = (filename) => {
  if (!filename || typeof filename !== "string") {
    return `${DIGITALOCEAN_COMPANIES_BASE_URL}${DEFAULT_COMPANY_LOGO_FILENAME}`;
  }

  const cleanPath = filename.trim();

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  if (
    cleanPath.includes("..") ||
    cleanPath.startsWith("/") ||
    cleanPath.startsWith("\\")
  ) {
    console.warn(
      "Chemin de logo d'entreprise potentiellement non sécurisé détecté:",
      cleanPath
    );
    return `${DIGITALOCEAN_COMPANIES_BASE_URL}${DEFAULT_COMPANY_LOGO_FILENAME}`;
  }

  const formattedFilename = cleanPath.startsWith("/")
    ? cleanPath.substring(1)
    : cleanPath;
  return `${DIGITALOCEAN_COMPANIES_BASE_URL}${formattedFilename}`;
};

function getEtpLogoUrl(filename) {
  if (!filename) {
    return "/default-logo.png"; // Make sure this path is correct relative to your public folder
  }
  return `https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/entreprises/${filename}`;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const accordionVariants = {
  open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  collapsed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
};

const ProjectDetail = () => {
  const { idProjet } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  // Initialize accordions as closed, but you can set some to true by default if needed
  const [openAccordions, setOpenAccordions] = useState({
    entreprise: false, // Assuming EntrepriseAccordion is controlled here
    participants: false, // Assuming ParticipantsAccordion is controlled here
    documents: false,
    agenda: false,
    // Add other accordions you want to control here
  });

useEffect(() => {
  const fetchProject = async () => {
    try {
      const response = await api.get(`/cfp/reporting/${idProjet}/detail`);
      console.log('API Response:', response.data); // Debug log
      if (response.data && response.data.success) {
        setProject(response.data.data);
      } else {
        setError("Failed to fetch project details.");
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
      setError("Error fetching project details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  fetchProject();
}, [idProjet]);

  const toggleAccordion = (id) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-700 bg-gray-50">
        <span className="loading loading-spinner loading-lg text-blue-500"></span>
        <p className="ml-3">Chargement des détails du projet...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center mt-20 p-6 bg-red-100 rounded-lg shadow-md mx-auto max-w-lg animate-fade-in">
        <FaExclamationTriangle className="inline-block text-3xl mr-2 mb-2" />
        <p className="font-semibold text-xl mb-2">Erreur de chargement !</p>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn btn-outline btn-error btn-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center mt-20 text-gray-600 p-6 bg-yellow-100 rounded-lg shadow-md mx-auto max-w-lg animate-fade-in">
        <FaInfoCircle className="inline-block text-3xl mr-2 mb-2" />
        <p className="font-semibold text-xl mb-2">Projet Non Trouvé</p>
        <p>
          Les détails du projet n'ont pas pu être chargés. Il se peut qu'il
          n'existe pas ou qu'une erreur soit survenue.
        </p>
      </div>
    );
  }
// Remplacer la déstructuration actuelle par :
const {
  projet = {},
  dates = {},
  duree = {},
  participants = { apprenants: [], entreprises: [] },
  evaluation = { note_moyenne: 0, nombre_participants: 0 },
  contenu = { seances: [], formateurs: [], programmes: [], modules: [] },
  logistique = { lieu: {}, restaurations: [] },
  administratif = { documents: [], dossier: {} },
  references = { objectifs: [], materiels: [], prerequis: [] },
  facturation = { devis: [], paiement: {} }
} = project || {}; // Ajout de || {} au cas où project serait null/undefined

  // Destructure nested objects with defaults
  const { apprenants = [], entreprises = [] } = participants;
  const {
    seances = [],
    formateurs = [],
    programmes = [],
    modules = [],
  } = contenu;
  const { lieu = {}, restaurations = [] } = logistique;
  const { documents = [], dossier = {} } = administratif;
  const { note_moyenne = 0, nombre_participants = 0 } = evaluation;
  const { objectifs = [], materiels = [], prerequis = [] } = references;
  const { devis = [], paiement = {} } = facturation; // Destructuration de facturation

  // Helper to format dates more robustly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date Invalide";
      }
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Date Invalide";
    }
  };

  // Helper to format time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    // Assuming timeString is in "HH:MM:SS" or "HH:MM" format
    return timeString.substring(0, 5); // Returns HH:MM
  };

  // Helper to format currency
  const formatCurrency = (amount, currency = "Ariary") => {
    if (typeof amount !== "number" || isNaN(amount)) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MGA", // Or your specific currency code like 'EUR', 'USD'
      minimumFractionDigits: 0, // No decimals for MGA, adjust as needed
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("MGA", currency); // Replace MGA with 'Ariary' or 'Ar'
  };

  // Helper to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Terminé":
        return "bg-green-500 text-white";
      case "Planifié":
        return "bg-blue-500 text-white";
      case "En Cours":
        return "bg-yellow-500 text-white";
      case "Annulé":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Helper to get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Payé":
        return "bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded";
      case "Partiellement Payé":
        return "bg-yellow-100 text-yellow-700 font-medium px-2 py-0.5 rounded";
      case "Impayé":
        return "bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded";
      default:
        return "bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded";
    }
  };

  return (
    <motion.div
      className="p-6 bg-gray-50 min-h-screen mt-16 lg:mt-20 font-sans"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Action Buttons */}
      <motion.div
        className="flex flex-wrap items-center gap-2 mb-6"
        variants={itemVariants}
      >
        <button className="btn btn-sm btn-ghost hover:bg-gray-200 transition duration-200 ease-in-out text-gray-700">
          <FaFolder className="mr-1 text-blue-600" /> Dossier
        </button>
        <button className="btn btn-sm btn-ghost hover:bg-gray-200 transition duration-200 ease-in-out text-gray-700">
          <FaPen className="mr-1 text-purple-600" /> Editer les informations de
          base
        </button>
        <button className="btn btn-sm btn-ghost hover:bg-gray-200 transition duration-200 ease-in-out text-gray-700">
          <FaHandshake className="mr-1 text-orange-600" /> Sous-traitant
        </button>
        <button className="btn btn-sm btn-ghost hover:bg-gray-200 transition duration-200 ease-in-out text-gray-700">
          <FaUtensils className="mr-1 text-green-600" /> Restauration
        </button>
        <a
          href={`/cfp/projets/detailProjetCfpPdf/${idProjet}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:no-underline"
        >
          <button className="btn btn-sm btn-ghost hover:bg-gray-200 transition duration-200 ease-in-out text-gray-700">
            <FaDownload className="mr-1 text-red-600" /> Télécharger en format
            PDF
          </button>
        </a>
      </motion.div>

      {/* Project Header */}
      <motion.div
        className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-200"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-3 flex flex-col md:flex-row items-start md:items-center">
            <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={getModuleImageUrl(projet.module_image)}
                className="object-cover w-full h-full"
                alt={projet.module_name || "Module Image"}
              />
            </div>
            <div className="ml-0 md:ml-8 mt-4 md:mt-0 flex-1">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2 leading-tight">
                {projet.module_name || "Nom du Module Inconnu"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 text-lg text-slate-600 mb-3">
                <span className="font-medium text-gray-800">
                  {projet.project_title || "Titre du Projet Inconnu"}
                </span>
                <span className="text-gray-500">
                  Ref:{" "}
                  <span className="font-semibold text-gray-700">
                    {projet.project_reference || "N/A"}
                  </span>
                </span>
                <span className="text-gray-500">
                  Dossier:{" "}
                  <span className="font-semibold text-gray-700">
                    {dossier.nom || "N/A"}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(note_moyenne)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-700 font-medium text-base">
                  {note_moyenne.toFixed(1)}{" "}
                  <span className="text-gray-500 text-sm">
                    ({nombre_participants} avis)
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-gray-700 text-base">
                <p>
                  <FaCalendarDay className="inline-block mr-2 text-blue-500" />
                  <span className="font-semibold">Début:</span>{" "}
                  <span className="capitalize">
                    {formatDate(projet.dateDebut)}
                  </span>
                </p>
                <p>
                  <FaCalendarDay className="inline-block mr-2 text-red-500" />
                  <span className="font-semibold">Échéance:</span>{" "}
                  <span className="capitalize">
                    {formatDate(projet.dateFin)}
                  </span>
                </p>
                <p>
                  <FaClock className="inline-block mr-2 text-indigo-500" />
                  <span className="font-semibold">Durée:</span>{" "}
                  {duree.total_heures ? `${duree.total_heures} heures` : "N/A"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-4 py-1.5 rounded-full text-sm font-medium border border-[#1565c0] text-[#1565c0] bg-blue-50 shadow-sm">
                  <FaBullseye className="inline-block mr-1" />{" "}
                  {projet.project_type || "Type Inconnu"}
                </span>
                <span className="px-4 py-1.5 rounded-full text-sm font-medium border border-[#00b4d8] text-[#00b4d8] bg-cyan-50 shadow-sm">
                  <FaBuilding className="inline-block mr-1" /> Présentielle{" "}
                  {/* Assuming 'Présentielle' is a fixed value or needs dynamic handling */}
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed text-sm lg:text-base max-h-28 overflow-hidden text-ellipsis bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-800">
                  Description :
                </span>{" "}
                {projet.module_description ||
                  "Aucune description fournie pour ce projet."}
              </p>
            </div>
          </div>

          <div className="md:col-span-1 flex flex-col items-start md:items-end justify-between mt-4 md:mt-0 space-y-4">
            <div className="flex items-center gap-2">
              <span
                className={`px-4 py-2 text-base font-semibold rounded-full shadow-md ${getStatusColor(
                  projet.project_status
                )}`}
                title="Statut actuel du projet"
              >
                {projet.project_status || "Statut Inconnu"}
              </span>
              <ProjectActionsDropdown />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        role="tablist"
        className="tabs tabs-boxed bg-white rounded-xl shadow-lg p-2 mb-8 border border-gray-200 flex flex-wrap justify-center"
        variants={itemVariants}
      >
        <button
          role="tab"
          className={`tab flex-1 md:flex-none transition-all duration-300 ease-in-out text-lg ${
            activeTab === "overview"
              ? "tab-active font-bold text-blue-700 bg-blue-50"
              : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          <FaInfoCircle className="mr-2" /> Vue d'ensemble
        </button>
        <button
          role="tab"
          className={`tab flex-1 md:flex-none transition-all duration-300 ease-in-out text-lg ${
            activeTab === "details"
              ? "tab-active font-bold text-blue-700 bg-blue-50"
              : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("details")}
        >
          <FaBoxOpen className="mr-2" /> Détails
        </button>
        {/* New tab for Facturation */}
        <button
          role="tab"
          className={`tab flex-1 md:flex-none transition-all duration-300 ease-in-out text-lg ${
            activeTab === "facturation"
              ? "tab-active font-bold text-blue-700 bg-blue-50"
              : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("facturation")}
        >
          <FaDollarSign className="mr-2" /> Facturation
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            role="tabpanel"
            className="tab-content pt-4"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 gap-6">
                {/* Entreprise Accordion - Make sure EntrepriseAccordion and ParticipantsAccordion handle isOpen and toggleAccordion props */}
                <EntrepriseAccordion
                  projet={projet}
                  entreprises={entreprises} // Pass enterprises data
                  isOpen={openAccordions.entreprise}
                  toggleAccordion={() => toggleAccordion("entreprise")}
                  accordionVariants={accordionVariants}
                  itemVariants={itemVariants}
                  getEtpLogoUrl={getEtpLogoUrl}
                />

                <ParticipantsAccordion
                  apprenants={apprenants} // Pass apprenants data
                  isOpen={openAccordions.participants}
                  toggleAccordion={() => toggleAccordion("participants")}
                  accordionVariants={accordionVariants}
                  itemVariants={itemVariants}
                />

                {/* Documents Accordion */}
                <motion.div
                  className="card bg-white shadow-lg rounded-xl border border-gray-200"
                  variants={itemVariants}
                >
                  <h2
                    className="px-6 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer select-none"
                    onClick={() => toggleAccordion("documents")}
                  >
                    <span className="inline-flex items-center text-xl font-semibold text-gray-800">
                      <FaFolder className="mr-3 text-green-600" />
                      Documents nécessaires
                    </span>
                    <motion.div
                      initial={false}
                      animate={{ rotate: openAccordions.documents ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaChevronDown className="text-gray-500 text-xl" />
                    </motion.div>
                  </h2>
                  <AnimatePresence>
                    {openAccordions.documents && (
                      <motion.div
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={accordionVariants}
                        className="overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex justify-end mb-4">
                            <button className="btn btn-sm btn-outline btn-primary">
                              <FaPlus className="mr-1" /> Ajouter
                            </button>
                          </div>
                          <p className="mb-4 text-lg text-slate-700 font-medium border-b pb-2">
                            Nom de dossier :{" "}
                            <span className="font-normal text-gray-600">
                              {dossier.nom || "N/A"}
                            </span>
                          </p>
                          {documents.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                              <table className="table w-full text-left">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="py-3 px-4 text-gray-600 font-semibold w-[35%] text-sm">
                                      Titre
                                    </th>
                                    <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                                      Section
                                    </th>
                                    <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                                      Type
                                    </th>
                                    <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                                      Date
                                    </th>
                                    <th className="py-3 px-4 text-gray-600 font-semibold text-sm text-right">
                                      Taille
                                    </th>
                                    <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {documents.map((doc) => (
                                    <tr
                                      key={doc.id}
                                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                    >
                                      <td className="py-2.5 px-4 text-gray-800">
                                        {doc.titre || "N/A"}
                                      </td>
                                      <td className="py-2.5 px-4 text-gray-600 text-sm">
                                        {doc.section || "N/A"}
                                      </td>
                                      <td className="py-2.5 px-4 text-gray-600 text-sm">
                                        {doc.type || "N/A"}
                                      </td>
                                      <td className="py-2.5 px-4 text-gray-600 text-sm">
                                        {formatDate(doc.date)}
                                      </td>
                                      <td className="py-2.5 px-4 text-right text-gray-600 text-sm">
                                        {doc.taille
                                          ? `${doc.taille} Mo`
                                          : "N/A"}
                                      </td>
                                      <td className="py-2.5 px-4 text-center">
                                        <button
                                          aria-label="Télécharger ce document"
                                          className="btn btn-ghost btn-sm text-purple-500 hover:bg-purple-50"
                                        >
                                          <FaDownload className="text-lg" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4 italic">
                              Aucun document disponible.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Agenda Accordion */}
                <motion.div
                  className="card bg-white shadow-lg rounded-xl border border-gray-200"
                  variants={itemVariants}
                >
                  <h2
                    className="px-6 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer select-none"
                    onClick={() => toggleAccordion("agenda")}
                  >
                    <span className="inline-flex items-center text-xl font-semibold text-gray-800">
                      <FaCalendarDay className="mr-3 text-orange-600" />
                      Agenda
                    </span>
                    <motion.div
                      initial={false}
                      animate={{ rotate: openAccordions.agenda ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaChevronDown className="text-gray-500 text-xl" />
                    </motion.div>
                  </h2>
                  <AnimatePresence>
                    {openAccordions.agenda && (
                      <motion.div
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={accordionVariants}
                        className="overflow-hidden"
                      >
                        <div className="p-6">
                          <p className="mb-4 text-gray-700 text-base leading-relaxed">
                            Ce projet inclut{" "}
                            <span className="font-bold text-blue-600">
                              {dates.total_jours || 0}
                            </span>{" "}
                            sessions de formation pour une durée totale de
                            <span className="font-bold text-blue-600">
                              {" "}
                              {duree.total_heures
                                ? `${duree.total_heures} heures`
                                : "0 heures"}
                            </span>
                            .
                          </p>
                          <div className="flex justify-end mb-4">
                            <button className="btn btn-sm btn-outline btn-primary">
                              <FaPen className="mr-1" /> Editer l'agenda
                            </button>
                          </div>
                          {seances.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                              <table className="table w-full text-left">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                                      Date
                                    </th>
                                    <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                                      Début
                                    </th>
                                    <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                                      Fin
                                    </th>
                                    <th className="py-3 px-4 text-gray-600 font-semibold text-sm text-right">
                                      Durée
                                    </th>
                                    <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {seances.map((seance) => (
                                    <tr
                                      key={seance.idSeance}
                                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                    >
                                      <td className="py-2.5 px-4 capitalize text-gray-800 text-sm">
                                        {formatDate(seance.dateSeance)}
                                      </td>
                                      <td className="py-2.5 px-4 text-gray-600 text-sm">
                                        {formatTime(seance.heureDebut)}
                                      </td>
                                      <td className="py-2.5 px-4 text-gray-600 text-sm">
                                        {formatTime(seance.heureFin)}
                                      </td>
                                      <td className="py-2.5 px-4 text-right text-gray-600 text-sm">
                                        {seance.duree
                                          ? `${seance.duree}h`
                                          : "N/A"}
                                      </td>
                                      <td className="py-2.5 px-4 text-center">
                                        <button
                                          aria-label="Editer la séance"
                                          className="btn btn-ghost btn-sm text-blue-500 hover:bg-blue-50"
                                        >
                                          <FaPen className="text-lg" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4 italic">
                              Aucune séance d'agenda disponible.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Right Column for Overview Tab */}
              <div className="lg:col-span-1 space-y-6">
                {/* Statistics Card */}
                <motion.div
                  className="card bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 ease-in-out"
                  variants={itemVariants}
                >
                  <h3 className="text-2xl font-bold mb-4 flex items-center">
                    <FaChartSimple className="mr-3 text-blue-200" />{" "}
                    Statistiques Clés
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-lg border-b border-blue-500 pb-2">
                      <span className="font-semibold flex items-center">
                        <FaUsers className="mr-2 text-blue-300" /> Participants:
                      </span>
                      <span className="text-blue-100 font-bold">
                        {apprenants.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-lg border-b border-blue-500 pb-2">
                      <span className="font-semibold flex items-center">
                        <FaUserGraduate className="mr-2 text-blue-300" />{" "}
                        Formateurs:
                      </span>
                      <span className="text-blue-100 font-bold">
                        {formateurs.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold flex items-center">
                        <FaClock className="mr-2 text-blue-300" /> Heures de
                        formation:
                      </span>
                      <span className="text-blue-100 font-bold">
                        {duree.total_heures || 0}h
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Main Location Card */}
                <motion.div
                  className="card bg-white shadow-lg rounded-xl border border-gray-200 p-6"
                  variants={itemVariants}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FaLandmark className="mr-2 text-purple-600" /> Lieu
                    Principal
                  </h3>
                  {lieu.nom_lieu ? (
                    <div className="space-y-2 text-gray-700">
                      <p>
                        <span className="font-medium">Nom:</span>{" "}
                        {lieu.nom_lieu}
                      </p>
                      <p>
                        <span className="font-medium">Adresse:</span>{" "}
                        {lieu.adresse_lieu || "Non spécifié"}
                      </p>
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {lieu.type_lieu || "Non spécifié"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      Aucun lieu principal spécifié.
                    </p>
                  )}
                </motion.div>

                {/* Restauration Card */}
                <motion.div
                  className="card bg-white shadow-lg rounded-xl border border-gray-200 p-6"
                  variants={itemVariants}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FaUtensils className="mr-2 text-red-600" /> Restauration
                  </h3>
                  {restaurations.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      {restaurations.map((resto, index) => (
                        <li key={index}>
                          {resto.type_restauration} ({formatDate(resto.date)})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">
                      Aucune restauration prévue.
                    </p>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

{/* Détails Tab */}
{activeTab === "details" && (
  <motion.div
    key="details-tab"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    role="tabpanel"
    className="tab-content pt-4"
  >
    <div className="grid grid-cols-1 gap-6">
      {/* Modules */}
      <motion.div className="card bg-white shadow-lg rounded-xl border border-gray-200" variants={itemVariants}>
        <h2 className="px-6 py-4 border-b border-gray-200 text-xl font-semibold text-gray-800 flex items-center">
          <FaBoxOpen className="mr-3 text-cyan-600" /> Modules
        </h2>
        <div className="p-6">
          {modules && modules.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Description</th>
                    <th>Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module) => (
                    <tr key={module.idModule || Math.random()}>
                      <td>{module.module_name || "N/A"}</td>
                      <td>{module.module_description || "N/A"}</td>
                      <td>{module.duree_heures || "N/A"} heures</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">Aucun module disponible</p>
          )}
        </div>
      </motion.div>

      {/* Objectifs */}
      <motion.div className="card bg-white shadow-lg rounded-xl border border-gray-200" variants={itemVariants}>
        <h2 className="px-6 py-4 border-b border-gray-200 text-xl font-semibold text-gray-800 flex items-center">
          <FaBullseye className="mr-3 text-teal-600" /> Objectifs
        </h2>
        <div className="p-6">
          {objectifs && objectifs.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {objectifs.map((obj, index) => {
                // Handle both string and object cases
                const text = typeof obj === 'object' 
                  ? obj.objectif || obj.idObjectif || JSON.stringify(obj) 
                  : obj;
                return <li key={index}>{text}</li>;
              })}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Aucun objectif défini</p>
          )}
        </div>
      </motion.div>
    </div>
  </motion.div>
)}

{/* Facturation Tab */}
{activeTab === "facturation" && (
  <motion.div
    key="facturation-tab"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    role="tabpanel"
    className="tab-content pt-4"
  >
    <div className="grid grid-cols-1 gap-6">
      {/* Devis */}
      <motion.div className="card bg-white shadow-lg rounded-xl border border-gray-200" variants={itemVariants}>
        <h2 className="px-6 py-4 border-b border-gray-200 text-xl font-semibold text-gray-800 flex items-center">
          <FaFilePdf className="mr-3 text-red-600" /> Devis
        </h2>
        <div className="p-6">
          {devis && devis.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devis.map((item) => (
                    <tr key={item.idDevis || Math.random()}>
                      <td>{item.numero_devis || "N/A"}</td>
                      <td>{formatDate(item.date_devis)}</td>
                      <td>{formatCurrency(item.montant_total)}</td>
                      <td>
                        <span className={`badge ${getPaymentStatusColor(item.status_devis)}`}>
                          {item.status_devis || "N/A"}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm">
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">Aucun devis disponible</p>
          )}
        </div>
      </motion.div>

      {/* Paiement */}
      <motion.div className="card bg-white shadow-lg rounded-xl border border-gray-200" variants={itemVariants}>
        <h2 className="px-6 py-4 border-b border-gray-200 text-xl font-semibold text-gray-800 flex items-center">
          <FaDollarSign className="mr-3 text-green-600" /> Paiements
        </h2>
        <div className="p-6">
          {paiement && Object.keys(paiement).length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className={`badge ${getPaymentStatusColor(paiement.status_paiement)}`}>
                  {paiement.status_paiement || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total dû:</span>
                <span>{formatCurrency(paiement.montant_total_du)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payé:</span>
                <span className="text-green-600">{formatCurrency(paiement.montant_paye)}</span>
              </div>
              <div className="flex justify-between">
                <span>Reste:</span>
                <span className="text-red-600">{formatCurrency(paiement.solde_restant)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dernier paiement:</span>
                <span>{formatDate(paiement.date_dernier_paiement)}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">Aucune information de paiement disponible</p>
          )}
        </div>
      </motion.div>
    </div>
  </motion.div>
)}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectDetail;
