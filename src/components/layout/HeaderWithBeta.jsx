import React, { useState } from "react";

const HeaderWithBeta = () => {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div className="relative flex items-center gap-1">
      <p className="text-2xl font-semibold text-gray-700">Reporting</p>

      {/* Conteneur parent pour l'étiquette Beta et le message */}
      {/* Les événements onMouseEnter et onMouseLeave sont sur ce conteneur */}
      <div
        onMouseEnter={() => setShowMessage(true)} // Affiche le message au survol du conteneur
        onMouseLeave={() => setShowMessage(false)} // Masque le message lorsque la souris quitte le conteneur
        className="relative" // Nécessaire pour le positionnement absolu du message
      >
        <span
          className="cursor-pointer text-sm px-2 py-0.5 bg-green-500 text-white rounded-full border border-gray-300"
          aria-describedby="beta-tooltip" // Pour l'accessibilité
        >
          Beta
        </span>

        {/* Le message s'affiche ou se masque en fonction de l'état showMessage */}
        {showMessage && (
          <div
            id="beta-tooltip" // ID pour l'accessibilité
            role="tooltip" // Rôle pour l'accessibilité
            // Positionnement absolu : centré horizontalement sous l'étiquette
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white text-sm text-gray-700 p-4 rounded shadow-lg border z-10 animate-fade-in"
            style={{ opacity: 0, animation: 'fadeIn 0.2s forwards' }} // Animation CSS simple
          >
            <p className="font-semibold mb-1">
              🚧 La plateforme est en BETA ouverte !
            </p>
            <p>
              Nous travaillons activement pour l'améliorer, et vos retours sont
              essentiels. 💬{" "}
              <span
                onClick={() =>
                  window.open("https://forma-fusion.com/contact", "_blank")
                }
                className="text-purple-600 underline cursor-pointer"
              >
                Contactez-nous ici
              </span>
              .
            </p>
          </div>
        )}
      </div>

      {/* Styles CSS pour l'animation de fondu */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s forwards;
        }
      `}</style>
    </div>
  );
};

export default HeaderWithBeta;
