import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion"; // Importez motion et AnimatePresence

const fieldsByAccountType = {
  "1": ["companyName", "referentName", "referentFirstName"], // Entreprise privée
  "2": ["companyName", "referentName", "referentFirstName"], // Groupe d'entreprise
  "4": ["institutionName"],
  "5": ["associationName"],
  "6": ["companyName", "referentName", "referentFirstName"], // Zone franche
  "7": ["companyName", "referentName", "referentFirstName"], // Autres
  "8": ["partName", "partFirstName"], // Particulier
  "9": ["companyName", "referentName", "referentFirstName"], // Centre de formation
};

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [referentName, setReferentName] = useState("");
  const [referentFirstName, setReferentFirstName] = useState("");
  const [partName, setPartName] = useState("");
  const [partFirstName, setPartFirstName] = useState("");
  const [associationName, setAssociationName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const resetForm = () => {
    setEmail("");
    setAccountType("");
    setCompanyName("");
    setReferentName("");
    setReferentFirstName("");
    setPartName("");
    setPartFirstName("");
    setAssociationName("");
    setInstitutionName("");
    setPassword("");
    setPasswordConfirmation("");
    // Ne réinitialisez pas error/success ici si vous voulez les afficher avant la redirection
    // setError(null);
    // setSuccess(null);
  };

  const handleInputChange = (setter) => (event) => setter(event.target.value);

  // Récupérer champs visibles selon le type de compte
  const visibleFields = fieldsByAccountType[accountType] || [];
  const formVisible = accountType !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Toujours réinitialiser l'erreur au début de la soumission
    setSuccess(null); // Toujours réinitialiser le succès au début de la soumission
    setIsLoading(true);

    if (!email) {
      setError("L'adresse email est requise.");
      setIsLoading(false);
      return;
    }
    if (!accountType) {
      setError("Le type de compte est requis.");
      setIsLoading(false);
      return;
    }
    if (!password || !passwordConfirmation) {
      setError("Le mot de passe et sa confirmation sont requis.");
      setIsLoading(false);
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    // Préparer les données dynamiques
    const data = {
      customer_email: email,
      account_type: accountType,
      customer_name:
        companyName ||
        associationName ||
        institutionName ||
        partName ||
        "", // champ principal selon type
      referent_name:
        referentName || partName || "", // référent ou particulier nom
      referent_firstname:
        referentFirstName || partFirstName || "", // prénom référent ou particulier
      password,
      password_confirmation: passwordConfirmation,
    };

    try {
      const response = await api.post("/register", data);

      if (response.data.status === 200) {
        // Définir le message de succès
        setSuccess("Votre compte a été créé avec succès ! Vous allez être redirigé vers la page de connexion.");
        // Réinitialiser le formulaire ET rediriger APRÈS un délai
        setTimeout(() => {
          resetForm(); // <-- MAINTENANT ICI
          navigate("/login", { state: { email: email, registrationSuccess: true } }); // Redirection vers la page de connexion
        }, 3000); // Redirection après 3 secondes
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      if (typeof errorMessage === "object") {
        setError(Object.values(errorMessage).flat().join(", "));
      } else if (errorMessage?.includes("SQLSTATE")) {
        setError("Erreur serveur, veuillez contacter l'administrateur.");
      } else {
        setError(errorMessage || "Erreur lors de l'inscription");
      }
      console.error("Erreur:", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-100 px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-6xl">
        <div className="flex flex-col xl:flex-row bg-[#f1f1f4] rounded-2xl shadow-md overflow-hidden">
          {/* Partie gauche (logo + titre) */}
          <div className="w-full xl:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="flex flex-col items-center xl:items-start">
              <img
                src={`${import.meta.env.BASE_URL}Logo_mark.svg`}
                alt="Logo"
                className="w-24 h-24 lg:w-20 lg:h-20 mb-4"
              />
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#A462A4] text-center xl:text-left">
                Inscrivez-vous
              </h1>
            </div>

            <div className="mt-4 w-full">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded bg-gray-50"
              />
              {location.state?.email && (
                <p className="text-sm text-gray-500 mt-1">
                  Email récupéré depuis votre saisie précédente
                </p>
              )}
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="text-[#a462a4] underline text-base hover:text-[#8a3b8e] transition duration-300"
              >
                J'ai déjà un compte
              </Link>
            </div>
          </div>

          {/* Partie droite (formulaire dynamique) */}
          <div className="w-full xl:w-1/2 p-8 lg:p-12 bg-white">
            <p className="text-xl font-bold text-[#333] mb-6">
              Êtes-vous nouveau par ici ? Renseignez vos informations
            </p>

            {/* Type de compte */}
            <label
              htmlFor="account-type"
              className="text-gray-700 font-semibold mb-2 block"
            >
              Type de compte
            </label>
            <select
              name="account_type"
              id="account-type"
              value={accountType}
              onChange={handleInputChange(setAccountType)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:border-[#A462A4] focus:ring-2 focus:ring-[#A462A4]/30 transition duration-200"
            >
              <option disabled value="">
                -- veuillez choisir votre type de compte --
              </option>
              <option value="7">Autres</option>
              <option value="9">Centre de formation</option>
              <option value="1">Entreprise privée</option>
              <option value="2">Groupe d'entreprise</option>
              <option value="4">Institution publique</option>
              <option value="5">ONG ou Association</option>
              <option value="8">Particulier</option>
              <option value="6">Zone franche et entreprise spéciale</option>
            </select>

            {/* Champs dynamiques */}
            {formVisible && (
              <>
                {/* Champs CompanyName, ReferentName, ReferentFirstName */}
                {visibleFields.includes("companyName") && (
                  <div className="mt-4">
                    <label>Raison sociale</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={handleInputChange(setCompanyName)}
                      placeholder="Nom de votre entreprise"
                      required
                      className="mt-2 w-full px-4 py-3 border rounded-lg"
                    />
                  </div>
                )}
                {visibleFields.includes("referentName") && (
                  <div className="mt-4">
                    <label>Nom du responsable</label>
                    <input
                      type="text"
                      value={referentName}
                      onChange={handleInputChange(setReferentName)}
                      required
                      className="mt-2 w-full px-4 py-3 border rounded-lg"
                    />
                  </div>
                )}
                {visibleFields.includes("referentFirstName") && (
                  <div className="mt-4">
                    <label>Prénom du responsable</label>
                    <input
                      type="text"
                      value={referentFirstName}
                      onChange={handleInputChange(setReferentFirstName)}
                      required
                      className="mt-2 w-full px-4 py-3 border rounded-lg"
                    />
                  </div>
                )}

                {/* Champs Particulier */}
                {visibleFields.includes("partName") && (
                  <div className="mt-4">
                    <label>Nom</label>
                    <input
                      type="text"
                      value={partName}
                      onChange={handleInputChange(setPartName)}
                      required
                      className="mt-2 w-full px-4 py-3 border rounded-lg"
                    />
                  </div>
                )}
                {visibleFields.includes("partFirstName") && (
                  <div className="mt-4">
                    <label>Prénoms</label>
                    <input
                      type="text"
                      value={partFirstName}
                      onChange={handleInputChange(setPartFirstName)}
                      required
                      className="mt-2 w-full px-4 py-3 border rounded-lg"
                    />
                  </div>
                )}

                {/* Champs Association */}
                {visibleFields.includes("associationName") && (
                  <div className="mt-4">
                    <label>Nom de l'Association</label>
                    <input
                      type="text"
                      value={associationName}
                      onChange={handleInputChange(setAssociationName)}
                      required
                      className="mt-2 w-full px-4 py-3 border rounded-lg"
                    />
                  </div>
                )}

                {/* Champs Institution */}
                {visibleFields.includes("institutionName") && (
                  <div className="mt-4">
                    <label>Nom de l'Institution</label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={handleInputChange(setInstitutionName)}
                      required
                      className="mt-2 w-full px-4 py-3 border rounded-lg"
                    />
                  </div>
                )}
              </>
            )}

            {/* Champs communs pour mot de passe */}
            <div className="mt-4">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={handleInputChange(setPassword)}
                required
                className="mt-2 w-full px-4 py-3 border rounded-lg"
              />
            </div>
            <div className="mt-4">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={handleInputChange(setPasswordConfirmation)}
                required
                className="mt-2 w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* Affichage des erreurs ou succès avec animation */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error-message" // Ajout d'une clé pour AnimatePresence
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 text-red-600 font-semibold text-center"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  key="success-message" // Ajout d'une clé pour AnimatePresence
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mt-4 text-green-600 font-semibold text-center"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full py-3 bg-[#a462a4] text-white font-bold rounded-lg hover:bg-[#8a3b8e] transition duration-300 disabled:opacity-50"
            >
              {isLoading ? "Chargement..." : "S'inscrire"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;