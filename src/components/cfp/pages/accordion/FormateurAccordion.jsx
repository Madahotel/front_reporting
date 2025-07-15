import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChalkboardTeacher, FaChevronDown } from "react-icons/fa";

function FormateursAccordion({ formateursData }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleAccordion = () => setIsOpen(!isOpen);

  const accordionVariants = {
    open: { height: "auto", opacity: 1 },
    collapsed: { height: 0, opacity: 0 },
  };

  const formateurs = formateursData || [];

  return (
    <motion.div className="card bg-white shadow-lg rounded-xl border border-gray-200 mt-6">
      <h2
        className="px-6 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer select-none"
        onClick={toggleAccordion}
      >
        <span className="inline-flex items-center text-xl font-semibold text-gray-800">
          <FaChalkboardTeacher className="mr-3 text-green-600" />
          <span>{formateurs.length} Formateur(s)</span>
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
              {formateurs.length > 0 ? (
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
                          Centre
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formateurs.map((formateur) => (
                        <tr key={formateur.idFormateur}>
                          <td className="py-2.5 px-4 text-gray-800">
                            {formateur.form_firstname} {formateur.form_name}
                          </td>
                          <td className="py-2.5 px-4">
                            {formateur.form_photo && (
<img
      src={`https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/formateurs/${formateur.form_photo}`}
      alt={`${formateur.form_firstname} ${formateur.form_name}`}
      className="w-8 h-8 rounded-full object-cover"
    />
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-gray-600 text-sm">
                            {/* Remplacer si tu as un champ type centre */}
                            {formateur.centre_name || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 italic">
                  Aucun formateur enregistré pour ce projet.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default FormateursAccordion;
