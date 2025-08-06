import React, { useState, useEffect } from 'react';
import CustomDateRangePicker from './DateRangePicker'; 

const FormationFilter = ({
    onFilter,
    loading,
    formationsList,
    initialDateRange, 
    initialSelectedFormation, 
    setDateRange, 
    setSelectedFormation 
}) => {
    const [currentDateRange, setCurrentDateRange] = useState(initialDateRange);
    const [currentSelectedFormation, setCurrentSelectedFormation] = useState(initialSelectedFormation);

    useEffect(() => {
        setCurrentDateRange(initialDateRange);
    }, [initialDateRange]);

    useEffect(() => {
        setCurrentSelectedFormation(initialSelectedFormation);
    }, [initialSelectedFormation]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilter({
            dateRange: currentDateRange, 
            formation: currentSelectedFormation 
        });
    };

    const handleDateRangeChange = (newRange) => {
        setCurrentDateRange(newRange); 
        setDateRange(newRange); 
    };

    return (
        <form onSubmit={handleSubmit} className=" left-0 w-full z-50 bg-white shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <input type="hidden" name="_token" value="ZWlYvh1CmbIJ5ZeoMrtOguIkozKdKMgS24whnBTj" autoComplete="off" />

                <div className="grid grid-cols-1 md:grid-cols-12 col-span-1 md:col-span-11 gap-4">
                    <div className="col-span-1 md:col-span-5">
                        <CustomDateRangePicker
                            dateRange={currentDateRange}
                            setDateRange={handleDateRangeChange} 
                        />
                    </div>

                    <div className="col-span-1 md:col-span-5">
                        <div className="relative">
                            <select
                                id="formation"
                                name="formation"
                                className="w-full pl-3 pr-8 py-2.5 text-sm text-slate-700 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A462A4] focus:border-[#A462A4] transition duration-150 appearance-none"
                                onChange={(e) => setCurrentSelectedFormation(e.target.value)} 
                                value={currentSelectedFormation} 
                                disabled={loading}
                            >
                                <option value="all">Tous les modules</option>
                                {formationsList.map((formation) => (
                                    <option key={formation.idModule} value={formation.idModule}>
                                        {formation.module_name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex items-center">
                        <button
                            type="submit"
                            className={`px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200 cursor-pointer ${
                                loading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#A462A4] text-white hover:bg-[#8e4f8e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A462A4]'
                            }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Chargement...
                                </span>
                            ) : 'Filtrer'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default FormationFilter;