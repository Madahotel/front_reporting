import React from 'react';
import api from '../utils/api';

const ExportButtonsGet = ({
  xlEndpoint = null,
  pdfEndpoint = null,
  xlFileName = 'export.xlsx',
  pdfFileName = 'export.pdf',
  queryParams = {}, // Nouveau prop pour les paramètres de requête
  onError = () => {},
  className = '',
  labelExcel = 'Excel',
  labelPdf = 'PDF',
}) => {

const downloadFile = async (endpoint, defaultFilename) => {
  try {
    console.log(`Tentative de téléchargement depuis: ${endpoint}`);
    
    const config = {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf', // Spécifique pour PDF
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      withCredentials: true,
      params: queryParams
    };

    console.log('Configuration de la requête:', config);

    const response = await api.get(endpoint, config);
    console.log('Réponse reçue, headers:', response.headers);

    // Vérification du type de contenu
    const contentType = response.headers['content-type'];
    console.log('Content-Type:', contentType);
    
    if (!contentType.includes('application/pdf')) {
      console.warn('Le serveur n\'a pas retourné un PDF! Type reçu:', contentType);
      throw new Error('Le serveur n\'a pas retourné un document PDF valide');
    }

    // Récupération du nom de fichier
    let filename = defaultFilename;
    const disposition = response.headers['content-disposition'];
    if (disposition) {
      const match = disposition.match(/filename="?(.+?)"?$/);
      if (match) filename = match[1];
    }
    console.log('Nom de fichier déterminé:', filename);

    // Création du blob
    const blob = new Blob([response.data], { type: 'application/pdf' });
    console.log('Blob créé:', blob);

    const downloadUrl = window.URL.createObjectURL(blob);
    console.log('URL de téléchargement créée:', downloadUrl);

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      console.log('Nettoyage effectué');
    }, 100);

  } catch (error) {
    console.error('Erreur complète:', error);
    
    let errorDetails = {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : null
    };
    
    console.error('Détails de l\'erreur:', errorDetails);
    onError(error.message || "Échec du téléchargement du PDF");
  }
};

  return (
    <div className={`flex flex-wrap justify-center gap-2 my-5 ${className}`}>
      {xlEndpoint && (
        <button
          type="button"
          onClick={() => downloadFile(xlEndpoint, xlFileName)}
          className="px-4 py-3 font-medium text-green-700 bg-green-100 rounded-lg shadow-sm hover:text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <span className="inline-flex items-center gap-2">
            <i className="fa-solid fa-file-excel text-sm" aria-hidden="true"></i>
            <p>{labelExcel}</p>
          </span>
        </button>
      )}
      {pdfEndpoint && (
        <button
          type="button"
          onClick={() => downloadFile(pdfEndpoint, pdfFileName)}
          className="px-4 py-3 font-medium text-red-600 bg-red-100 rounded-lg shadow-sm hover:text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <span className="inline-flex items-center gap-2">
            <i className="fa-solid fa-file-pdf text-sm" aria-hidden="true"></i>
            <p>{labelPdf}</p>
          </span>
        </button>
      )}
    </div>
  );
};

export default ExportButtonsGet;