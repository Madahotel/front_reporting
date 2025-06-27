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
            className="relative bg-white dark:bg-gray-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50 mb-4"
              >
                <svg
                  className="h-6 w-6 text-purple-600 dark:text-purple-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </motion.div>

              <motion.h3
                id="logout-modal-title"
                className="text-xl font-semibold text-center text-gray-900 dark:text-gray mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {t("table_headers.confirm_logout", "Confirmer la déconnexion")}
              </motion.h3>

              <motion.p
                className="text-sm text-center text-gray-500 dark:text-gray-800 mb-6"
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
                    scale: 1.03,
                    backgroundColor: "#f3f4f6",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className="cursor-pointer px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-800 dark:border-gray-600 transition-colors flex-1 max-w-[140px] text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {t("table_headers.cancel", "Annuler")}
                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.03,
                    backgroundColor: "#7c3aed",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="cursor-pointer px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex-1 max-w-[140px] text-sm font-medium shadow-sm"
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