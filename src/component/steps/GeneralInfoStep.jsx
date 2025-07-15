import React, { useState } from 'react';
import { User, Building, Lock, Phone, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

const GeneralInfoStep = ({ formData, validations, stepAnimation, handleInputChange, getEntityLabel }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`space-y-6 transition-all duration-300 ${stepAnimation}`}>
      <div className="text-center">
        <div className="relative">
          <User className="mx-auto h-16 w-16 text-purple-600 mb-4 animate-pulse" />
          <div className="absolute -top-1 -right-1 animate-bounce">
            <div className="h-4 w-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations générales</h2>
        <p className="text-gray-600">Complétez votre profil pour finaliser l'inscription</p>
      </div>
      
      <div className="space-y-6">
        {formData.accountType === 'particulier' ? (
          // Champs séparés pour les particuliers
          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2 text-purple-500" />
                Prénom
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Votre prénom"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 hover:border-purple-300 bg-white/80 backdrop-blur-sm group-hover:shadow-md"
              />
              {formData.firstName && validations.firstName.message && (
                <div className={`flex items-center space-x-3 mt-3 p-3 rounded-lg transition-all duration-500 ${
                  validations.firstName.isValid 
                    ? 'text-emerald-700 bg-emerald-50 animate-success-pulse' 
                    : 'text-rose-700 bg-rose-50 animate-shake'
                }`}>
                  {validations.firstName.isValid ? (
                    <Check className="h-4 w-4 animate-scale-in" />
                  ) : (
                    <AlertCircle className="h-4 w-4 animate-wiggle" />
                  )}
                  <span className="text-sm font-medium">{validations.firstName.message}</span>
                </div>
              )}
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2 text-purple-500" />
                Nom
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Votre nom"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 hover:border-purple-300 bg-white/80 backdrop-blur-sm group-hover:shadow-md"
              />
              {formData.lastName && validations.lastName.message && (
                <div className={`flex items-center space-x-3 mt-3 p-3 rounded-lg transition-all duration-500 ${
                  validations.lastName.isValid 
                    ? 'text-emerald-700 bg-emerald-50 animate-success-pulse' 
                    : 'text-rose-700 bg-rose-50 animate-shake'
                }`}>
                  {validations.lastName.isValid ? (
                    <Check className="h-4 w-4 animate-scale-in" />
                  ) : (
                    <AlertCircle className="h-4 w-4 animate-wiggle" />
                  )}
                  <span className="text-sm font-medium">{validations.lastName.message}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Champ unique pour les centres et entreprises
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Building className="h-4 w-4 mr-2 text-purple-500" />
              {getEntityLabel()}
            </label>
            <input
              type="text"
              value={formData.entityName}
              onChange={(e) => handleInputChange('entityName', e.target.value)}
              placeholder={`Saisissez le ${getEntityLabel().toLowerCase()}`}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 hover:border-purple-300 bg-white/80 backdrop-blur-sm text-lg group-hover:shadow-md"
            />
            {formData.entityName && validations.entityName.message && (
              <div className={`flex items-center space-x-3 mt-3 p-3 rounded-lg transition-all duration-500 ${
                validations.entityName.isValid 
                  ? 'text-emerald-700 bg-emerald-50 animate-success-pulse' 
                  : 'text-rose-700 bg-rose-50 animate-shake'
              }`}>
                {validations.entityName.isValid ? (
                  <Check className="h-4 w-4 animate-scale-in" />
                ) : (
                  <AlertCircle className="h-4 w-4 animate-wiggle" />
                )}
                <span className="text-sm font-medium">{validations.entityName.message}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Lock className="h-4 w-4 mr-2 text-purple-500" />
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Créez un mot de passe sécurisé"
              className="w-full px-6 py-4 pr-14 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 hover:border-purple-300 bg-white/80 backdrop-blur-sm text-lg group-hover:shadow-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-gray-400 hover:text-purple-600 transition-all duration-200 hover:scale-110"
            >
              {showPassword ? (
                <EyeOff className="h-6 w-6 animate-fade-in" />
              ) : (
                <Eye className="h-6 w-6 animate-fade-in" />
              )}
            </button>
          </div>
          {formData.password && validations.password.message && (
            <div className={`flex items-start space-x-3 mt-3 p-3 rounded-lg transition-all duration-500 ${
              validations.password.isValid 
                ? 'text-emerald-700 bg-emerald-50 animate-success-pulse' 
                : 'text-rose-700 bg-rose-50'
            }`}>
              {validations.password.isValid ? (
                <Check className="h-4 w-4 mt-0.5 animate-scale-in" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 animate-wiggle" />
              )}
              <span className="text-sm font-medium">{validations.password.message}</span>
            </div>
          )}
        </div>
        
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Phone className="h-4 w-4 mr-2 text-purple-500" />
            Numéro de téléphone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+261 XX XX XXX XX"
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 hover:border-purple-300 bg-white/80 backdrop-blur-sm text-lg group-hover:shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoStep;