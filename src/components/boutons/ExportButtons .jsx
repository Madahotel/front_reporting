import React from 'react';
import api from '../utils/api';

const ExportButtons = ({
  xlEndpoint = null,
  pdfEndpoint = null,
  xlFileName = 'export.xlsx',
  pdfFileName = 'export.pdf',
  data = null,
  dataFilter = {},
  onError = () => {},
  className = '',
  labelExcel = 'Excel',
  labelPdf = 'PDF',
}) => {

  const downloadFile = async (endpoint, defaultFilename, requestData = null) => {
    try {
      const config = {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true,
      };

      const postData = requestData
        ? {
            data: Array.isArray(requestData) ? requestData : [requestData],
            data_filter: dataFilter
          }
        : null;

      const response = await api.post(endpoint, postData, config);

      // Récupération du nom de fichier depuis le header
      let filename = defaultFilename;
      const disposition = response.headers['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?(.+?)"?$/);
        if (match) filename = match[1];
      }

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);

    } catch (error) {
      let errorMessage = "Export failed";

      if (error.response) {
        try {
          const errorText = await error.response.data.text();
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorJson.message || errorMessage;
          } catch {
            errorMessage = errorText.includes('<!DOCTYPE html>')
              ? "Server error occurred"
              : errorText;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }

        console.error('Export error:', {
          status: error.response.status,
          config: error.config,
          request: error.request
        });

      } else {
        errorMessage = error.message || errorMessage;
        console.error('Network error:', error);
      }

      onError(errorMessage);
    }
  };

  return (
    <div className={`flex flex-wrap justify-center gap-2 my-5 ${className}`}>
      {xlEndpoint && (
        <button
          type="button"
          onClick={() => downloadFile(xlEndpoint, xlFileName, data)}
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
          onClick={() => downloadFile(pdfEndpoint, pdfFileName, data)}
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

export default ExportButtons;
