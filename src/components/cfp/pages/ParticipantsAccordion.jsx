import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers, FaChevronDown, FaPen, FaUserGraduate, FaChalkboard, FaChartSimple
} from "react-icons/fa6";

function ParticipantsAccordion({ apprenants = [], nombre_participants = 0 }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  const accordionVariants = {
    open: { height: "auto", opacity: 1 },
    collapsed: { height: 0, opacity: 0 }
  };

  return (
    <motion.div className="card bg-white shadow-lg rounded-xl border border-gray-200">
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
              {/* Dropdown */}
              <div className="flex justify-end mb-4">
                <div className="dropdown dropdown-bottom dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-sm btn-outline btn-primary">
                    <FaPen className="mr-1" /> Editer
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu bg-white rounded-box z-[1] w-max p-2 shadow-lg border border-gray-100">
                    <li>
                      <a href="#" className="hover:bg-gray-100">
                        <FaUserGraduate className="mr-2" /> Ajouter des apprenants
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:bg-gray-100">
                        <FaChalkboard className="mr-2" /> Emargement
                      </a>
                    </li>
                    <li className="opacity-50 cursor-not-allowed">
                      <span className="pointer-events-none text-gray-400">
                        <FaChartSimple className="mr-2" /> Évaluation (Indisponible)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Table des participants */}
              {apprenants?.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="table w-full text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-gray-600 font-semibold text-sm">Nom</th>
                        <th className="py-3 px-4 text-gray-600 font-semibold text-sm">Email</th>
                        <th className="py-3 px-4 text-gray-600 font-semibold text-sm">Entreprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apprenants.map((apprenant) => (
                        <tr key={apprenant.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                          <td className="py-2.5 px-4 text-gray-800">{apprenant.nom || 'N/A'}</td>
                          <td className="py-2.5 px-4 text-gray-600 text-sm">{apprenant.email || 'N/A'}</td>
                          <td className="py-2.5 px-4 text-gray-600 text-sm">{apprenant.entreprise || 'N/A'}</td>
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
