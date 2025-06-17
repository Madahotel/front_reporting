import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDateRangePicker = ({ onChange, dateRange, setDateRange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const ranges = [
    { label: 'Tous', value: 'all' },
    { label: 'Aujourd\'hui', value: 'today' },
    { label: 'Hier', value: 'yesterday' },
    { label: '7 derniers jours', value: 'last7Days' },
    { label: '30 derniers jours', value: 'last30Days' },
    { label: 'Mois actuel', value: 'thisMonth' },
    { label: 'Mois dernier', value: 'lastMonth' },
    { label: 'Personnalisée', value: 'custom' }
  ];

  const handleRangeChange = (range) => {
    const today = new Date();
    let startDate, endDate;

    switch (range) {
      case 'today':
        startDate = today;
        endDate = today;
        break;
      case 'yesterday':
        startDate = subDays(today, 1);
        endDate = subDays(today, 1);
        break;
      case 'last7Days':
        startDate = subDays(today, 6);
        endDate = today;
        break;
      case 'last30Days':
        startDate = subDays(today, 29);
        endDate = today;
        break;
      case 'thisMonth':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'lastMonth':
        startDate = startOfMonth(subMonths(today, 1));
        endDate = endOfMonth(subMonths(today, 1));
        break;
      case 'all':
        startDate = null;
        endDate = null;
        break;
      case 'custom':
      default:
        return; // L'utilisateur sélectionnera manuellement
    }

    setDateRange({
      range,
      startDate,
      endDate,
      label: ranges.find(r => r.value === range)?.label || 'Personnalisée'
    });

    if (range !== 'custom') {
      onChange({ startDate, endDate });
      setIsOpen(false);
    }
  };

  const handleCustomDateChange = (dates) => {
    const [start, end] = dates;
    setDateRange({
      range: 'custom',
      startDate: start,
      endDate: end,
      label: start && end 
        ? `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`
        : 'Personnalisée'
    });
  };

  const applyCustomRange = () => {
    if (dateRange.startDate && dateRange.endDate) {
      onChange({ startDate: dateRange.startDate, endDate: dateRange.endDate });
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 input input-bordered text-slate-600 w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-slate-400">Plage de date</span>
        <span className="grow">{dateRange.label}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white shadow-lg rounded-md p-4 w-full md:w-[700px] border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48">
              <ul className="space-y-1">
                {ranges.map(({ label, value }) => (
                  <li key={value}>
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-2 rounded-md ${dateRange.range === value ? 'bg-[#A462A4] text-white' : 'hover:bg-gray-100'}`}
                      onClick={() => handleRangeChange(value)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1">
              <DatePicker
                selectsRange
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={handleCustomDateChange}
                inline
                monthsShown={2}
                calendarClassName="w-full"
              />
            </div>
          </div>

          {dateRange.range === 'custom' && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                {dateRange.startDate && dateRange.endDate
                  ? `${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(dateRange.endDate, 'dd/MM/yyyy')}`
                  : 'Sélectionnez une plage'}
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm text-white rounded-md ${!dateRange.startDate || !dateRange.endDate ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#A462A4] hover:bg-[#A462A4b9]'}`}
                  onClick={applyCustomRange}
                  disabled={!dateRange.startDate || !dateRange.endDate}
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDateRangePicker;