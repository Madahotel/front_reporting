import React, { useState, useEffect, useRef, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserContext } from "../../context/UserContext";
import api from "../../utils/api";
import { useParams } from "react-router-dom";
import DownloadProgramButton from './DownloadProgramButton';

import {
  faMedal,
  faMoneyBill,
  faClock,
  faPerson,
  faChevronDown,
  faChevronUp,
  faStar,
  faStarHalfAlt,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  faClock as faRegularClock,
  faMoneyBill1 as faRegularMoneyBill1,
  faStar as faEmptyStar,
} from "@fortawesome/free-regular-svg-icons";

const IMAGE_BASE_URL = "https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/";
const MODULE_IMAGE_PATH = "modules/";
const ENTREPRISE_IMAGE_PATH = "entreprises/";

const formatMontant = (amount, currencyCode = "XOF") => {
  if (typeof amount !== 'number' && typeof amount !== 'string') {
    return 'N/A';
  }
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

const StarRating = ({ average }) => {
  const safeAverage = typeof average === "number" && !isNaN(average) ? average : 0;

  return (
    <div className="flex items-center" title={`Note: ${safeAverage.toFixed(1)}/5`}>
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        let iconToUse;
        let iconColorClass;

        if (safeAverage >= starValue) {
          iconToUse = faStar;
          iconColorClass = "text-yellow-400";
        } else if (safeAverage > starValue - 1 && safeAverage < starValue) {
          iconToUse = faStarHalfAlt;
          iconColorClass = "text-yellow-400";
        } else {
          iconToUse = faEmptyStar;
          iconColorClass = "text-gray-300";
        }

        return (
          <FontAwesomeIcon
            key={i}
            icon={iconToUse}
            className={`w-5 h-5 ${iconColorClass}`}
          />
        );
      })}
    </div>
  );
};

const SuggestedFormationCard = ({ formation }) => {
  const { setting } = useContext(UserContext);
  const currency = setting?.currency_code || "XOF";

  const {
    idModule,
    module_image,
    logo_cfp,
    module_name,
    description,
    dureeJ,
    dureeH,
    module_level_name,
    prix,
    note = {},
  } = formation;

  const imageUrl = module_image
    ? `${IMAGE_BASE_URL}${MODULE_IMAGE_PATH}${module_image}`
    : "";
  const logoUrl = logo_cfp
    ? `${IMAGE_BASE_URL}${ENTREPRISE_IMAGE_PATH}${logo_cfp}`
    : "";

  return (
    <div className="card bg-white w-[280px] flex-shrink-0 h-[28rem] overflow-hidden shadow-lg rounded-xl transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl mx-2">
      <a
        href={`/formation/detail/${idModule}`}
        className="hover:text-inherit h-full flex flex-col"
      >
        <figure className="h-1/2 relative bg-gradient-to-r from-purple-50 to-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={module_name || "Image de formation"}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/600x400/F3E8FF/4A5568?text=Image+non+disponible";
              }}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-purple-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-lg">
                Image non disponible
              </span>
            </div>
          )}
          <div className="absolute top-2 left-2 w-20 h-10 overflow-hidden rounded-lg border border-white shadow-sm bg-white flex items-center justify-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo entreprise"
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/80x40/E2E8F0/718096?text=Logo";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-500">
                Logo
              </div>
            )}
          </div>
        </figure>
        <div className="card-body p-4 h-1/2 flex flex-col">
          <h2
            className="card-title line-clamp-1 text-gray-800 !text-lg font-semibold mb-2"
            title={module_name}
          >
            {module_name || "Nom de formation inconnu"}
          </h2>
          <div className="flex flex-col gap-2 text-gray-600 flex-grow">
            <p className="line-clamp-2 text-sm text-gray-700">
              {description || "Aucune description disponible"}
            </p>
            <div className="mt-auto space-y-1">
              <p className="text-sm flex items-center">
                <FontAwesomeIcon
                  icon={faRegularClock}
                  className="mr-2 text-purple-600"
                />
                {dureeJ || 0} jours | {dureeH || 0} heures
              </p>
              <p className="text-sm flex items-center">
                <FontAwesomeIcon
                  icon={faMedal}
                  className="mr-2 text-purple-600"
                />
                {module_level_name || "Niveau non spécifié"}
              </p>
              <p className="text-sm flex items-center">
                <FontAwesomeIcon
                  icon={faRegularMoneyBill1}
                  className="mr-2 text-purple-600"
                />
                À partir de{" "}
                <span className="font-bold text-gray-800 ml-1">
                  {formatMontant(prix, currency)}
                </span>
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <StarRating average={note.average || 0} />
                <p className="text-sm text-gray-600">
                  {note.average ? note.average.toFixed(1) : "0.0"}
                  <span className="text-gray-400 text-xs">
                    {" "}
                    ({note.totalEmployees || 0} avis)
                  </span>
                </p>
              </div>
            </div>
          </div>
          </div>
        </a>
    </div>
  );
};

