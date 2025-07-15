import React from 'react';
import { Building, User, GraduationCap, Check, Sparkles, Info } from 'lucide-react';

const AccountTypeStep = ({ formData, stepAnimation, handleInputChange }) => {
  const accountTypes = [
    { id: 'particulier', label: 'Particulier', desc: 'Individus souhaitant suivre des formations', icon: User },
    { id: 'centre', label: 'Centre de formation', desc: 'Organismes proposant des formations', icon: GraduationCap },
    { id: 'entreprise', label: 'Entreprise', desc: 'Sociétés cherchant à former leurs employés', icon: Building }
  ];

  const enterpriseSubTypes = [
    { 
      id: 'privee', 
      label: 'Entreprise privée', 
      desc: 'Société commerciale à but lucratif (SARL, SA, SAS, etc.)'
    },
    { 
      id: 'groupe', 
      label: 'Groupe d\'entreprise', 
      desc: 'Maison mère ou holding gérant plusieurs filiales'
    },
    { 
      id: 'ong', 
      label: 'ONG', 
      desc: 'Organisation non gouvernementale à but non lucratif'
    },
    { 
      id: 'zone-franche', 
      label: 'Zone Franche', 
      desc: 'Entreprise bénéficiant d\'avantages fiscaux en zone franche'
    },
    { 
      id: 'publique', 
      label: 'Institution publique', 
      desc: 'Organisme public ou parapublic (ministères, collectivités, etc.)'
    }
  ];

  return (
    <div className={`space-y-6 transition-all duration-300 ${stepAnimation}`}>
      <div className="text-center">
        <div className="relative">
          <Building className="mx-auto h-16 w-16 text-purple-600 mb-4 animate-float" />
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="h-2 w-8 bg-purple-200 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Quel type de compte souhaitez-vous créer ?
        </h2>
        <p className="text-gray-600">
          Choisissez le profil qui correspond le mieux à votre situation
        </p>
      </div>
      
      <div className="space-y-4">
        {accountTypes.map((option, index) => {
          const IconComponent = option.icon;
          return (
            <div
              key={option.id}
              onClick={() => handleInputChange('accountType', option.id)}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group animate-slide-in-${index} ${
                formData.accountType === option.id 
                  ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50 shadow-lg shadow-purple-100' 
                  : 'border-gray-200 hover:border-purple-300 bg-white/60 backdrop-blur-sm'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    formData.accountType === option.id 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-500'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{option.label}</h3>
                    <p className="text-sm text-gray-600">{option.desc}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                  formData.accountType === option.id 
                    ? 'border-purple-500 bg-purple-500 scale-110' 
                    : 'border-gray-300 group-hover:border-purple-400'
                }`}>
                  {formData.accountType === option.id && (
                    <Check className="w-4 h-4 text-white m-0.5 animate-scale-in" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {formData.accountType === 'entreprise' && (
        <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-xl border border-gray-200 animate-slide-down">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
            Précisez le type d'entreprise :
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {enterpriseSubTypes.map((subOption, index) => (
              <div key={subOption.id} className="group">
                <label 
                  className="flex items-start space-x-3 cursor-pointer p-4 rounded-lg hover:bg-white/60 transition-all duration-200 animate-fade-in border border-gray-100 hover:border-purple-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <input
                    type="radio"
                    name="subAccountType"
                    value={subOption.id}
                    checked={formData.subAccountType === subOption.id}
                    onChange={(e) => handleInputChange('subAccountType', e.target.value)}
                    className="w-5 h-5 text-purple-600 border-2 border-gray-300 focus:ring-purple-500 focus:ring-2 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900 font-medium">{subOption.label}</span>
                      <div className="group/tooltip relative">
                        <Info className="h-4 w-4 text-gray-400 hover:text-purple-500 transition-colors" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/tooltip:block">
                          <div className="bg-gray-800 text-white text-xs rounded-lg p-2 whitespace-nowrap shadow-lg">
                            {subOption.desc}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{subOption.desc}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountTypeStep;