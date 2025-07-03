import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Assuming this path is correct
import { motion, AnimatePresence } from 'framer-motion';
import ExportButtons from '../../boutons/ExportButtons '; // Assuming this path is correct

const ReportingEmploye = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // For data fetching errors
    const [exportError, setExportError] = useState(null); // For export errors
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // You can adjust this value

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get("etp/reporting/apprenant"); // Assuming this endpoint fetches the initial data

                if (response.data && Array.isArray(response.data.all_learner)) {
                    setData(response.data.all_learner);
                } else {
                    setData([]);
                }
                setError(null); // Clear any previous data fetching errors
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Erreur lors du chargement des données. Veuillez réessayer.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Reset current page to 1 whenever search term or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortColumn, sortDirection]);

    // Handle search input change
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Handle table column sorting
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Sort the data based on the selected column and direction
    const sortedData = [...data].sort((a, b) => {
        if (!sortColumn) return 0;

        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        // Handle number comparison
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Handle null/undefined values for sorting (push them to the end or beginning)
        if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
        if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

        return 0; // No specific sorting for other types
    });

    // Filter the sorted data based on the search term
    const filteredAndSortedData = sortedData.filter(item => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            (item.emp_name && item.emp_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (item.emp_firstname && item.emp_firstname.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (item.module_name && item.module_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (item.emp_matricule && item.emp_matricule.toString().includes(lowerCaseSearchTerm))
        );
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Get the sort indicator (arrow up/down) for table headers
    const getSortIndicator = (column) => {
        if (sortColumn === column) {
            return sortDirection === 'asc' ? (
                <i className="ml-1 fa-solid fa-arrow-up text-blue-500"></i>
            ) : (
                <i className="ml-1 fa-solid fa-arrow-down text-blue-500"></i>
            );
        }
        return null;
    };

    // CSS classes for table headers and cells
    const headerClass = "px-2 py-2 text-left text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap hover:bg-gray-100";
    const cellClass = "px-2 py-2 text-[12px] sm:text-sm text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis";

    // Display loading message
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
                Chargement des données...
            </div>
        );
    }

    // Display data fetching error message
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full px-4 mx-auto gap-y-4 max-w-full items-center">
            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 p-20">
                {/* Search Input Form */}
                <form className="w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
                    <label className="input input-bordered w-full md:w-[28rem] flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-200">
                        <input
                            className="grow px-2 py-1 outline-none"
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Rechercher par nom, module ou matricule..."
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
                            <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd"></path>
                        </svg>
                    </label>
                </form>

                {/* Export Buttons */}
                <div className="flex flex-wrap justify-center gap-2 my-5 w-fit">
                    <ExportButtons
                        xlEndpoint="/etp/reporting/exportXl/app"
                        pdfEndpoint="/etp/reporting/exportPdf/app"
                        xlFileName="FormationETP.xlsx"
                        pdfFileName="reportingformationETP.pdf"
                        data={filteredAndSortedData} // Pass the filtered and sorted data for export
                        onError={setExportError} // Pass the error setter to ExportButtons
                    />

                </div>
            </div>

            {/* Export Error Message Display */}
            {exportError && (
                <div className="text-red-600 text-center mb-4">
                    {exportError}
                </div>
            )}

            {/* Data Table */}
            <div className="w-full overflow-x-auto max-w-full bg-white rounded-md shadow-lg -mt-20">
                <table className="min-w-[1200px] w-full table-auto text-left border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className={headerClass} onClick={() => handleSort('emp_matricule')}>Matricule {getSortIndicator('emp_matricule')}</th>
                            <th className={headerClass} onClick={() => handleSort('emp_name')}>Nom Complet {getSortIndicator('emp_name')}</th>
                            <th className={headerClass} onClick={() => handleSort('emp_fonction')}>Fonction {getSortIndicator('emp_fonction')}</th>
                            <th className={headerClass} onClick={() => handleSort('module_name')}>Module {getSortIndicator('module_name')}</th>
                            <th className={headerClass} onClick={() => handleSort('project_type')}>Type {getSortIndicator('project_type')}</th>
                            <th className={headerClass} onClick={() => handleSort('project_status')}>Statut {getSortIndicator('project_status')}</th>
                            <th className={headerClass} onClick={() => handleSort('salle_name')}>Lieu {getSortIndicator('salle_name')}</th>
                            <th className={headerClass} onClick={() => handleSort('etp_name')}>Entreprise {getSortIndicator('etp_name')}</th>
                            <th className={headerClass} onClick={() => handleSort('dateDebut')}>Dates {getSortIndicator('dateDebut')}</th>
                            <th className={headerClass} onClick={() => handleSort('dureeH')}>Durée {getSortIndicator('dureeH')}</th>
                            <th className={headerClass + " text-right"} onClick={() => handleSort('taux_de_presence')}>Présence {getSortIndicator('taux_de_presence')}</th>
                        </tr>
                    </thead>
                    <AnimatePresence>
                        <motion.tbody
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white divide-y divide-gray-200"
                        >
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <motion.tr
                                        key={item.id || index} // Use item.id if available, fallback to index
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.03 }}
                                        className="text-sm text-gray-800 hover:bg-gray-50"
                                    >
                                        <td className={cellClass}>{item.emp_matricule}</td>
                                        <td className={cellClass}>{item.emp_name} {item.emp_firstname}</td>
                                        <td className={cellClass}>{item.emp_fonction}</td>
                                        <td className={cellClass}>{item.module_name}</td>
                                        <td className={cellClass}>{item.project_type}</td>
                                        <td className={cellClass}>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.project_status === 'Terminé' ? 'bg-green-100 text-green-800' :
                                                item.project_status === 'Supprimé' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {item.project_status}
                                            </span>
                                        </td>
                                        <td className={cellClass}>{item.salle_name || ''} {item.salle_quartier || ''}</td>
                                        <td className={cellClass}>{item.etp_name}</td>
                                        <td className={cellClass}>{item.dateDebut} au {item.dateFin}</td>
                                        <td className={cellClass + " text-center"}>{item.dureeH}h</td>
                                        <td className={cellClass + " text-right"}>
                                            {item.taux_de_presence !== null ? `${item.taux_de_presence} %` : '%'}
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                                        Aucune donnée trouvée.
                                    </td>
                                </motion.tr>
                            )}
                        </motion.tbody>
                    </AnimatePresence>
                </table>
            </div>

            {/* Pagination Controls */}
            {filteredAndSortedData.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 mb-8">
                    {/* Previous Button */}
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Précédent
                    </button>
 
                    {/* Next Button */}
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReportingEmploye;
