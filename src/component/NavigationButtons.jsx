import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const NavigationButtons = ({ 
  currentStep, 
  maxSteps, 
  canProceedToNext, 
  onPrevious, 
  onNext, 
  onCreateAccount 
}) => {
  return (
    <div className="flex justify-between">
      <button
        onClick={onPrevious}
        disabled={currentStep === 1}
        className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
          currentStep === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105 hover:shadow-md'
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Précédent</span>
      </button>
      
      {currentStep < maxSteps ? (
        <button
          onClick={onNext}
          disabled={!canProceedToNext}
          className={`flex items-center space-x-2 px-8 py-3 rounded-xl transition-all duration-300 font-medium transform ${
            canProceedToNext
              ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 hover:scale-105 hover:shadow-lg shadow-purple-200'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>Suivant</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={onCreateAccount}
          disabled={!canProceedToNext}
          className={`flex items-center space-x-2 px-8 py-3 rounded-xl transition-all duration-300 font-medium transform ${
            canProceedToNext
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 hover:scale-105 hover:shadow-lg shadow-emerald-200 animate-pulse'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Check className="h-5 w-5" />
          <span>Créer le compte</span>
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;