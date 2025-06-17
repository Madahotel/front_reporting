import React, { createContext, useState } from 'react';

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [activeMonth, setActiveMonth] = useState(null);

  return (
    <FilterContext.Provider value={{ 
      selectedYear, 
      setSelectedYear,
      activeMonth,
      setActiveMonth
    }}>
      {children}
    </FilterContext.Provider>
  );
};
