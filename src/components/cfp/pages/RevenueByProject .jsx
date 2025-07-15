import React, { useState, useEffect, useMemo,useContext } from 'react';
import { UserContext } from "../../context/UserContext";
import { formatMontant } from "../../utils/formatMontant";
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom'; // Add Link here

const RevenueByProject = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [projects, setProjects] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
  

  const years = useMemo(() => {
    return [currentYear + 1, currentYear, currentYear - 1];
  }, [currentYear]);

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const fetchData = async (year) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/cfp/reporting/chiffre/projet/${year}`);
      const formattedProjects = response.data.projects.map(project => ({
        id: project.id_projet,
        formation: project.module_name,
        reference: project.project_reference,
        debut: project.date_debut,
        fin: project.date_fin,
        cout: project.total_ttc,
        pourcentage: `${project.percentage} %`,
        detail: `/reporting/project/detail/${project.idProjet}`
      }));

      setProjects(formattedProjects);
      setTotalPrice(response.data.total_price);
      setCurrentPage(1);
    } catch (err) {
      setError("Impossible de charger les données pour l'année sélectionnée. Veuillez réessayer.");
      console.error("Erreur lors de la récupération des données:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return "0";
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number).replace(',', ' ');
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const sortTable = (columnName) => {
    const sorted = [...projects].sort((a, b) => {
      if (typeof a[columnName] === 'string' && isNaN(parseFloat(a[columnName]))) {
        return a[columnName].localeCompare(b[columnName]);
      }

      const valA = parseFloat(String(a[columnName]).replace(/[^0-9.-]+/g, ''));
      const valB = parseFloat(String(b[columnName]).replace(/[^0-9.-]+/g, ''));

      if (!isNaN(valA) && !isNaN(valB)) return valA - valB;

      if (columnName === 'debut' || columnName === 'fin') {
        return new Date(a[columnName]) - new Date(b[columnName]);
      }

      return 0;
    });

    setProjects(sorted);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = projects.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-4">
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xl text-red-700 font-semibold text-center">Une erreur est survenue :</p>
        <p className="text-md text-red-600 mt-2 text-center">{error}</p>
        <button
          onClick={() => fetchData(selectedYear)}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col w-full h-full p-4 md:p-20 "
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col w-full max-w-screen-2xl px-4 md:px-8 mx-auto min-h-screen">
        <motion.div className="bg-white rounded-lg shadow-xl p-6 mb-8" variants={itemVariants}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
              Chiffre d'affaires par projet
            </h1>
            <div className="flex items-center space-x-2">
              <label htmlFor="yearSelect" className="text-md font-medium text-gray-700 mx-auto">Année:</label>
              <select
                id="yearSelect"
                name="yearSelect"
                className="mx-auto w-32 px-3 py-2 text-base font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md appearance-none cursor-pointer focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
                value={selectedYear}
                onChange={handleYearChange}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <motion.div className="overflow-x-auto" variants={itemVariants}>
            {currentProjects.length > 0 ? (
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-blue-600" onClick={() => sortTable('formation')}>
                      <i className="fa-solid fa-arrow-up-wide-short mr-1"></i> Formation
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-blue-600" onClick={() => sortTable('reference')}>
                      <i className="fa-solid fa-arrow-up-wide-short mr-1"></i> Référence
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-blue-600" onClick={() => sortTable('debut')}>
                      <i className="fa-solid fa-arrow-up-wide-short mr-1"></i> Début
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-blue-600" onClick={() => sortTable('fin')}>
                      <i className="fa-solid fa-arrow-up-wide-short mr-1"></i> Fin
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                      onClick={() => sortTable('cout')}
                    >
                      <i className="fa-solid fa-arrow-up-wide-short mr-1"></i> Coût
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-blue-600" onClick={() => sortTable('pourcentage')}>
                      Pourcentage
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProjects.map((project, index) => (
                    <motion.tr key={project.id} className="bg-white border-b border-gray-200 hover:bg-gray-50" variants={itemVariants}>
                      <td className="px-4 py-3 text-sm text-gray-800">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-4 py-3 text-left text-sm text-gray-800">{project.formation}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{project.reference}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-800">{project.debut}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-800">{project.fin}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-800 font-medium">{formatMontant(project.cout,currency)}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-800">{project.pourcentage}</td>
                      <td className="px-4 py-3 text-center text-sm">
 <Link
  to={`https://projets.forma-fusion.com/cfp/projets/${project.id}/detail`} 
  className="text-[#A462A4] hover:text-[#A462A4b9]"
   target="_blank"
>
  <i className="fa-solid fa-eye"></i>
</Link>
                      </td>

                    </motion.tr>
                  ))}
                  <tr className="bg-gray-100 font-bold text-gray-800">
                    <td colSpan="5" className="px-4 py-3 text-right text-sm uppercase">Total</td>
                    <td className="px-4 py-3 text-right text-sm">{formatMontant(totalPrice,currency)}</td>
                    <td className="px-4 py-3 text-right text-sm">100 %</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-600 text-lg py-8">Aucun projet trouvé pour l'année sélectionnée.</p>
            )}
          </motion.div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">
                Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {number}
                </button>
              ))}
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">
                Suivant
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RevenueByProject;
