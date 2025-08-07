import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { FaTh } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiMenu } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { UserContext } from "../context/UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom"; // <-- Ajout de useNavigate
import LogoutConfirmationModal from "./LogoutConfirmationModal";
import { getPhotoUrl, preloadImage } from "../utils/imageUtils";
import api from "../utils/api";
import HeaderWithBeta from "./HeaderWithBeta";
import AppLauncherGrid from './AppLauncherGrid';
import UserFlag from "./UserFlag";

const PROFILE_BASE_PATH =
  "https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/referents/";
const DEFAULT_PROFILE_IMAGE = "placeholder.webp";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate(); // <-- Initialisation de useNavigate

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChiffreDAffaireOpen, setIsChiffreDAffaireOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAppsDropdownOpen, setIsAppsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const [appLaunchers, setAppLaunchers] = useState([]);
  const [loadingAppLaunchers, setLoadingAppLaunchers] = useState(true);
  const [appLaunchersError, setAppLaunchersError] = useState(null);

  const mobileMenuRef = useRef(null);
  const chiffreDAffaireRef = useRef(null);
  const notificationsRef = useRef(null);
  const appsDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const dropdownStates = useMemo(
    () => [
      {
        ref: mobileMenuRef,
        setter: setIsMobileMenuOpen,
        name: "mobile",
        toggleButtonSelector: 'button[aria-label="Toggle mobile menu"]',
      },
      {
        ref: chiffreDAffaireRef,
        setter: setIsChiffreDAffaireOpen,
        name: "chiffreAffaire",
        toggleButtonSelector: 'button[aria-label="Menu Chiffre d\'affaire"]',
      },
      {
        ref: notificationsRef,
        setter: setIsNotificationsOpen,
        name: "notifications",
        toggleButtonSelector: 'button[title="Notifications"]',
      },
      {
        ref: appsDropdownRef,
        setter: setIsAppsDropdownOpen,
        name: "apps",
        toggleButtonSelector: 'button[aria-label="Applications"]',
      },
      {
        ref: profileDropdownRef,
        setter: setIsProfileDropdownOpen,
        name: "profile",
        toggleButtonSelector: 'button[aria-label="Menu de profil"]',
      },
    ],
    []
  );

  const closeAllDropdownsExcept = useCallback(
    (dropdownToKeepOpen = null) => {
      dropdownStates.forEach(({ name, setter }) => {
        if (name !== dropdownToKeepOpen) {
          setter(false);
        }
      });
    },
    [dropdownStates]
  );

  const toggleMobileMenu = useCallback(() => {
    closeAllDropdownsExcept("mobile");
    setIsMobileMenuOpen((prev) => !prev);
  }, [closeAllDropdownsExcept]);

  const toggleChiffreDAffaire = useCallback(() => {
    closeAllDropdownsExcept("chiffreAffaire");
    setIsChiffreDAffaireOpen((prev) => !prev);
  }, [closeAllDropdownsExcept]);

  const toggleNotifications = useCallback(() => {
    closeAllDropdownsExcept("notifications");
    setIsNotificationsOpen((prev) => !prev);
  }, [closeAllDropdownsExcept]);

  const toggleAppsDropdown = useCallback(() => {
    closeAllDropdownsExcept("apps");
    setIsAppsDropdownOpen((prev) => !prev);
  }, [closeAllDropdownsExcept]);

  const toggleProfileDropdown = useCallback(() => {
    closeAllDropdownsExcept("profile");
    setIsProfileDropdownOpen((prev) => !prev);
  }, [closeAllDropdownsExcept]);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutModal(true);
    closeAllDropdownsExcept();
  }, [closeAllDropdownsExcept]);

  const confirmLogout = useCallback(() => {
    logout();
    setShowLogoutModal(false);
    navigate("/login"); // <-- REMPLACÉ window.location.reload()
  }, [logout, navigate]); // <-- Ajout de navigate dans les dépendances

  const cancelLogout = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  const { userName } = useMemo(() => {
    const name = user
      ? `${user.name || ""} ${user.firstname || ""}`.trim()
      : "Utilisateur";
    return { userName: name };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      dropdownStates.forEach(({ ref, setter, toggleButtonSelector }) => {
        if (
          ref.current &&
          !ref.current.contains(event.target) &&
          !event.target.closest(toggleButtonSelector)
        ) {
          setter(false);
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownStates]);

  useEffect(() => {
    const fetchProfileImage = () => {
      const url = getPhotoUrl(user?.photo, {
        basePath: PROFILE_BASE_PATH,
        defaultImage: DEFAULT_PROFILE_IMAGE,
      });
      setProfileImageUrl(url);
      preloadImage(url).catch((e) =>
        console.error("Failed to preload image", e)
      );
    };

    if (isAuthenticated && user) {
      fetchProfileImage();
    } else {
      setProfileImageUrl(
        getPhotoUrl(null, {
          basePath: PROFILE_BASE_PATH,
          defaultImage: DEFAULT_PROFILE_IMAGE,
        })
      );
    }
  }, [isAuthenticated, user]);
{/* <AppLinksData/> */}
  // useEffect(() => {
  //   const fetchAppLaunchers = async () => {
  //     setLoadingAppLaunchers(true);
  //     try {
  //       const response = await api.get("/app_launcher");
  //       if (
  //         response.data.status === "success" &&
  //         Array.isArray(response.data.data)
  //       ) {
  //         const formattedData = response.data.data.map((item) => ({
  //           name: item.label,
  //           href: item.link,
  //           icon: `https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/${item.icone}`,
  //         }));
  //         setAppLaunchers(formattedData);
  //       } else {
  //         setAppLaunchersError(
  //           "Invalid API response format for app launchers."
  //         );
  //         setAppLaunchers([]);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching app launchers:", err);
  //       setAppLaunchersError("Failed to load application links.");
  //       setAppLaunchers([]);
  //     } finally {
  //       setLoadingAppLaunchers(false);
  //     }
  //   };

  //   fetchAppLaunchers();
  // }, []);

  const isNavLinkActive = useCallback(
    (path) => {
      const currentPath = location.pathname;
      return path === "/"
        ? currentPath === path
        : currentPath.startsWith(path) &&
          (currentPath.length === path.length ||
            currentPath[path.length] === "/");
    },
    [location.pathname]
  );

  console.log("👉 Navbar context user:", user);
  const mainNavigation = useMemo(() => {
    if (!user) {
      console.log("⏳ User not loaded yet");
      return [];
    }

    const role = user?.role_id;
    console.log("🔍 ID Role utilisateur:", role);

    if (role === 3 || role === 8) {
      console.log("✅ Navigation CFP");
      return [
        { name: "Formation", to: "home-cfp" },
        { name: "Apprenants", to: "/reporting/apprenant" },
        { name: "Clients", to: "/reporting/client" },
        { name: "Cours", to: "/reporting/cours" },
      ];
    } else if (role === 6) {
      console.log("✅ Navigation ETP");
      return [
        { name: "Formation", to: "/home-etp" },
        { name: "Employé", to: "/reporting/employe" },
        { name: "Centre de formation", to: "/reporting/cfpetp" },
        { name: "Cours", to: "/reporting/coursEtp" },
        { name: "Coûts de formation", to: "/reporting/revenue" },
      ];
    } else {
      console.log("⛔️ Aucune navigation affichée pour ce rôle");
      return [];
    }
  }, [user]);

  const chiffreDAffaireLinks = useMemo(() => {
    if (!user || (user.role_id !== 3 && user.role_id !== 8)) {
      console.log("🚫 Chiffre d'affaire masqué pour role:", user?.role_id);
      return [];
    }

    console.log(
      "💰 Affichage chiffre d'affaire pour CFP (role_id:",
      user.role_id,
      ")"
    );
    return [
      { name: "Projet", to: "/reporting/revenuebyproject" },
      { name: "Cours", to: "/reporting/revenuebycours" },
      { name: "Clients", to: "/reporting/revenuebyclients" },
      { name: "Mois", to: "/reporting/revenuebymonth" },
      { name: "Dossier", to: "/reporting/revenuebyfolder" },
      { name: "Référence", to: "/reporting/revenuebyreference" },
      { name: "Ville", to: "/reporting/revenuebycity" },
    ];
  }, [user]);

  const notifications = useMemo(
    () => [
      {
        id: 1,
        message: "Votre abonnement expire dans 4 jours.",
        time: "il y a 1 jour",
        href: "https://reporting.mg.formafusion.io/markAsRead/cacffc7d-456d-48aa-94ca-62b4bf99184b",
      },
      {
        id: 2,
        message: "Votre abonnement expire dans 5 jours.",
        time: "il y a 2 jours",
        href: "https://reporting.mg.formafusion.io/markAsRead/5ff34874-48de-44a8-a0be-ddabdee12cc4",
      },
    ],
    []
  );

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-white/90 text-slate-600 backdrop-blur-lg backdrop-saturate-150 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="lg:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-slate-600 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 rounded-md"
                  aria-label="Toggle mobile menu"
                >
                  <FiMenu className="h-6 w-6" />
                </button>
              </div>
              <Link
                to="#"
                className="flex items-center gap-2"
                onClick={() => closeAllDropdownsExcept()}
              >
                <img
                  src="https://reporting.forma-fusion.com/img/icones/Reporting.png"
                  alt="Reporting Icon"
                  className="w-9 mb-1"
                />
                <HeaderWithBeta />
              </Link>
            </div>

            {isMobileMenuOpen && (
              <div
                ref={mobileMenuRef}
                className="lg:hidden absolute left-0 top-16 w-full bg-white shadow-lg z-50"
              >
                <div className="container mx-auto px-4 py-2">
                  {isAuthenticated ? (
                    <>
                      {mainNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.to}
                          className={`block px-4 py-3 text-sm ${
                            isNavLinkActive(item.to)
                              ? "bg-[#87388C] text-white"
                              : "text-slate-700 hover:bg-gray-100"
                          }`}
                          onClick={toggleMobileMenu}
                        >
                          {item.name}
                        </Link>
                      ))}
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        {(user?.role_id === 3 || user?.role_id === 8) && (
                          <button
                            onClick={toggleChiffreDAffaire}
                            className={`flex items-center justify-between w-full px-4 py-3 text-sm ${
                              isChiffreDAffaireOpen
                                ? "bg-gray-100"
                                : "text-slate-700 hover:bg-gray-100"
                            }`}
                            aria-label="Menu Chiffre d'affaire"
                          >
                            Chiffre d'affaire
                            <svg
                              className={`w-4 h-4 ml-2 transition-transform ${
                                isChiffreDAffaireOpen ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              ></path>
                            </svg>
                          </button>
                        )}

                        {isChiffreDAffaireOpen && (
                          <div className="pl-6 py-1">
                            {chiffreDAffaireLinks.map((item) => (
                              <Link
                                key={item.name}
                                to={item.to}
                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 rounded-md"
                                onClick={toggleMobileMenu}
                              >
                                <div className="w-[16px]">
                                  <i
                                    className="fa-solid fa-tarp"
                                    aria-hidden="true"
                                  ></i>
                                </div>
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        )}

                        {(user?.role_id === 3 ||
                          user?.role_id === 8 ||
                          user?.role_id === 6) && (
                          <Link
                            to="/reporting/feedback"
                            className={`block px-4 py-3 text-sm ${
                              isNavLinkActive("/reporting/feedback")
                                ? "bg-[#87388C] text-white"
                                : "text-slate-700 hover:bg-gray-100"
                            }`}
                            onClick={toggleMobileMenu}
                          >
                            Vos retours
                          </Link>
                        )}
                      </div>
                    </>
                  ) : (
                    <Link
                      to="/reporting/formation"
                      className={`block px-4 py-3 text-sm ${
                        isNavLinkActive("/reporting/formation")
                          ? "bg-[#87388C] text-white"
                          : "text-slate-700 hover:bg-gray-100"
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      Reporting
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div className="hidden lg:flex flex-grow justify-center">
              {isAuthenticated ? (
                <ul className="flex items-center space-x-2">
                  {mainNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.to}
                        className={`capitalize px-3 py-2 rounded-t-md text-slate-600 hover:text-slate-500 ${
                          isNavLinkActive(item.to)
                            ? "bg-[#87388C]/5 border-b-2 border-[#87388C]"
                            : ""
                        }`}
                        onClick={() => closeAllDropdownsExcept()}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  <li className="relative" ref={chiffreDAffaireRef}>
                    {(user?.role_id === 3 || user?.role_id === 8) && (
                      <button
                        onClick={toggleChiffreDAffaire}
                        className={`flex items-center justify-between w-full px-4 py-3 text-sm ${
                          isChiffreDAffaireOpen
                            ? "bg-gray-100"
                            : "text-slate-700 hover:bg-gray-100"
                        }`}
                        aria-label="Menu Chiffre d'affaire"
                      >
                        Chiffre d'affaire
                        <svg
                          className={`w-4 h-4 ml-2 transition-transform ${
                            isChiffreDAffaireOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </button>
                    )}

                    {isChiffreDAffaireOpen && (
                      <ul className="absolute right-0 mt-3 w-max rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[1] p-2">
                        {chiffreDAffaireLinks.map((item) => (
                          <li key={item.name}>
                            <Link
                              to={item.to}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 rounded-md"
                              onClick={() => closeAllDropdownsExcept()}
                            >
                              <div className="w-[16px]">
                                <i
                                  className="fa-solid fa-tarp"
                                  aria-hidden="true"
                                ></i>
                              </div>
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                </ul>
              ) : (
                <div className="flex-grow"></div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              
              {isAuthenticated && (
                <div className="relative" ref={notificationsRef}>
                  <UserFlag/>
                  <button
                    onClick={toggleNotifications}
                    title="Notifications"
                    className="cursor-pointer relative inline-flex items-center px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <IoMdNotificationsOutline className="text-lg" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <ul className="absolute right-0 mt-3 w-max max-w-sm rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[1] p-2">
                      {notifications.map((notification) => (
                        <li key={notification.id}>
                          <a
                            href={notification.href}
                            className="flex items-start gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"
                            onClick={() => closeAllDropdownsExcept()}
                          >
                            <i
                              className="fa-solid fa-gem text-[#864DFF] text-2xl"
                              aria-hidden="true"
                            ></i>
                            <div className="flex flex-col">
                              <p className="font-semibold text-slate-600 hover:text-slate-500">
                                {notification.message}
                              </p>
                              <small className="text-gray-500">
                                {notification.time}
                              </small>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              
              <div className="relative" ref={appsDropdownRef}>
                <button
                  onClick={toggleAppsDropdown}
                  className="cursor-pointer p-2 rounded-full text-slate-800 bg-slate-300 hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  aria-label="Applications"
                >
                  <FaTh className="w-5 h-5" />
                </button>
                {isAppsDropdownOpen && (
                <div className="origin-top-right absolute -right-15 mt-3 w-72 sm:w-110 rounded-2xl shadow-xl bg-white  ring-1 ring-black ring-opacity-5 focus:outline-none z-30 p-5 border border-gray-100 dark:border-gray-700">
                  <AppLauncherGrid />
                </div>

                )}
              </div>

              {isAuthenticated ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    aria-label="Menu de profil"
                  >
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden cursor-pointer">
                        <img
                          alt="Profile"
                          src={profileImageUrl}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <span className="font-medium text-gray-700 hidden md:block">
                      <h1 className="text-lg font-medium text-gray-700 capitalize">
                        {userName}
                      </h1>
                    </span>
                  </button>
                  {isProfileDropdownOpen && (
                    <ul className="absolute right-0 mt-3 w-[320px] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[1] p-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex justify-center items-center text-[#a462a4] text-xl font-medium bg-[#e1c4e3] shadow-md uppercase">
                            <img
                              src={profileImageUrl}
                              className="w-full h-full object-cover"
                              alt="Profile"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <h1 className="text-lg font-medium text-gray-900 capitalize">
                              {userName}
                            </h1>
                            <div className="text-gray-500 dark:text-gray-800">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center w-full gap-3 mb-4">
                          <div className="w-10"></div>
                          <div className="flex flex-col w-full gap-1">
                            <Link
                              to="http://compte.mg.formafusion.io/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-2 py-1 text-base text-gray-800 transition duration-100 rounded-md hover:bg-gray-100 hover:text-gray-700"
                              onClick={() => closeAllDropdownsExcept()}
                            >
                              <i className="fa-solid fa-user-gear text-purple-700"></i>{" "}
                              Gérer mon profil
                            </Link>

                            <button
                              onClick={handleLogoutClick}
                              className="flex items-center gap-2 w-full text-left px-2 py-1 text-base text-gray-800 transition duration-100 rounded-md hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                              aria-label="Déconnexion"
                            >
                              <i className="fa-solid fa-right-from-bracket text-red-500"></i>{" "}
                              Se déconnecter
                            </button>
                          </div>
                        </div>
                      </div>
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-[#A462A4] transition-colors duration-200"
                  onClick={() => closeAllDropdownsExcept()}
                >
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LogoutConfirmationModal
        show={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
};

export default Navbar;