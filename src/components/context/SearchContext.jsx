import React, { createContext, useContext, useState, useCallback } from 'react'; // Import useCallback
import api from '../utils/api';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);

  // Memoize fetchSearchResults using useCallback
  const fetchSearchResults = useCallback(async (termOverride) => {
    // Use termOverride if provided, otherwise use the current searchTerm state
    const currentTerm = termOverride !== undefined ? termOverride : searchTerm;

    if (!currentTerm || currentTerm.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    try {
      const params = { q: currentTerm };
      if (selectedYear) params.year = selectedYear;
      if (activeMonth !== null) params.month = activeMonth;

      const response = await api.get(`/search-global`, { params });
      setSearchResults(response.data.dossiers || []);
    } catch (err) {
      console.error("Erreur lors de la recherche :", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm, selectedYear, activeMonth]); // Dependencies for fetchSearchResults

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        searchResults,
        setSearchResults,
        fetchSearchResults,
        searchLoading,
        selectedYear,
        setSelectedYear,
        activeMonth,
        setActiveMonth,
        showSearchBar,
        setShowSearchBar,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};