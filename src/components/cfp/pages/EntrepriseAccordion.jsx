import { motion, AnimatePresence } from "framer-motion";
import {
  FaBuilding, FaChevronDown, FaPen, FaEnvelope, FaEye
} from "react-icons/fa6";

function EntrepriseAccordion({
  projet,
  isOpen,
  toggleAccordion,
  accordionVariants,
  itemVariants,
  getEtpLogoUrl
}) {
  return (
    <motion.div className="card bg-white shadow-lg rounded-xl border border-gray-200" variants={itemVariants}>
      <h2
        className="px-6 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer select-none"
        onClick={() => toggleAccordion('entreprise')}
      >
        <span className="inline-flex items-center text-xl font-semibold text-gray-800">
          <FaBuilding className="mr-3 text-purple-600" />
          Entreprise Associée
        </span>
        <motion.div
          initial={false}
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
            className="overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-end mb-4">
                <button className="btn btn-sm btn-outline btn-primary">
                  <FaPen className="mr-1" /> Editer
                </button>
              </div>

              {projet?.etp_name ? (
                <div className="overflow-x-auto">
                  <table className="table w-full text-left">
                    <tbody>
                      <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-gray-50 flex items-center justify-center">
                                <img
                                  src={getEtpLogoUrl(projet.etp_logo)}
                                  className="object-contain w-full h-full p-2"
                                  alt={projet.etp_name || 'Logo Entreprise'}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-lg text-gray-800 uppercase">{projet.etp_name}</div>
                              <div className="text-sm text-slate-500 flex items-center">
                                <FaEnvelope className="mr-1" /> {projet.etp_email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <button aria-label="Voir les détails de l'entreprise" className="btn btn-ghost btn-sm text-gray-500 hover:text-blue-500 transition-colors duration-200">
                            <FaEye className="text-lg" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 italic">Aucune entreprise associée à ce projet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default EntrepriseAccordion;
