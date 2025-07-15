import React, { useState, useEffect, useRef } from "react";

const HeaderWithBeta = () => {
  const [showMessage, setShowMessage] = useState(false);
  const messageRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (messageRef.current && !messageRef.current.contains(event.target)) {
        setShowMessage(false);
      }
    };

    if (showMessage) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMessage]);

  return (
    <div className="relative flex items-center gap-1" ref={messageRef}>
      <p className="text-2xl font-semibold text-gray-700">Reporting</p>

      <span
        onClick={() => setShowMessage((prev) => !prev)}
        className="cursor-pointer text-sm px-2 py-0.5 bg-green-500 text-white rounded-full border border-gray-300"
      >
        Beta
      </span>

      {showMessage && (
        <div className="absolute top-full mt-2 w-72 bg-white text-sm text-gray-700 p-4 rounded shadow-lg border z-10">
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
  );
};

export default HeaderWithBeta;
