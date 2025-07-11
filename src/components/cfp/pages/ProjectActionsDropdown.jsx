import { useState, useRef, useEffect } from "react";
import { FaCog } from "react-icons/fa";

function ProjectActionsDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le menu si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Paramètres du projet"
        className="p-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
      >
        <FaCog className="w-5 h-5" />
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 w-56 z-10 p-2 animate-fade-in">
          <li>
            <a href="#" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition">
              Supprimer
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition">
              Dupliquer
            </a>
          </li>
          <li className="menu-title text-xs uppercase tracking-wide text-gray-400 mt-2 px-2">
            Statut
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition">
              Reporter
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition">
              Clôturer
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}

export default ProjectActionsDropdown;
