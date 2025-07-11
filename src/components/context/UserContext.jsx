import React, { createContext, useState, useEffect } from "react";

// Création du contexte
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [setting, setSetting] = useState(null);

  // 🔧 Fonction utilitaire pour transformer le type de compte
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

  // ✅ Chargement depuis localStorage au premier rendu
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAccountType = localStorage.getItem("accountType");
    const storedSetting = localStorage.getItem("setting");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("👤 Utilisateur localStorage :", parsedUser);
        setUser(parsedUser);

        if (!storedAccountType && parsedUser?.account_type) {
          const accountTypeText = getAccountTypeText(parsedUser.account_type);
          localStorage.setItem("accountType", accountTypeText);
          setAccountType(accountTypeText);
        } else if (storedAccountType) {
          setAccountType(storedAccountType);
        }
      } catch (error) {
        console.error("❌ Erreur parsing user :", error);
        localStorage.removeItem("user");
      }
    } else {
      setUser(null);
      setAccountType(null);
    }

    if (storedSetting) {
      try {
        const parsedSetting = JSON.parse(storedSetting);
        console.log("⚙️ Paramètres setting depuis localStorage :", parsedSetting);
        setSetting(parsedSetting);
      } catch (error) {
        console.error("❌ Erreur parsing setting :", error);
      }
    }
  }, []);

  // ✅ Fonction de mise à jour à partir de la réponse API
  const updateUser = (userData, settingData = null, token = null) => {
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

    if (settingData) {
      console.log("⚙️ Mise à jour des paramètres setting :", settingData);
      localStorage.setItem("setting", JSON.stringify(settingData));
      setSetting(settingData);
    }

    if (token) {
      console.log("🔑 Token reçu :", token);
      localStorage.setItem("token", token);
    }
  };

  // ✅ Déconnexion
  const logout = () => {
    console.log("👋 Déconnexion...");
    localStorage.removeItem("user");
    localStorage.removeItem("accountType");
    localStorage.removeItem("setting");
    localStorage.removeItem("token");
    setUser(null);
    setAccountType(null);
    setSetting(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        accountType,
        setting,
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
