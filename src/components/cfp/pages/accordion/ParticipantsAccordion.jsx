import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaChevronDown,
  FaPen,
  FaUserGraduate,
  FaChalkboard,
  FaChartSimple,
} from "react-icons/fa6";

function ParticipantsAccordion({ participantsData }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleAccordion = () => setIsOpen(!isOpen);

  const accordionVariants = {
    open: { height: "auto", opacity: 1 },
    collapsed: { height: 0, opacity: 0 },
  };

  // Extraction des données
  const apprenants = participantsData?.liste_complete_apprenants || [];
  const nombre_participants = participantsData?.total_apprenants || 0;

  return (
    <motion.div className="card bg-white shadow-lg rounded-xl border border-gray-200">
      {/* En-tête (inchangé) */}
      <h2
        className="px-6 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer select-none"
        onClick={toggleAccordion}
      >
        <span className="inline-flex items-center text-xl font-semibold text-gray-800">
          <FaUsers className="mr-3 text-blue-600" />
          <span>{nombre_participants} Participants</span>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className="text-gray-500 text-xl" />
        </motion.div>
      </h2>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={accordionVariants}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {/* Dropdown (inchangé) */}
              <div className="flex justify-end mb-4">
                {/* ... votre dropdown existant ... */}
              </div>

              {/* Table des participants adaptée */}
              {apprenants.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="table w-full text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                          Nom
                        </th>
                        <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                          Photo
                        </th>
                        <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                          Entreprise
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {apprenants.map((apprenant) => (
                        <tr
                          key={apprenant.idEmploye}
                          className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="py-2.5 px-4 text-gray-800">
                            {apprenant.emp_firstname} {apprenant.emp_name}
                          </td>
                          <td className="py-2.5 px-4">
                            {apprenant.emp_photo && (
                              <img
                                src={`https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/employes/${apprenant.emp_photo}`}
                                alt={`${apprenant.emp_firstname} ${apprenant.emp_name}`}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-gray-600 text-sm">
                            {apprenant.etp_name || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 italic">
                  Aucun apprenant enregistré pour ce projet.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
export default ParticipantsAccordion;
