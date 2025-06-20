import React, { useState, useEffect, useRef } from 'react';
import { FaTh } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiMenu } from "react-icons/fi";
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom'; // Importez useLocation

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation(); // Obtient l'objet de localisation actuel

    // États pour gérer l'ouverture/fermeture de chaque menu déroulant
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isChiffreDAffaireOpen, setIsChiffreDAffaireOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isAppsDropdownOpen, setIsAppsDropdownOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    // Refs pour détecter les clics en dehors des dropdowns
    const mobileMenuRef = useRef(null);
    const chiffreDAffaireRef = useRef(null);
    const notificationsRef = useRef(null);
    const appsDropdownRef = useRef(null);
    const profileDropdownRef = useRef(null);

    // Fonction générique pour fermer tous les dropdowns sauf celui spécifié
    const closeAllDropdownsExcept = (dropdownToKeepOpen = null) => {
        if (dropdownToKeepOpen !== 'mobile') setIsMobileMenuOpen(false);
        if (dropdownToKeepOpen !== 'chiffreAffaire') setIsChiffreDAffaireOpen(false);
        if (dropdownToKeepOpen !== 'notifications') setIsNotificationsOpen(false);
        if (dropdownToKeepOpen !== 'apps') setIsAppsDropdownOpen(false);
        if (dropdownToKeepOpen !== 'profile') setIsProfileDropdownOpen(false);
    };

    // Fonctions de bascule modifiées pour fermer les autres dropdowns
    const toggleMobileMenu = () => {
        closeAllDropdownsExcept('mobile');
        setIsMobileMenuOpen(prev => !prev);
    };

    const toggleChiffreDAffaire = () => {
        closeAllDropdownsExcept('chiffreAffaire');
        setIsChiffreDAffaireOpen(prev => !prev);
    };

    const toggleNotifications = () => {
        closeAllDropdownsExcept('notifications');
        setIsNotificationsOpen(prev => !prev);
    };

    const toggleAppsDropdown = () => {
        closeAllDropdownsExcept('apps');
        setIsAppsDropdownOpen(prev => !prev);
    };

    const toggleProfileDropdown = () => {
        closeAllDropdownsExcept('profile');
        setIsProfileDropdownOpen(prev => !prev);
    };

    const handleLogout = () => {
        console.log('Déconnexion...');
        logout();
        closeAllDropdownsExcept(); // Ferme tous les dropdowns après la déconnexion
    };

    // Effet pour gérer les clics en dehors des dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Vérifie si le clic est en dehors de chaque ref ET pas sur son bouton de bascule
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('button[aria-label="Toggle mobile menu"]')) {
                setIsMobileMenuOpen(false);
            }
            if (chiffreDAffaireRef.current && !chiffreDAffaireRef.current.contains(event.target) && !event.target.closest('button[aria-label="Menu Chiffre d\'affaire"]')) {
                setIsChiffreDAffaireOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target) && !event.target.closest('button[title="Notifications"]')) {
                setIsNotificationsOpen(false);
            }
            if (appsDropdownRef.current && !appsDropdownRef.current.contains(event.target) && !event.target.closest('button[aria-label="Applications"]')) {
                setIsAppsDropdownOpen(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target) && !event.target.closest('button[aria-label="Menu de profil"]')) {
                setIsProfileDropdownOpen(false);
            }
        };

        // Ajoute l'écouteur d'événements lors du montage du composant
        document.addEventListener("mousedown", handleClickOutside);

        // Nettoie l'écouteur d'événements lors du démontage du composant
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une fois au montage et au démontage.

    // Fonction d'aide pour déterminer si un lien de navigation principal est actif
    // Gère les correspondances partielles pour les routes imbriquées (ex: /reporting/formation active aussi /reporting/formation/detail/123)
    const isNavLinkActive = (path) => {
        const currentPath = location.pathname;
        if (path === '/') { // Cas spécifique pour la page d'accueil ou la racine
            return currentPath === path;
        }
        // Vérifie si le chemin actuel commence par le chemin du lien, et s'assure qu'il s'agit soit d'une correspondance exacte,
        // soit qu'il est suivi d'une barre oblique pour éviter les correspondances partielles incorrectes
        return currentPath.startsWith(path) &&
               (currentPath.length === path.length || currentPath[path.length] === '/');
    };

    // Vos données de navigation (inchangées)
    const mainNavigation = [
        { name: 'Formation', to: '/reporting/formation' },
        { name: 'Apprenants', to: '/reporting/apprenant' },
        { name: 'Clients', to: '/reporting/client' },
        { name: 'Cours', to: '/reporting/cours' },
    ];

    // --- CORRECTION ICI ---
    const chiffreDAffaireLinks = [
        { name: 'Projet', to: '/reporting/revenuebyproject' }, // Utilisez 'to' pour le lien interne
        { name: 'Cours', to: '/reporting/revenuebycours' },
        { name: 'Clients', to: '/reporting/revenuebyclients' },
        { name: 'Mois', to: 'reporting/revenuebymonth' },
        { name: 'Dossier', to: 'reporting/revenuebyfolder' },
        { name: 'Référence', to: 'reporting/revenuebyreference' },
        { name: 'Ville', to: 'reporting/revenuebycity' },
    ];

    const appLinks = [
        { name: 'Apprenants', href: 'https://apprenants.forma-fusion.com/cfp/apprenants', icon: 'https://reporting.forma-fusion.com/img/icones/Apprenants.png' },
        { name: 'Formateurs', href: 'https://formateurs.forma-fusion.com/cfp/forms', icon: 'https://reporting.forma-fusion.com/img/icones/Formateurs.png' },
        { name: 'Administrateurs', href: 'https://referents.forma-fusion.com/cfp/referents', icon: 'https://reporting.forma-fusion.com/img/icones/Administrateurs.png' },
        { name: 'Projets', href: 'https://projets.forma-fusion.com/cfp/projets', icon: 'https://reporting.forma-fusion.com/img/icones/Projets.png' },
        { name: 'Agenda', href: 'https://agenda.forma-fusion.com/agendaCfps', icon: 'https://reporting.forma-fusion.com/img/icones/Agenda.png' },
        { name: 'Réservation', href: 'https://reservation.forma-fusion.com/cfp/rsv/5', icon: 'https://reporting.forma-fusion.com/img/icones/Réservation.png' },
        { name: 'Suivi pédagogique', href: 'https://suivipeda.forma-fusion.com/cfp/peda', icon: 'https://reporting.forma-fusion.com/img/icones/Suivi%20p%C3%A9dagogique.png' },
        { name: 'Evaluation', href: 'https://evaluations.forma-fusion.com/cfp/projets', icon: 'https://reporting.forma-fusion.com/img/icones/Evaluation.png' },
        { name: 'Tests', href: 'https://tests.forma-fusion.com/qcm/index', icon: 'https://reporting.forma-fusion.com/img/icones/Tests.png' },
        { name: 'Factures', href: 'https://factures.forma-fusion.com/cfp/factures/id/1', icon: 'https://reporting.forma-fusion.com/img/icones/Factures.png' },
        { name: 'Clients', href: 'https://clients.forma-fusion.com/cfp/invites/etp/list/1', icon: 'https://reporting.forma-fusion.com/img/icones/Clients.png' },
        { name: 'Licence', href: 'https://licence.forma-fusion.com/cfp/abonnement', icon: 'https://reporting.forma-fusion.com/img/icones/Licence.png' },
        { name: 'Marketplace', href: 'https://marketplace.forma-fusion.com/', icon: 'https://reporting.forma-fusion.com/img/icones/Marketplace.png' },
        { name: 'Photos', href: 'https://photo.forma-fusion.com/cfp/gallery', icon: 'https://reporting.forma-fusion.com/img/icones/Photos.png' },
        { name: 'Catalogue', href: 'https://catalogue.forma-fusion.com/cfp/modules', icon: 'https://reporting.forma-fusion.com/img/icones/Catalogue.png' },
        { name: 'Présence', href: 'https://presence.forma-fusion.com/cfp/projets', icon: 'https://reporting.forma-fusion.com/img/icones/Présence.png' },
        { name: 'Dossiers', href: 'https://dossiers.forma-fusion.com/cfp/dossier', icon: 'https://reporting.forma-fusion.com/img/icones/Dossiers.png' },
        { name: 'Badges', href: 'https://badge.forma-fusion.com/cfp/badge', icon: 'https://reporting.forma-fusion.com/img/icones/Badges.png' },
        { name: 'Lieu et Salle', href: 'https://lieu-salle.forma-fusion.com/cfp/lieux', icon: 'https://reporting.forma-fusion.com/img/icones/Lieu%20et%20Salle.png' },
        { name: 'Analytics', href: 'https://analytics.forma-fusion.com/home', icon: 'https://reporting.forma-fusion.com/img/icones/Analytics.png' },
        { name: 'Reporting', href: 'https://reporting.forma-fusion.com/reporting/formation', icon: 'https://reporting.forma-fusion.com/img/icones/Reporting.png' },
        { name: 'Support', href: 'https://support.forma-fusion.com', icon: 'https://reporting.forma-fusion.com/img/icones/inscription.png' },
    ];

    const notifications = [
        { id: 1, message: 'Votre abonnement expire dans 4 jours.', time: 'il y a 1 jour', href: 'https://reporting.forma-fusion.com/markAsRead/cacffc7d-456d-48aa-94ca-62b4bf99184b' },
        { id: 2, message: 'Votre abonnement expire dans 5 jours.', time: 'il y a 2 jours', href: 'https://reporting.forma-fusion.com/markAsRead/5ff34874-48de-44a8-a0be-ddabdee12cc4' },
    ];

    return (
        <nav className="fixed top-0 z-50 w-full bg-white/90 text-slate-600 backdrop-blur-lg backdrop-saturate-150 shadow-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Section gauche - Menu mobile et logo */}
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
                        {/* Utiliser le composant Link pour la navigation interne */}
                        <Link to="/reporting/formation" className="flex items-center gap-2" onClick={() => closeAllDropdownsExcept()}>
                            <img src="https://reporting.forma-fusion.com/img/icones/Reporting.png" alt="Reporting Icon" className="w-9 mb-1" />
                            <p className="text-2xl font-semibold text-gray-700">Reporting</p>
                        </Link>
                    </div>

                    {/* Menu mobile (affichage conditionnel et ref) */}
                    {isMobileMenuOpen && (
                        <div ref={mobileMenuRef} className="lg:hidden absolute left-0 top-16 w-full bg-white shadow-lg z-50">
                            <div className="container mx-auto px-4 py-2">
                                {isAuthenticated ? (
                                    <>
                                        {mainNavigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                to={item.to}
                                                className={`block px-4 py-3 text-sm ${isNavLinkActive(item.to) ? 'bg-[#87388C] text-white' : 'text-slate-700 hover:bg-gray-100'}`}
                                                onClick={toggleMobileMenu} // Ferme le menu mobile au clic
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                        <div className="border-t border-gray-200 mt-2 pt-2">
                                            <button
                                                onClick={toggleChiffreDAffaire}
                                                className={`flex items-center justify-between w-full px-4 py-3 text-sm ${isChiffreDAffaireOpen ? 'bg-gray-100' : 'text-slate-700 hover:bg-gray-100'}`} // Met en surbrillance si ouvert
                                                aria-label="Menu Chiffre d'affaire"
                                            >
                                                Chiffre d'affaire
                                                <svg className={`w-4 h-4 ml-2 transition-transform ${isChiffreDAffaireOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </button>
                                            {isChiffreDAffaireOpen && (
                                                <div className="pl-6 py-1">
                                                    {chiffreDAffaireLinks.map((item) => (
                                                        // --- DÉBUT DE LA CORRECTION DANS LE RENDU ---
                                                        item.to ? ( // Si l'objet a une propriété 'to', c'est un lien interne React Router
                                                            <Link
                                                                key={item.name}
                                                                to={item.to}
                                                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 rounded-md"
                                                                onClick={toggleMobileMenu} // Ferme le menu mobile au clic
                                                            >
                                                                <div className="w-[16px]">
                                                                    <i className="fa-solid fa-tarp" aria-hidden="true"></i>
                                                                </div>
                                                                {item.name}
                                                            </Link>
                                                        ) : ( // Sinon, c'est un lien externe HTML
                                                            <a
                                                                key={item.name}
                                                                href={item.href}
                                                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 rounded-md"
                                                                onClick={toggleMobileMenu} // Ferme le menu mobile au clic
                                                                target="_blank" // Pour les liens externes
                                                                rel="noopener noreferrer" // Pour les liens externes
                                                            >
                                                                <div className="w-[16px]">
                                                                    <i className="fa-solid fa-tarp" aria-hidden="true"></i>
                                                                </div>
                                                                {item.name}
                                                            </a>
                                                        )
                                                        // --- FIN DE LA CORRECTION DANS LE RENDU ---
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        to="/reporting/formation"
                                        className={`block px-4 py-3 text-sm ${isNavLinkActive('/reporting/formation') ? 'bg-[#87388C] text-white' : 'text-slate-700 hover:bg-gray-100'}`}
                                        onClick={toggleMobileMenu}
                                    >
                                        Reporting
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Desktop - Centre */}
                    <div className="hidden lg:flex flex-grow justify-center">
                        {isAuthenticated ? (
                            <ul className="flex items-center space-x-2">
                                {mainNavigation.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            to={item.to}
                                            className={`capitalize px-3 py-2 rounded-t-md text-slate-600 hover:text-slate-500 ${isNavLinkActive(item.to) ? 'bg-[#87388C]/5 border-b-2 border-[#87388C]' : ''}`}
                                            onClick={() => closeAllDropdownsExcept()} // Ferme tous les dropdowns au clic sur un lien principal
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                                <li className="relative" ref={chiffreDAffaireRef}>
                                    <button
                                        onClick={toggleChiffreDAffaire}
                                        className={`capitalize px-3 py-2 rounded-t-md text-slate-600 hover:text-slate-500 transition duration-150 outline-none flex items-center
                                        ${isChiffreDAffaireOpen ? 'bg-[#A462A4] text-white' : ''}`} // Met en surbrillance si ouvert
                                        aria-label="Menu Chiffre d'affaire"
                                    >
                                        Chiffre d'affaire
                                        <svg className={`w-4 h-4 ml-2 transition-transform ${isChiffreDAffaireOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    {isChiffreDAffaireOpen && (
                                        <ul className="absolute right-0 mt-3 w-max rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[1] p-2">
                                            {chiffreDAffaireLinks.map((item) => (
                                                <li key={item.name}>
                                                    {/* --- DÉBUT DE LA CORRECTION DANS LE RENDU --- */}
                                                    {item.to ? ( // Si l'objet a une propriété 'to', c'est un lien interne React Router
                                                        <Link
                                                            to={item.to}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 rounded-md"
                                                            onClick={() => closeAllDropdownsExcept()}
                                                        >
                                                            <div className="w-[16px]">
                                                                <i className="fa-solid fa-tarp" aria-hidden="true"></i>
                                                            </div>
                                                            {item.name}
                                                        </Link>
                                                    ) : ( // Sinon, c'est un lien externe HTML
                                                        <a
                                                            href={item.href}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 rounded-md"
                                                            onClick={() => closeAllDropdownsExcept()}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <div className="w-[16px]">
                                                                <i className="fa-solid fa-tarp" aria-hidden="true"></i>
                                                            </div>
                                                            {item.name}
                                                        </a>
                                                    )}
                                                    {/* --- FIN DE LA CORRECTION DANS LE RENDU --- */}
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

                    {/* Section droite - Icônes et profil */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications (uniquement si connecté) */}
                        {isAuthenticated && (
                            <div className="relative" ref={notificationsRef}>
                                <button
                                    onClick={toggleNotifications}
                                    title="Notifications"
                                    className="relative inline-flex items-center px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                                                <a href={notification.href} className="flex items-start gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"
                                                    onClick={() => closeAllDropdownsExcept()}
                                                >
                                                    <i className="fa-solid fa-gem text-[#864DFF] text-2xl" aria-hidden="true"></i>
                                                    <div className="flex flex-col">
                                                        <p className="font-semibold text-slate-600 hover:text-slate-500">
                                                            {notification.message}
                                                        </p>
                                                        <small className="text-gray-500">{notification.time}</small>
                                                    </div>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Dropdown Applications (toujours visible) */}
                        <div className="relative" ref={appsDropdownRef}>
                            <button
                                onClick={toggleAppsDropdown}
                                className="p-2 rounded-full text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                aria-label="Applications"
                            >
                                <FaTh className="w-5 h-5" />
                            </button>
                            {isAppsDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30 p-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        {appLinks.map((app) => (
                                            <a
                                                key={app.name}
                                                href={app.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center p-3 transition-colors rounded-lg hover:bg-gray-50"
                                                onClick={() => closeAllDropdownsExcept()}
                                            >
                                                <div className="w-9 h-9 rounded-full overflow-hidden flex justify-center items-center mb-1">
                                                    <img src={app.icon} alt={`${app.name} Icon`} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-sm text-center text-gray-600">{app.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bouton Profil ou Connexion */}
                        {isAuthenticated ? (
                            <div className="relative" ref={profileDropdownRef}>
                                <button
                                    onClick={toggleProfileDropdown}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    aria-label="Menu de profil"
                                >
                                    <div className="avatar">
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            {/* TODO: Charger dynamiquement l'image de profil de l'utilisateur connecté */}
                                            <img alt="Profile" src="https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/referents/6761ccda65d31.webp" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <span className="font-medium text-gray-700 hidden md:block">
                                        <h1 className="text-lg font-medium text-gray-700 capitalize">NUMERIKA CENTER</h1>
                                    </span>
                                </button>
                                {isProfileDropdownOpen && (
                                    <ul className="absolute right-0 mt-3 w-[320px] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[1] p-3">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-full overflow-hidden flex justify-center items-center text-[#a462a4] text-xl font-medium bg-[#e1c4e3] shadow-md uppercase">
                                                    {/* TODO: Charger dynamiquement l'image de profil de l'utilisateur connecté */}
                                                    <img src="https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/referents/6761ccda65d31.webp" className="w-full h-full object-cover" alt="Profile" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <h1 className="text-lg font-medium text-gray-700 capitalize">NUMERIKA CENTER</h1>
                                                </div>
                                            </div>
                                            <div className="flex items-center w-full gap-3 mb-4">
                                                <div className="w-14"></div>
                                                <div className="flex flex-col w-full gap-1">
                                                    {/* TODO: Utiliser Link si c'est une route interne, ou gérer l'externe correctement */}
                                                    <a href="https://profils.forma-fusion.com/cfp/profils" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 text-base text-gray-500 duration-100 rounded-md hover:bg-gray-100 hover:text-gray-700"
                                                        onClick={() => closeAllDropdownsExcept()}
                                                    >
                                                        Gérer le profil
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <hr className="border-gray-200 my-2" />
                                        <div className="flex flex-col gap-2 mt-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-full overflow-hidden flex justify-center items-center text-[#a462a4] text-xl font-medium bg-[#e1c4e3] shadow-md uppercase">
                                                    {/* TODO: Charger dynamiquement l'image de profil de l'utilisateur connecté */}
                                                    <img src="https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/referents/6761ccda65d31.webp" className="w-full h-full object-cover" alt="Profile" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <h1 className="text-lg font-medium text-gray-700">RAVELOSON Levy</h1>
                                                    <span className="text-base text-gray-700">responsable@numerika.center</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center w-full gap-3">
                                                <div className="w-14"></div>
                                                <div className="flex flex-col w-full gap-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-2 py-1 text-base text-gray-500 duration-100 rounded-md hover:bg-gray-100 hover:text-gray-700"
                                                    >
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
                                className="px-4 py-2 rounded-md bg-[#87388C] text-white hover:bg-[#A462A4] transition duration-150"
                                onClick={() => closeAllDropdownsExcept()}
                            >
                                {/* Ce bouton est incomplet dans le code fourni, je le laisse tel quel */}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;