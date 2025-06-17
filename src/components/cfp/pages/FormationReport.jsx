import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import FormationFilter from '../pages/FormationFilter ';

const FormationReport = () => {
  // State for form inputs
  const [dateRange, setDateRange] = useState('Tous les dates');
  const [selectedFormation, setSelectedFormation] = useState('all');
  
  // State for fetched data
  const [formationData, setFormationData] = useState([]);
  const [formationsList, setFormationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRangeInfo, setDateRangeInfo] = useState({
    earliest: '',
    latest: ''
  });

  // Function to fetch data from the API
  const fetchFormationData = async (formationId = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('cfp/reporting/formation');
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;
      
      // Set the formations list for the dropdown
      setFormationsList(data.all_cfp_formation || []);
      
      // Set date range info
      setDateRangeInfo({
        earliest: data.formatedEarliestDate,
        latest: data.formatedLatestDate
      });

      // Filter data based on selected formation if provided
      let filteredData = data.all_learner || [];
      if (formationId && formationId !== 'all') {
        filteredData = filteredData.filter(item => 
          item.idModule === parseInt(formationId)
        );
      }

      setFormationData(filteredData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
      setError("Impossible de charger les données. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormationData();
  }, []);

  const handleFilter = ({ dateRange, formation }) => {
    fetchFormationData(formation, dateRange.startDate, dateRange.endDate);
  };

  // Format date for display
  const formatDateDisplay = () => {
    if (dateRange === 'Tous les dates') {
      return `${dateRangeInfo.earliest} - ${dateRangeInfo.latest}`;
    }
    return dateRange;
  };

  return (
    <div className="flex-grow pt-20 lg:pt-20">
      <div className="flex flex-col w-full px-4 mx-auto xl:p-0 gap-y-4 xl:container">
        {/* Header with filter */}
        <div className="bg-white rounded-lg shadow-xs border border-gray-100 p-4">
          <FormationFilter 
            onFilter={handleFilter}
            loading={loading}
            formationsList={formationsList}
          />
        </div>

        {/* Results section */}
        <div className="bg-white rounded-lg shadow-xs border border-gray-100 overflow-hidden">
          {/* Table header with summary */}
          <div className="px-5 py-3 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Résultats des formations</h2>
                <div className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Dates :</span> {formatDateDisplay()} | 
                  <span className="font-medium ml-2">Formation :</span> {
                    selectedFormation === 'all' 
                      ? 'Toutes les formations' 
                      : formationsList.find(f => f.idModule === parseInt(selectedFormation))?.module_name || selectedFormation
                  }
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                {formationData.length} {formationData.length === 1 ? 'résultat' : 'résultats'}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonction</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lieu</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan="10" className="px-5 py-4 text-center text-sm text-gray-500">
                      <div className="flex justify-center items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Chargement des données...
                      </div>
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan="10" className="px-5 py-4 text-center text-sm text-red-600">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && formationData.length === 0 && (
                  <tr>
                    <td colSpan="10" className="px-5 py-4 text-center text-sm text-gray-500">
                      Aucune donnée de formation trouvée.
                    </td>
                  </tr>
                )}
                {!loading && !error && formationData.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-900">{data.emp_matricule}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{data.emp_firstname} {data.emp_name}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">{data.emp_fonction}</td>
                    <td className="px-5 py-3 text-sm text-gray-900">{data.module_name}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">{data.project_type}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        data.project_status === 'Terminé' 
                          ? 'bg-green-100 text-green-800' 
                          : data.project_status === 'En cours' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {data.project_status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {data.salle_name && data.salle_quartier 
                        ? `${data.salle_name}, ${data.salle_quartier}` 
                        : 'Non spécifié'}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-900">{data.etp_name}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">{data.dateDebut}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{data.dureeH}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationReport;