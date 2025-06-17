import React, { createContext, useState, useEffect } from "react";

// Création du contexte
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accountType, setAccountType] = useState(null);

  // Fonction utilitaire pour convertir le code type en texte
  const getAccountTypeText = (typeCode) => {
    const code = typeof typeCode === "string" ? typeCode : String(typeCode);
    switch (code) {
      case "1":
        return "Entreprise privée";
      case "2":
        return "Groupe d'entreprise";
      case "4":
        return "Institution publique";
      case "5":
        return "ONG ou Association";
      case "6":
        return "Zone franche et entreprise spéciale";
      case "7":
        return "Autres";
      case "8":
        return "Particulier";
      case "9":
        return "Centre de formation";
      default:
        return "Inconnu";
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAccountType = localStorage.getItem("accountType");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Si accountType n'est pas encore dans le localStorage mais existe dans l'objet user
        if (!storedAccountType && parsedUser?.account_type) {
          const accountTypeText = getAccountTypeText(parsedUser.account_type);
          localStorage.setItem("accountType", accountTypeText);
          setAccountType(accountTypeText);
        } else if (storedAccountType) {
          setAccountType(storedAccountType);
        }
      } catch (error) {
        console.error("❌ Erreur lors du parsing de l'utilisateur :", error);
        localStorage.removeItem("user");
      }
    } else {
      setUser(null);
      setAccountType(null);
    }
  }, []);

  const updateUser = (userData) => {
    if (!userData) return;

    console.log("🔄 Mise à jour de l'utilisateur :", userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    if (userData.account_type != null) {
      const accountTypeText = getAccountTypeText(userData.account_type);
      console.log("✅ Type de compte déterminé :", accountTypeText);
      localStorage.setItem("accountType", accountTypeText);
      setAccountType(accountTypeText);
    } else {
      console.warn("⚠️ Aucun type de compte dans userData");
    }
  };

  const logout = () => {
    console.log("👋 Déconnexion...");
    localStorage.removeItem("user");
    localStorage.removeItem("accountType");
    setUser(null);
    setAccountType(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        accountType,
        setUser: updateUser,
        logout,
        isAuthenticated: !!user,
        setAccountType, 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
