import React from 'react';

const ProgressBar = ({ currentStep, maxSteps, stepTitle }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-700">{stepTitle}</span>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
          {currentStep}/{maxSteps}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="h-3 rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-purple-500 to-violet-500 relative"
          style={{ width: `${(currentStep / maxSteps) * 100}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;