import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const AppLauncherGrid = () => {
  const [appLaunchers, setAppLaunchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppLaunchers = async () => {
      try {
        const response = await api.get('/app_launcher');
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          const formattedData = response.data.data.map(item => ({
            name: item.label,
            href: item.link,
            icon: `https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/${item.icone}`,
          }));
          setAppLaunchers(formattedData);
        } else {
          setError('Format de réponse API invalide.');
          setAppLaunchers([]);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des lanceurs d\'applications :', err);
        setError('Échec du chargement des liens d\'application. Veuillez réessayer plus tard.');
        setAppLaunchers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppLaunchers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="ml-3 text-gray-700">Chargement des applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
      {appLaunchers.map(({ name, href, icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
          <img src={icon} alt={name} className="w-12 h-12 mb-2" />
          <span className="text-sm font-medium text-gray-700 text-center">{name}</span>
        </a>
      ))}
    </div>
  );
};

export default AppLauncherGrid;