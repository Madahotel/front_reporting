import React from 'react';
import { User, Sparkles } from 'lucide-react';

const AdminStep = ({ formData, stepAnimation, handleInputChange }) => {
  return (
    <div className={`space-y-6 transition-all duration-300 ${stepAnimation}`}>
      <div className="text-center">
        <div className="relative">
          <User className="mx-auto h-16 w-16 text-purple-600 mb-4 animate-float" />
          <div className="absolute -top-2 -right-2">
            <div className="h-6 w-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-30"></div>
            <div className="absolute inset-0 h-6 w-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrateur principal</h2>
        <p className="text-gray-600">Informations de la personne qui administrera ce compte</p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Prénom *
            </label>
            <input
              type="text"
              value={formData.adminFirstName}
              onChange={(e) => handleInputChange('adminFirstName', e.target.value)}
              placeholder="Prénom"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 hover:border-purple-300 bg-white/80 backdrop-blur-sm group-hover:shadow-md"
            />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Nom *
            </label>
            <input
              type="text"
              value={formData.adminLastName}
              onChange={(e) => handleInputChange('adminLastName', e.target.value)}
              placeholder="Nom de famille"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 hover:border-purple-300 bg-white/80 backdrop-blur-sm group-hover:shadow-md"
            />
          </div>
        </div>
        
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Fonction *
          </label>
          <input
            type="text"
            value={formData.adminFunction}
            onChange={(e) => handleInputChange('adminFunction', e.target.value)}
            placeholder="Ex: Directeur, Responsable formation, CEO..."
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 hover:border-purple-300 bg-white/80 backdrop-blur-sm group-hover:shadow-md"
          />
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl p-6 animate-slide-up">
        <div className="flex items-start space-x-3">
          <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 animate-pulse" />
          <p className="text-sm text-purple-800 font-medium">
            <strong>Note :</strong> Cette personne aura les droits d'administration complets sur le compte Formafusion.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminStep;