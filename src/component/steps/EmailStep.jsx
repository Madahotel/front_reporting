import React from 'react';
import { Mail, Sparkles, Check, AlertCircle } from 'lucide-react';

const EmailStep = ({ formData, validations, isLoading, stepAnimation, handleInputChange }) => {
  return (
    <div className={`space-y-6 transition-all duration-300 ${stepAnimation}`}>
      <div className="text-center">
        <div className="relative">
          <Mail className="mx-auto h-16 w-16 text-purple-600 mb-4 animate-bounce" />
          <div className="absolute -top-2 -right-2 animate-ping">
            <Sparkles className="h-6 w-6 text-purple-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in">
          Commençons par votre adresse e-mail
        </h2>
        <p className="text-gray-600 animate-fade-in-delay">
          Nous vérifierons que cette adresse n'est pas déjà utilisée
        </p>
      </div>
      
      <div className="relative group">
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="votre@email.com"
          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 hover:border-purple-300 bg-white/80 backdrop-blur-sm text-lg"
        />
        {isLoading && (
          <div className="absolute right-4 top-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-6 w-6 border border-purple-400 opacity-20"></div>
            </div>
          </div>
        )}
      </div>
      
      {formData.email && validations.email.message && (
        <div className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-500 transform ${
          validations.email.isValid 
            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 animate-success-pulse' 
            : 'text-rose-700 bg-rose-50 border border-rose-200 animate-shake'
        }`}>
          {validations.email.isValid ? (
            <div className="relative">
              <Check className="h-5 w-5 animate-scale-in" />
              <div className="absolute inset-0 animate-ping">
                <Check className="h-5 w-5 opacity-20" />
              </div>
            </div>
          ) : (
            <AlertCircle className="h-5 w-5 animate-wiggle" />
          )}
          <span className="text-sm font-medium">{validations.email.message}</span>
        </div>
      )}
    </div>
  );
};

export default EmailStep;