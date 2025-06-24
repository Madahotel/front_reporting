import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const LogoutConfirmationModal = ({ show, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  const modalRef = React.useRef(null);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
              bounce: 0.2,
            }}
            className="relative bg-white dark:bg-blue-500 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4"
              >
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </motion.div>

              <motion.h3
                id="logout-modal-title"
                className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {t("table_headers.confirm_logout", "Confirmer la déconnexion")}
              </motion.h3>

              <motion.p
                className="text-sm text-center text-gray-600 dark:text-gray-300 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t(
                  "table_headers.you_are_sure",
                  "Êtes-vous sûr de vouloir vous déconnecter ?"
                )}
              </motion.p>

              <motion.div
                className="flex justify-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "##f5f3ff", // Gris clair
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className="cursor-pointer px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-600 transition-colors flex-1 max-w-[120px] text-sm" // Ajout de text-sm ici
                >
                  {t("table_headers.cancel", "Annuler")}
                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "#6d28d9", // Violet plus foncé pour le hover
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="px-5 py-2 rounded-lg bg-purple-600 text-white transition-colors flex-1 max-w-[120px] text-sm cursor-pointer" // Ajout de text-sm ici
                >
                  {t("table_headers.logout", "Se déconnecter")}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutConfirmationModal;
