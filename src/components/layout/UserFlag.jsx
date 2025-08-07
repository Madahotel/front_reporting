import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

const UserFlag = () => {
  const { setting, user } = useContext(UserContext);
  
  // Détermine le code pays en priorité:
  // 1. Depuis les settings (si disponible)
  // 2. Depuis les infos user directes
  // 3. Valeur par défaut (MG pour Madagascar)
  const countryCode = setting?.country_code || user?.country_code || 'MG';
  const countryName = setting?.country_name || user?.country || 'Madagascar';

  const getFlagUrl = () => {
    const flagMapping = {
      'CI': 'https://flagcdn.com/w40/ci.png', // Côte d'Ivoire
      'MG': 'https://flagcdn.com/w40/mg.png'  // Madagascar
    };
    
    return flagMapping[countryCode] || '/images/default-flag.png';
  };

  return (
    <button
      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      title={`Bienvenue sur Formafusion ${countryName}`}
      aria-label={`Drapeau national de ${countryName}`}
    >
      <img
        src={getFlagUrl()}
        alt={`Drapeau ${countryName}`}
        className="w-5 h-5 rounded-sm object-cover border border-gray-200"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/images/default-flag.png';
        }}
        loading="lazy"
      />
    </button>
  );
};

export default UserFlag;