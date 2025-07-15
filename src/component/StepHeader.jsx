import React from 'react';

const StepHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="relative mx-auto mb-4">
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-lg animate-float">
          <span className="font-bold text-2xl">F</span>
        </div>
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
        Inscrivez-vous gratuitement sur Formafusion
      </h1>
      <p className="text-gray-600 text-sm animate-fade-in-delay">
        Plateforme collaborative de gestion de formation
      </p>
    </div>
  );
};

export default StepHeader;