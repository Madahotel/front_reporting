import React from 'react';
import { Check, Sparkles, Mail, Building, User, Phone } from 'lucide-react';

const ConfirmationStep = ({ formData, stepAnimation, handleInputChange, getEntityLabel }) => {
  return (
    <div className={`space-y-6 transition-all duration-300 ${stepAnimation}`}>
      <div className="text-center">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-purple-500 rounded-full animate-spin-slow opacity-20"></div>
          <div className="relative bg-gradient-to-r from-emerald-100 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center">
            <Check className="h-8 w-8 text-emerald-600 animate-scale-in" />
          </div>
          <div className="absolute -top-2 -right-2 animate-bounce">
            <Sparkles className="h-6 w-6 text-purple-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Récapitulatif de votre compte</h2>
        <p className="text-gray-600">Vérifiez vos informations avant de finaliser</p>
      </div>
      
      <div className="bg-gradient-to-r from-white/80 to-purple-50/50 backdrop-blur-sm rounded-2xl p-6 space-y-4 border border-gray-200 shadow-lg animate-slide-up">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 hover:bg-purple-50/30 px-3 py-2 rounded-lg transition-all duration-200">
          <span className="font-semibold text-gray-700 flex items-center">
            <Mail className="h-4 w-4 mr-2 text-purple-500" />
            Email :
          </span>
          <span className="text-gray-900 font-medium">{formData.email}</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 hover:bg-purple-50/30 px-3 py-2 rounded-lg transition-all duration-200">
          <span className="font-semibold text-gray-700 flex items-center">
            <Building className="h-4 w-4 mr-2 text-purple-500" />
            Type de compte :
          </span>
          <span className="text-gray-900 font-medium capitalize">
            {formData.accountType === 'centre' ? 'Centre de formation' : 
             formData.accountType === 'entreprise' ? 'Entreprise' : 'Particulier'}
            {formData.subAccountType && ` (${formData.subAccountType.replace('-', ' ')})`}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 hover:bg-purple-50/30 px-3 py-2 rounded-lg transition-all duration-200">
          <span className="font-semibold text-gray-700 flex items-center">
            <User className="h-4 w-4 mr-2 text-purple-500" />
            {formData.accountType === 'particulier' ? 'Nom complet' : getEntityLabel()} :
          </span>
          <span className="text-gray-900 font-medium">
            {formData.accountType === 'particulier' 
              ? `${formData.firstName} ${formData.lastName}`.trim()
              : formData.entityName
            }
          </span>
        </div>
        <div className="flex justify-between items-center hover:bg-purple-50/30 px-3 py-2 rounded-lg transition-all duration-200">
          <span className="font-semibold text-gray-700 flex items-center">
            <Phone className="h-4 w-4 mr-2 text-purple-500" />
            Téléphone :
          </span>
          <span className="text-gray-900 font-medium">{formData.phone}</span>
        </div>
        
        {(formData.accountType === 'centre' || formData.accountType === 'entreprise') && (
          <>
            <div className="border-t border-purple-200 pt-4 mt-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 text-purple-500 mr-2 animate-pulse" />
                Administrateur principal :
              </h4>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 hover:bg-purple-50/30 px-3 py-2 rounded-lg transition-all duration-200">
              <span className="font-semibold text-gray-700">Nom complet :</span>
              <span className="text-gray-900 font-medium">{formData.adminFirstName} {formData.adminLastName}</span>
            </div>
            <div className="flex justify-between items-center hover:bg-purple-50/30 px-3 py-2 rounded-lg transition-all duration-200">
              <span className="font-semibold text-gray-700">Fonction :</span>
              <span className="text-gray-900 font-medium">{formData.adminFunction}</span>
            </div>
          </>
        )}
      </div>
      
      {/* Terms and conditions checkbox */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl p-6 animate-slide-up">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-0.5"
          />
          <label htmlFor="acceptTerms" className="text-sm text-purple-800 font-medium cursor-pointer">
            J'accepte les{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700 underline font-semibold">
              conditions générales d'utilisation
            </a>{' '}
            et la{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700 underline font-semibold">
              politique de confidentialité
            </a>{' '}
            de Formafusion.
          </label>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationStep;