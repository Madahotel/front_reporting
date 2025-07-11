import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../../utils/api';

const DownloadProgramButton = ({ moduleId, buttonText = "Télécharger le programme", className = "" }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/formation/exportPdf/${moduleId}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let filename = `programme_formation_${moduleId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=["']?(?:UTF-8'')?([^"';]+)/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Erreur lors du téléchargement du programme:", err);
      if (err.response) {
        const errorBlob = err.response.data;
        if (errorBlob instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result;
                try {
                    const jsonError = JSON.parse(text);
                    setError(`Erreur du serveur (${err.response.status}) : ${jsonError.message || JSON.stringify(jsonError)}`);
                } catch (e) {
                    if (text.includes("<!DOCTYPE html>")) {
                        setError("Le serveur a renvoyé une page d'erreur HTML. (Problème côté serveur)");
                    } else {
                        setError(`Erreur du serveur (${err.response.status}) : Réponse inattendue.`);
                    }
                }
            };
            reader.onerror = () => {
                setError("Échec du téléchargement. Impossible de lire la réponse d'erreur du serveur.");
            };
            reader.readAsText(errorBlob);
        } else {
            setError(`Erreur du serveur (${err.response.status}) : ${err.response.statusText || 'Réponse inattendue.'}`);
        }
      } else if (err.request) {
        setError("Impossible de se connecter au serveur. Vérifiez votre connexion internet.");
      } else {
        setError("Échec du téléchargement du programme. Une erreur inattendue est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${className} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <FontAwesomeIcon icon={faSpinner} spin className="mr-2 text-lg" />
        ) : (
          <FontAwesomeIcon icon={faDownload} className="mr-2 text-lg" />
        )}
        {loading ? "Téléchargement..." : buttonText}
      </button>
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default DownloadProgramButton;