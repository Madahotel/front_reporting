import React from 'react';

const Footer = () => {
  return (
    <footer className="bottom-0 w-full bg-white border-t border-gray-100">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center space-x-6 text-xs text-gray-500">
          <a href="#" className="transition-colors hover:text-gray-900">Aide</a>
          <a href="#" className="transition-colors hover:text-gray-900">Contact</a>
          <a href="#" className="transition-colors hover:text-gray-900">Sécurité</a>
          <a href="#" className="transition-colors hover:text-gray-900">Respect de la vie privée</a>
          <a href="#" className="transition-colors hover:text-gray-900">Contrat d'utilisations</a>
          <a href="#" className="transition-colors hover:text-gray-900">Mentions Légales</a>
        </nav>

        <p className="mt-4 text-xs text-center text-gray-400">
          © 2025 FormaFusion. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
