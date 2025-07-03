import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import ExportButtons from '../../boutons/ExportButtons ';

const CentreFormationReport = () => {
    // --- États du composant ---
    const [allFormationsData, setAllFormationsData] = useState([]);
    const [filteredFormations, setFilteredFormations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCfp, setSelectedCfp] = useState('all');
    const [cfps, setCfps] = useState(['all']);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [exportError, setExportError] = useState(null);

    // --- Références ---
    const searchRef = useRef(null);

    // --- États de pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const tableBodyRef = useRef(null);

    // --- Effets ---

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const calculateItemsPerPage = useCallback(() => {
        if (!tableBodyRef.current) return;

        const headerAndFormHeight = 250;
        const footerHeight = 70;
        const rowHeight = 48;

        const availableHeight = window.innerHeight - headerAndFormHeight - footerHeight;
        const calculatedItems = Math.max(5, Math.floor(availableHeight / rowHeight));

        setItemsPerPage(prevItemsPerPage => {
            if (prevItemsPerPage !== calculatedItems) {
                setCurrentPage(1);
            }
            return calculatedItems;
        });
    }, []);

    useEffect(() => {
        calculateItemsPerPage();
        window.addEventListener('resize', calculateItemsPerPage);
        return () => window.removeEventListener('resize', calculateItemsPerPage);
    }, [calculateItemsPerPage]);

    const fetchAllFormations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/etp/reporting/client`);
            const data = response.data && response.data.all_learner ? response.data.all_learner : response.data;

            if (data && Array.isArray(data)) {
                // Ajouter un ID unique à chaque formation si elles n'en ont pas déjà un
                const dataWithIds = data.map((item, index) => ({
                    ...item,
                    uniqueId: item.id || `${item.emp_matricule}-${index}-${Date.now()}`
                }));
                
                setAllFormationsData(dataWithIds);
                setFilteredFormations(dataWithIds);

                const uniqueCfps = [...new Set(data.map(f => f.cfp_name))].sort();
                setCfps(['all', ...uniqueCfps]);
            } else {
                setAllFormationsData([]);
                setFilteredFormations([]);
                setCfps(['all']);
                console.warn("La réponse de l'API ne contenait pas un tableau pour 'all_learner'. Reçu:", response);
            }
        } catch (err) {
            console.error("Erreur lors de la récupération des formations:", err);
            setError("Échec du chargement des données. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllFormations();
    }, [fetchAllFormations]);

    useEffect(() => {
        if (!allFormationsData.length && !loading) {
            setFilteredFormations([]);
            return;
        }

        const applyFilters = () => {
            let currentFiltered = allFormationsData;

            if (searchTerm) {
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                currentFiltered = currentFiltered.filter(formation =>
                    (formation.emp_name && formation.emp_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                    (formation.emp_firstname && formation.emp_firstname.toLowerCase().includes(lowerCaseSearchTerm)) ||
                    (formation.emp_matricule && formation.emp_matricule.toLowerCase().includes(lowerCaseSearchTerm)) ||
                    (formation.module_name && formation.module_name.toLowerCase().includes(lowerCaseSearchTerm))
                );
            }

            if (selectedCfp !== 'all') {
                currentFiltered = currentFiltered.filter(formation =>
                    formation.cfp_name === selectedCfp
                );
            }
            setFilteredFormations(currentFiltered);
            setCurrentPage(1);
        };

        const handler = setTimeout(() => {
            applyFilters();
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, selectedCfp, allFormationsData, loading]);

    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const results = allFormationsData.filter(f =>
            `${f.emp_name || ''} ${f.emp_firstname || ''}`.toLowerCase().includes(lowerTerm) ||
            (f.emp_matricule && f.emp_matricule.toLowerCase().includes(lowerTerm))
        ).slice(0, 5);

        setSearchResults(results);
        setShowResults(results.length > 0);
    }, [searchTerm, allFormationsData]);

    // --- Gestionnaires d'événements ---
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setShowResults(e.target.value.length > 1 && searchResults.length > 0);
    };

    const handleApprenantSelect = (apprenant) => {
        setSearchTerm(`${apprenant.emp_name} ${apprenant.emp_firstname}`);
        setShowResults(false);
        setCurrentPage(1);
    };

    const handleCfpChange = (e) => {
        setSelectedCfp(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    // --- Logique de pagination ---
    const totalPages = Math.ceil(filteredFormations.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredFormations.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        const tableElement = document.getElementById('formations-table');
        if (tableElement) {
            tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // --- Variants Framer Motion ---
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex flex-col w-full p-4 mx-auto xl:p-0 gap-y-4 xl:container">
            {/* Section du formulaire de filtre */}
            <motion.form
                onSubmit={handleSubmit}
                className="p-6 bg-white rounded-lg shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="bg-white p-20 rounded-xl">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Champ de recherche pour l'apprenant */}
                        <motion.div
                            variants={itemVariants}
                            className="md:col-span-5 relative"
                            ref={searchRef}
                        >
                            <label htmlFor="name_appr" className="sr-only">Rechercher un apprenant</label>
                            <div className="relative">
                                <input
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    type="text"
                                    id="name_appr"
                                    placeholder="Rechercher un apprenant (Nom, Prénom, Matricule...)"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onFocus={() => searchTerm.length > 1 && setSearchResults(allFormationsData.filter(f =>
                                        `${f.emp_name || ''} ${f.emp_firstname || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (f.emp_matricule && f.emp_matricule.toLowerCase().includes(searchTerm.toLowerCase()))
                                    ).slice(0, 5)).length > 0 && setShowResults(true)}
                                    aria-label="Rechercher un apprenant par nom, prénom ou matricule"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <AnimatePresence>
                                    {showResults && searchResults.length > 0 && (
                                        <motion.div
                                            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {searchResults.map((apprenant) => (
                                                <div
                                                    key={`${apprenant.emp_matricule}-${apprenant.uniqueId}`}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                    onClick={() => handleApprenantSelect(apprenant)}
                                                >
                                                    <div className="font-medium">{apprenant.emp_name} {apprenant.emp_firstname}</div>
                                                    <div className="text-gray-500 text-xs">{apprenant.emp_matricule}</div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Sélecteur pour CFP */}
                        <motion.div variants={itemVariants} className="md:col-span-3">
                            <label htmlFor="select_cfp" className="sr-only">Filtrer par Centre de Formation</label>
                            <select
                                id="select_cfp"
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                value={selectedCfp}
                                onChange={handleCfpChange}
                                aria-label="Sélectionner un centre de formation"
                            >
                                {cfps.map(cfp => (
                                    <option key={cfp} value={cfp}>
                                        {cfp === 'all' ? 'Tous les centres' : cfp}
                                    </option>
                                ))}
                            </select>
                        </motion.div>

                        {/* Bouton de filtre */}
                        <motion.div
                            variants={itemVariants}
                            className="md:col-span-2 flex justify-end"
                        >
                            <motion.button
                                type="submit"
                                className="w-full md:w-auto flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-[#7D3C7D] hover:bg-[#6B2D6B] rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filtrer
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.form>

            {/* Section du tableau de rapport des formations */}
            <motion.div
                className="w-full bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden -mt-25"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {/* En-tête du tableau et boutons d'exportation */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Rapport des Formations</h2>
                    <div className="flex gap-2">
                    <ExportButtons
                        xlEndpoint="/etp/reporting/exportXl/cl"
                        pdfEndpoint="/etp/reporting/exportPdf/cl"
                        xlFileName="FormationETP.xlsx"
                        pdfFileName="reportingformationETP.pdf"
                        data={filteredFormations} // Utiliser les données filtrées pour l'export
                        onError={setExportError}
                    />
                    </div>
                </div>

                {/* Contenu principal du tableau */}
                <div id="formations-table" className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centre</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonction</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lieu</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200" aria-live="polite" ref={tableBodyRef}>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.tr
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <td colSpan="11" className="px-6 py-4 text-center text-sm text-gray-500">
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center justify-center space-x-2"
                                            >
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                    className="w-5 h-5 border-2 border-[#7D3C7D] border-t-transparent rounded-full"
                                                />
                                                <span>Chargement en cours...</span>
                                            </motion.div>
                                        </td>
                                    </motion.tr>
                                ) : error ? (
                                    <motion.tr
                                        key="error"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <td colSpan="11" className="px-6 py-4 text-center text-sm font-medium text-red-500">
                                            {error}
                                        </td>
                                    </motion.tr>
                                ) : currentItems.length > 0 ? (
                                    <>
                                        {currentItems.map((formation) => (
                                            <motion.tr
                                                key={formation.uniqueId}
                                                className="hover:bg-gray-50"
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                                transition={{ duration: 0.2 }}
                                            >
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formation.cfp_name}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formation.emp_fonction}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formation.emp_matricule}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{`${formation.emp_name} ${formation.emp_firstname}`}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formation.module_name}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formation.project_type}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        formation.project_status === 'Terminé'
                                                            ? 'bg-green-100 text-green-800'
                                                            : formation.project_status === 'En cours'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {formation.project_status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{`${formation.salle_name}, ${formation.salle_quartier}`}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formation.dateDebut}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formation.dateFin}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 text-center">{formation.dureeH} h</td>
                                            </motion.tr>
                                        ))}
                                        {/* Remplir les lignes vides pour maintenir la hauteur du tableau */}
                                        {Array.from({ length: itemsPerPage - currentItems.length }).map((_, i) => (
                                            <tr key={`empty-row-${i}`} className="h-12">
                                                <td colSpan="11" className="px-3 py-3 text-transparent">.</td>
                                            </tr>
                                        ))}
                                    </>
                                ) : (
                                    <motion.tr
                                        key="no-data"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <td colSpan="11" className="px-6 py-4 text-center text-sm text-gray-500">
                                            Aucune donnée disponible
                                        </td>
                                    </motion.tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Contrôles de pagination */}
                {filteredFormations.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 gap-2">
                        <div className="text-sm text-gray-600">
                            {filteredFormations.length} résultat{filteredFormations.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Précédent
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                                    const isVisible =
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        (pageNum >= currentPage - 2 && pageNum <= currentPage + 2);

                                    const isEllipsis =
                                        (pageNum === 2 && currentPage > 3) ||
                                        (pageNum === totalPages - 1 && currentPage < totalPages - 2);

                                    if (isVisible) {
                                        return (
                                            <button
                                                key={`page-${pageNum}`}
                                                onClick={() => paginate(pageNum)}
                                                className={`w-8 h-8 flex items-center justify-center text-sm rounded-md ${currentPage === pageNum ? 'bg-[#7D3C7D] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (isEllipsis) {
                                        return <span key={`ellipsis-${pageNum}`} className="px-2">...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CentreFormationReport;