const FormationDetail = () => {
  const { idModule, idProjet } = useParams();
  const [formationData, setFormationData] = useState(null);
  const [showObjectives, setShowObjectives] = useState(false);
  const [showPrograms, setShowPrograms] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const { setting } = useContext(UserContext);
  const currency = setting?.currency_code || "XOF";

  useEffect(() => {
    const fetchFormationData = async () => {
      if (!idModule || !idProjet) {
        setError("IDs de module ou de projet manquants dans l'URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(
          `/cfp/reporting/formation_inter/detail/${idModule}/${idProjet}`
        );

        const processedData = {
          ...response.data,
          module: {
            ...response.data.module,
            module_image: response.data.module.module_image
              ? `${IMAGE_BASE_URL}${MODULE_IMAGE_PATH}${response.data.module.module_image}`
              : null,
          },
          cfp: {
            ...response.data.cfp,
            logo: response.data.cfp.logo
              ? `${IMAGE_BASE_URL}${ENTREPRISE_IMAGE_PATH}${response.data.cfp.logo}`
              : null,
          },
          onlineModules: response.data.onlineModules?.map((domain) => ({
            ...domain,
            modules: domain.modules?.map((mod) => ({
              ...mod,
              module_image: mod.module_image
                ? `${IMAGE_BASE_URL}${MODULE_IMAGE_PATH}${mod.module_image}`
                : null,
              logo_cfp: mod.logo_cfp
                ? `${IMAGE_BASE_URL}${ENTREPRISE_IMAGE_PATH}${mod.logo_cfp}`
                : null,
            })),
          })),
        };

        setFormationData(processedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(
          "Impossible de charger les détails de la formation. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFormationData();
  }, [idModule, idProjet]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !formationData) return;

    let autoScrollInterval;
    const scrollIntervalTime = 5000;

    const startAutoScroll = () => {
      autoScrollInterval = setInterval(() => {
        if (!isPaused) {
          const cardWidth = 280;
          const cardMargin = 16;
          const scrollAmount = cardWidth + cardMargin;

          const currentScroll = scrollContainer.scrollLeft;
          const maxScroll =
            scrollContainer.scrollWidth - scrollContainer.clientWidth;

          let nextScrollPosition = currentScroll + scrollAmount;

          if (nextScrollPosition >= maxScroll - scrollAmount / 2) {
            nextScrollPosition = 0;
          }

          scrollContainer.scrollTo({
            left: nextScrollPosition,
            behavior: "smooth",
          });
        }
      }, scrollIntervalTime);
    };

    const stopAutoScroll = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
      }
    };

    stopAutoScroll();
    startAutoScroll();

    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      stopAutoScroll();
      if (scrollContainer) {
        scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
        scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isPaused, formationData]);

  useEffect(() => {
    const checkScrollPosition = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, [formationData]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const cardWidth = 280;
      const cardMargin = 16;
      const scrollAmount = cardWidth + cardMargin;
      const currentScroll = scrollContainerRef.current.scrollLeft;

      if (direction === "left") {
        scrollContainerRef.current.scrollTo({
          left: currentScroll - scrollAmount,
          behavior: "smooth",
        });
      } else {
        scrollContainerRef.current.scrollTo({
          left: currentScroll + scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        <p className="ml-4 text-lg text-gray-700">
          Chargement des détails de la formation...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-purple-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-md text-center">
          <p className="font-bold text-xl mb-2">Erreur !</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!formationData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-purple-50">
        <div className="bg-purple-100 border border-purple-400 text-purple-700 px-6 py-4 rounded-lg shadow-md max-w-md text-center">
          <p className="font-bold text-xl mb-2">Information</p>
          <p>Aucune donnée disponible pour cette formation.</p>
        </div>
      </div>
    );
  }

  const {
    module,
    cfp,
    cibles,
    prerequis,
    objectifs,
    prog,
    note,
    onlineModules,
  } = formationData;
  const safeNote = note || { average: 0, totalEmployees: 0 };

  const suggestedModules = onlineModules
    .flatMap((domain) => domain.modules)
    .filter((mod) => mod.idModule !== parseInt(idModule));

  return (
    <div className="w-full min-h-screen bg-purple-50 pt-20 pb-10 font-inter mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-10 border border-gray-200">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 h-80 md:h-96 relative">
              {module.module_image ? (
                <img
                  src={module.module_image}
                  alt={module.moduleName || "Image de formation"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/600x400/F3E8FF/4A5568?text=Image+non+disponible";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">
                    Image non disponible
                  </span>
                </div>
              )}
            </div>
            <div className="lg:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                {module.moduleName || "Nom de module inconnu"}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
                {module.module_subtitle || "Pas de sous-titre disponible"}
              </p>
              <div className="flex items-center space-x-4 mb-6">
                <StarRating average={safeNote.average} />
                <span className="text-gray-700 font-semibold text-lg">
                  {safeNote.average.toFixed(1)}{" "}
                  <span className="text-gray-500 text-base">
                    ({safeNote.totalEmployees} avis)
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm flex items-center space-x-3">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-purple-600 text-2xl"
                  />
                  <div>
                    <p className="text-gray-500 text-sm">Durée</p>
                    <p className="font-semibold text-gray-800">
                      {module.dureeJ || 0} jours | {module.dureeH || 0} heures
                    </p>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm flex items-center space-x-3">
                  <FontAwesomeIcon
                    icon={faMedal}
                    className="text-purple-600 text-2xl"
                  />
                  <div>
                    <p className="text-gray-500 text-sm">Niveau</p>
                    <p className="font-semibold text-gray-800">
                      {module.module_level_name || "Non spécifié"}
                    </p>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm flex items-center space-x-3">
                  <FontAwesomeIcon
                    icon={faMoneyBill}
                    className="text-purple-600 text-2xl"
                  />
                  <div>
                    <p className="text-gray-500 text-sm">Prix</p>
                    <p className="font-semibold text-gray-800">
                      {formatMontant(module.prix, currency)}
                    </p>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm flex items-center space-x-3">
                  <FontAwesomeIcon
                    icon={faPerson}
                    className="text-purple-600 text-2xl"
                  />
                  <div>
                    <p className="text-gray-500 text-sm">Participants</p>
                    <p className="font-semibold text-gray-800">
                      {module.maxApprenant === null
                        ? "Illimité"
                        : `Max ${module.maxApprenant}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-8">
            {cibles && cibles.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Public cible
                </h2>
                <ul className="space-y-2 ml-5 list-none">
                  {cibles.map((cible, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <FontAwesomeIcon
                        icon={faPerson}
                        className="flex-shrink-0 mr-3 mt-1 text-purple-600"
                      />
                      <p>{cible}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Objectifs de la formation
                </h2>
                {objectifs && objectifs.length > 0 && (
                  <button
                    onClick={() => setShowObjectives(!showObjectives)}
                    className="text-purple-600 hover:text-purple-800 transition-colors duration-200 flex items-center text-sm font-medium"
                  >
                    {showObjectives ? (
                      <>
                        <FontAwesomeIcon icon={faChevronUp} className="mr-1" />
                        Réduire
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className="mr-1"
                        />
                        Voir plus
                      </>
                    )}
                  </button>
                )}
              </div>
              <ul
                className={`space-y-3 list-none ${
                  showObjectives ? "" : "max-h-96 overflow-hidden"
                }`}
              >
                {objectifs && objectifs.length > 0 ? (
                  objectifs.map((objectif, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <div className="flex-shrink-0 h-5 w-5 text-purple-600 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p className="ml-3">{objectif.objectif}</p>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Aucun objectif renseigné.</li>
                )}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Programme détaillé
                </h2>
                {prog && prog.length > 0 && (
                  <button
                    onClick={() => setShowPrograms(!showPrograms)}
                    className="text-purple-600 hover:text-purple-800 transition-colors duration-200 flex items-center text-sm font-medium"
                  >
                    {showPrograms ? (
                      <>
                        <FontAwesomeIcon icon={faChevronUp} className="mr-1" />
                        Réduire
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className="mr-1"
                        />
                        Voir plus
                      </>
                    )}
                  </button>
                )}
              </div>
              <div
                className={`space-y-6 ${
                  showPrograms ? "" : "max-h-96 overflow-hidden"
                }`}
              >
                {prog && prog.length > 0 ? (
                  prog.map((item, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-purple-600 pl-4 py-1"
                    >
                      <h3
                        className="text-lg font-semibold text-gray-800 mb-1"
                        dangerouslySetInnerHTML={{ __html: item.program_title }}
                      />
                      {item.program_description && (
                        <div
                          className="text-gray-700 prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: item.program_description,
                          }}
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Aucun programme renseigné.</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 space-y-8">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-dashed border-purple-200 text-center shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Documentation
              </h2>
              <DownloadProgramButton moduleId={idModule} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Organisme de formation
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {cfp.logo ? (
                    <img
                      className="h-28 w-28 rounded-full object-contain border-2 border-gray-200 shadow-sm bg-white"
                      src={cfp.logo}
                      alt={`Logo ${cfp.customerName}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/80x80/E2E8F0/718096?text=Logo";
                      }}
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500 border-2 border-gray-200">
                      Logo
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">
                    {cfp.customerName || "Nom du centre inconnu"}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {cfp.customer_slogan || "Slogan non disponible"}
                  </p>
                  {cfp.siteWeb && (
                    <a
                      href={
                        cfp.siteWeb.startsWith("http")
                          ? cfp.siteWeb
                          : `https://${cfp.siteWeb}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-purple-600 hover:text-purple-800 text-sm underline-offset-2 hover:underline transition-colors duration-200"
                    >
                      {cfp.siteWeb.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {suggestedModules && suggestedModules.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 relative">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Autres formations de ce centre
                </h2>

                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100"
                  style={{ scrollBehavior: "smooth" }}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  {suggestedModules.map((mod) => (
                    <SuggestedFormationCard
                      key={mod.idModule}
                      formation={mod}
                    />
                  ))}
                </div>

                {showLeftArrow && (
                  <button
                    onClick={() => scroll("left")}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-purple-50 transition-colors z-10"
                  >
                    <FontAwesomeIcon
                      icon={faChevronLeft}
                      className="text-purple-600"
                    />
                  </button>
                )}

                {showRightArrow && (
                  <button
                    onClick={() => scroll("right")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-purple-50 transition-colors z-10"
                  >
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-purple-600"
                    />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationDetail;
