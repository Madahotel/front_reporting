import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import debounce from "lodash.debounce"; // Assurez-vous que lodash.debounce est installé (npm install lodash.debounce)

const ApprenantFormationTimeline = () => {
  const [apprenantNameInput, setApprenantNameInput] = useState("");
  const [allInitialLearnerFormations, setAllInitialLearnerFormations] =
    useState([]);
  const [displayedLearnerFormations, setDisplayedLearnerFormations] = useState(
    []
  );
  const [suggestedLearners, setSuggestedLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Indique si une recherche a déjà été soumise

  const inputRef = useRef(null);
  const DIGITALOCEAN_MODULES_BASE_URL =
    "https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/modules/";
  const DEFAULT_PLACEHOLDER_FILENAME = "placeholder.webp";

  const getModuleImageUrl = (filename) => {
    if (filename && typeof filename === "string" && filename.trim() !== "") {
      const cleanPath = filename.trim();
      // Prévention des traversées de répertoires ou des chemins absolus
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
      } else if (
        cleanPath.startsWith("http://") ||
        cleanPath.startsWith("https://")
      ) {
        // Si le chemin est déjà une URL complète
        return cleanPath;
      } else {
        // Supprime un éventuel slash au début si présent
        const formattedFilename = cleanPath.startsWith("/")
          ? cleanPath.substring(1)
          : cleanPath;
        return `${DIGITALOCEAN_MODULES_BASE_URL}${formattedFilename}`;
      }
    }
    return `${DIGITALOCEAN_MODULES_BASE_URL}${DEFAULT_PLACEHOLDER_FILENAME}`;
  };

  // Chargement initial de toutes les données des apprenants
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/cfp/reporting/apprenant");
        const data = response.data.all_learner || [];

        const enhancedData = data.map((learner) => ({
          ...learner,
          imageUrl: getModuleImageUrl(learner.module_image),
          // Calculer duration_days si non fourni par l'API
          duration_days:
            learner.duration_days ||
            Math.ceil(
              (new Date(learner.dateFin) - new Date(learner.dateDebut)) /
                (1000 * 60 * 60 * 24)
            ),
          duration_hours: learner.dureeH || "N/A",
          level: learner.level || "Non spécifié",
          price_info:
            learner.price_info || "Pour connaître nos tarifs, contactez-nous.",
          average_rating: learner.average_rating || "N/A",
          review_count: learner.review_count || "0",
          description: learner.description || "Description non disponible.",
        }));

        setAllInitialLearnerFormations(enhancedData);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des données initiales.");
        console.error("Erreur de l'API :", err);
        setAllInitialLearnerFormations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Fonction de débouchage pour les suggestions de recherche
  const debouncedFilterSuggestions = useMemo(
    () =>
      debounce((name) => {
        if (name.length < 2) {
          setSuggestedLearners([]);
          setShowSuggestions(false);
          return;
        }

        const lowerCaseName = name.toLowerCase();
        const uniqueLearners = [];
        const seenEmpMatricules = new Set(); // Pour stocker les matricules déjà ajoutés

        allInitialLearnerFormations.forEach((learner) => {
          const fullName = `${learner.emp_name || ""} ${
            learner.emp_firstname || ""
          }`.toLowerCase();
          if (
            !seenEmpMatricules.has(learner.emp_matricule) && // Vérifie l'unicité
            fullName.includes(lowerCaseName)
          ) {
            seenEmpMatricules.add(learner.emp_matricule);
            uniqueLearners.push({
              emp_matricule: learner.emp_matricule,
              emp_name: learner.emp_name,
              emp_firstname: learner.emp_firstname,
              learner_id: learner.learner_id, // Utile si vous avez besoin de l'ID de l'apprenant pour d'autres actions
            });
          }
        });
        setSuggestedLearners(uniqueLearners);
        setShowSuggestions(uniqueLearners.length > 0); // N'affiche les suggestions que si des résultats sont trouvés
      }, 300),
    [allInitialLearnerFormations] // Dépend de allInitialLearnerFormations pour recalculer si les données changent
  );

  // Gère le changement dans le champ de saisie
  const handleInputChange = (e) => {
    const name = e.target.value;
    setApprenantNameInput(name);
    // Si l'input est vide, réinitialise les suggestions
    if (name.trim() === "") {
      setSuggestedLearners([]);
      setShowSuggestions(false);
      // Optionnel: si vous voulez réinitialiser l'affichage quand l'input est vide
      // setDisplayedLearnerFormations([]);
      // setHasSearched(false);
    } else {
      debouncedFilterSuggestions(name);
    }
  };

  // Gère la sélection d'un apprenant depuis les suggestions
  const handleLearnerSelection = (
    selectedEmpMatricule,
    selectedName,
    selectedFirstname
  ) => {
    setApprenantNameInput(`${selectedName} ${selectedFirstname}`);
    setSuggestedLearners([]); // Cache les suggestions
    setShowSuggestions(false); // Cache le conteneur de suggestions
    filterAndDisplayData(selectedEmpMatricule); // Déclenche le filtrage avec le matricule
  };

  // Gère la soumission du formulaire (clic sur "Générer")
  const handleSubmit = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    filterAndDisplayData(); // Déclenche le filtrage basé sur l'input actuel
  };

  // Fonction principale pour filtrer et afficher les données
  const filterAndDisplayData = (specificMatricule = null) => {
    setLoading(true); // Active l'état de chargement
    setError(null); // Réinitialise les erreurs
    const nameToFilter = apprenantNameInput.trim().toLowerCase();

    let filteredResults = [];

    if (specificMatricule) {
      // Filtrage par matricule (quand une suggestion est sélectionnée)
      filteredResults = allInitialLearnerFormations.filter(
        (learner) => learner.emp_matricule === specificMatricule
      );
    } else if (nameToFilter) {
      // Filtrage par nom/prénom (quand le bouton "Générer" est cliqué ou si l'input a du texte)
      filteredResults = allInitialLearnerFormations.filter(
        (learner) =>
          (learner.emp_name &&
            learner.emp_name.toLowerCase().includes(nameToFilter)) ||
          (learner.emp_firstname &&
            learner.emp_firstname.toLowerCase().includes(nameToFilter))
      );
    } else {
      // Si l'input est vide et aucune suggestion n'a été sélectionnée (cas du bouton Générer avec input vide)
      filteredResults = []; // Ne rien afficher
    }

    setDisplayedLearnerFormations(filteredResults);
    setSuggestedLearners([]); // Cache les suggestions après le filtrage
    setShowSuggestions(false); // Cache le conteneur de suggestions
    setHasSearched(true); // Indique qu'une recherche a été effectuée
    setLoading(false); // Désactive l'état de chargement
  };

  // Gère le focus sur l'input pour afficher les suggestions si elles existent
  const handleFocus = () => {
    // Affiche les suggestions si l'input n'est pas vide et qu'il y a des suggestions
    if (apprenantNameInput.length > 0 && suggestedLearners.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Gère la perte de focus pour cacher les suggestions
  const handleBlur = () => {
    // Utilise un setTimeout pour permettre le clic sur les suggestions avant de les cacher
    setTimeout(() => {
      setShowSuggestions(false);
    }, 100);
  };

  // Fonction utilitaire pour afficher les étoiles de notation
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <i key={i} className="fas fa-star-half-alt text-yellow-400"></i>
        );
      } else {
        stars.push(<i key={i} className="far fa-star text-yellow-400"></i>);
      }
    }
    return stars;
  };

  // Fonction utilitaire pour formater le mois en abrégé
  const formatShortMonth = (dateString) => {
    const date = new Date(dateString);
    const monthNames = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
      "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
    ];
    return monthNames[date.getMonth()];
  };

  return (
    <div className="container mx-auto px-4 py-25">
      {/* Search Section */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Historique des Formations
          </h1>
          <p className="text-gray-600 mt-2">
            Recherchez un apprenant pour afficher son parcours de formation
          </p>
        </div>

        <div className="relative">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-grow">
              <input
                ref={inputRef}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                autoComplete="off"
                value={apprenantNameInput}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={loading}
                placeholder="Nom de l'apprenant..."
              />
              {showSuggestions && suggestedLearners.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestedLearners.map((learner) => (
                    <li
                      key={learner.emp_matricule}
                      className="px-4 py-2 cursor-pointer hover:bg-purple-50"
                      // Utilisez onMouseDown pour gérer le clic avant que le onBlur de l'input ne se déclenche
                      onMouseDown={() =>
                        handleLearnerSelection(
                          learner.emp_matricule,
                          learner.emp_name,
                          learner.emp_firstname
                        )
                      }
                    >
                      {learner.emp_name} {learner.emp_firstname} (Matricule: {learner.emp_matricule})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200"
              disabled={loading} // Désactive le bouton pendant le chargement
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
                "Générer"
              )}
            </button>
          </form>
        </div>

        {/* Status Messages */}
        <div className="mt-4 text-center">
          {error && <p className="text-red-500">{error}</p>}
          {!loading && hasSearched && displayedLearnerFormations.length === 0 && !error && (
            <p className="text-gray-500">
              Aucune formation trouvée pour cet apprenant.
            </p>
          )}
          {!loading && !hasSearched && !error && (
            <p className="text-gray-500">
              Veuillez rechercher un apprenant pour afficher ses formations.
            </p>
          )}
        </div>
      </div>

      {/* Timeline Display Section */}
      <div className="space-y-4">
        {hasSearched && // Affiche la timeline uniquement après une recherche
          displayedLearnerFormations.map((learner, index) => {
            const startDate = new Date(learner.dateDebut);
            const day = startDate.getDate();
            const month = formatShortMonth(startDate);
            const year = startDate.getFullYear();

            return (
              <div
                key={`${learner.emp_matricule}-${learner.idModule}-${index}`}
                className="relative w-full flex flex-col sm:flex-row items-start mb-4"
              >
                {/* Date Circle */}
                <div className="bg-[#a462a4] text-white rounded-full border-4 border-white p-2 text-center w-16 h-16 flex flex-col justify-center items-center shadow mr-0 sm:mr-4 mb-3 sm:mb-0 z-10">
                  <p className="text-base font-bold">{day}</p>
                  <p className="text-xs">{month} {year}</p>
                </div>
                {/* Ligne verticale de la timeline */}
                <div className="absolute top-0 sm:top-[2rem] left-8 sm:left-[2rem] w-0.5 bg-gray-300 h-full z-0"></div>

                {/* Card */}
                <div className="flex-1 flex flex-col lg:flex-row bg-white rounded-md shadow-sm overflow-hidden p-3 w-full">
                  {/* Image */}
                  <div className="flex justify-center w-full lg:w-1/3 relative mb-3 lg:mb-0">
                    <img
                      src={learner.imageUrl}
                      alt={`Formation ${learner.module_name}`}
                      className="w-40 h-40 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = `${DIGITALOCEAN_MODULES_BASE_URL}${DEFAULT_PLACEHOLDER_FILENAME}`;
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="w-full lg:w-2/3 pl-0 lg:pl-4 text-xs">
                    <Link
                      title={learner.module_name}
                      to={`/formation_inter/detail/${learner.idModule}/${learner.learner_id}`}
                      className="text-sm font-semibold text-purple-700 hover:underline line-clamp-1"
                    >
                      {learner.module_name}
                    </Link>
                    <p className="mt-1 text-gray-600">
                      📅 {new Date(learner.dateDebut).toLocaleDateString("fr-FR")} -{" "}
                      {new Date(learner.dateFin).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="mt-1 text-gray-600">
                      📍 {learner.salle_name}, {learner.salle_quartier}
                    </p>
                    <p className="mt-1 text-gray-600">
                      ⏱ {learner.duration_days} jours | {learner.duration_hours} h
                    </p>
                    <p className="mt-1 text-gray-600">🎖 {learner.level}</p>
                    <p className="mt-1 font-medium">💶 {learner.price_info}</p>

                    {/* Rating */}
                    <div className="flex items-center mt-2 text-gray-500">
                      <div className="mr-1">{renderRating(learner.average_rating)}</div>
                      <span className="text-xs">
                        {learner.average_rating} ({learner.review_count} avis)
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-2 text-gray-700 line-clamp-2">
                      {learner.description}
                    </p>

                    {/* Info Apprenant / Entreprise */}
                    <div className="mt-4 pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-start">
                          <span className="mr-2">👤</span>
                          <div>
                            <p className="font-medium text-gray-800">
                              {learner.emp_name} {learner.emp_firstname}
                            </p>
                            <p className="text-gray-500">Apprenant</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="mr-2">🏢</span>
                          <div>
                            <p className="font-medium text-gray-800">
                              {learner.etp_name}
                            </p>
                            <p className="text-gray-500">Entreprise</p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-[0.7rem]">
                        <div className="bg-gray-50 px-2 py-1 rounded">
                          <p className="text-gray-500">Projet</p>
                          <p className="font-medium">{learner.project_status}</p>
                        </div>
                        <div className="bg-gray-50 px-2 py-1 rounded">
                          <p className="text-gray-500">Type</p>
                          <p className="font-medium">{learner.project_type}</p>
                        </div>
                        <div className="bg-gray-50 px-2 py-1 rounded">
                          <p className="text-gray-500">Présence</p>
                          <p className="font-medium">
                            {learner.taux_de_presence}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ApprenantFormationTimeline;