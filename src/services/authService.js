import api from "../components/utils/api";

export const authService = {
  async checkEmailAvailability(email) {
    try {
      const response = await api.post('/auth/check-email', { email });
      
      const isAvailable = true;
      
      return {
        success: true,
        available: isAvailable,
        message: isAvailable ? 'Email validé ✨' : 'Cette adresse email est déjà utilisée'
      };
    } catch (error) {
      return {
        success: false,
        available: false,
        message: error.response?.data?.message || 'Erreur lors de la vérification de l\'email'
      };
    }
  },

  async checkEntityNameAvailability(name, accountType) {
    try {
      const response = await api.post('/auth/check-entity-name', { 
        name, 
        account_type: accountType 
      });

      let message = (accountType == 'centre') ? 'Cette nom du centre de formation est déjà utilisée' : 'Cette nom de l\'entreprise est déjà utilisée';

      const isAvailable =  true;

      return {
        success: false,
        available: isAvailable,
        message: isAvailable ? 'Nom validé ✨' : message
      };
    } catch (error) {
      return {
        success: false,
        available: false,
        message: error.response?.data?.message || 'Erreur lors de la vérification du nom d\'entité'
      };
    }
  },

  async createAccount(formData) {
    try {
      const accountTypeMap = {
        particulier: 8,
        centre: 9,
        entreprise: {
          privee: 1,
          groupe: 2,
          ong: 5,
          'zone-franche': 6,
          publique: 4
        }
      };
  
      let account_type = null;
  
      if (formData.accountType === 'entreprise') {
        account_type = accountTypeMap.entreprise[formData.subAccountType] || null;
      } else {
        account_type = accountTypeMap[formData.accountType] || null;
      }
  
      if (!account_type) {
        throw new Error('Type de compte invalide.');
      }
  
      const basePayload = {
        customer_email: formData.email,
        password: formData.password,
        phone: formData.phone,
        account_type
      };
  
      let response;
  
      if (account_type === 8) {
        // Particulier
        response = await api.post('/register/customer', {
          ...basePayload,
          part_firstName: formData.firstName,
          part_name: formData.lastName
        });
      } else {
        // Entreprise ou centre
        response = await api.post('/register/customer', {
          ...basePayload,
          customer_name: formData.entity_name || formData.entityName,
          referent_firstName: formData.adminFirstName,
          referent_name: formData.adminLastName,
          function: formData.adminFunction
        });
      }
  
      return {
        success: true,
        data: response.data,
        message: response
      };
  
    } catch (error) {
      return {
        success: false,
        message: error,
        errors: error.response?.data?.errors || {}
      };
    }
  }
};