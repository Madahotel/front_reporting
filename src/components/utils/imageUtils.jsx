/**
 * Génère une URL complète pour une image
 * @param {string|null} photoPath - Chemin/nom du fichier image (par exemple: 'nom_de_l_image.webp')
 * @param {object} options - Options de configuration
 * @param {string} [options.defaultImage='placeholder.webp'] - Nom de fichier de l'image par défaut (relatif à basePath si non absolu)
 * @param {string} [options.basePath] - Chemin de base personnalisé (par exemple, pour d'autres dossiers d'images)
 * @returns {string} URL complète de l'image
 */
export const getPhotoUrl = (photoPath, options = {}) => {
  const {
    // Le nom du fichier de l'image de remplacement pour les modules,
    // qui sera combiné avec le basePath par défaut si photoPath est invalide.
    defaultImage = 'placeholder.webp', // <--- Assurez-vous que 'placeholder.webp' est bien le nom du fichier de votre image par défaut dans le dossier /img/modules/
    
    // Chemin de base par défaut pour les images de modules sur DigitalOcean
    basePath = import.meta.env.MODE === 'development'
      ? 'https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/modules/'
      : 'https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/modules/'
  } = options;

  // Si aucun chemin de photo n'est fourni ou n'est pas une chaîne valide
  if (!photoPath || typeof photoPath !== 'string') {
    // Si l'image par défaut n'est pas déjà une URL absolue, construisez-la avec le basePath.
    // Cela gère le cas où defaultImage est juste un nom de fichier comme 'placeholder.webp'.
    if (!/^https?:\/\//i.test(defaultImage)) {
      return `${basePath}${defaultImage}`;
    }
    return defaultImage; // Si defaultImage est déjà une URL absolue, retournez-la telle quelle.
  }

  const cleanPath = photoPath.trim();

  // Vérification de sécurité : empêche les attaques par "directory traversal" (ex: ../../secret.txt)
  // ou les chemins absolus locaux indésirables (ex: /usr/local/image.png)
  if (cleanPath.includes('..') || cleanPath.startsWith('/') || cleanPath.startsWith('\\')) {
    console.error('Chemin de fichier non sécurisé détecté:', cleanPath);
    // Retourne l'URL complète de l'image par défaut si le chemin fourni est non sécurisé.
    if (!/^https?:\/\//i.test(defaultImage)) {
        return `${basePath}${defaultImage}`;
    }
    return defaultImage;
  }

  // Si le chemin fourni est déjà une URL absolue (par exemple, de Google Images ou un autre CDN)
  if (/^https?:\/\//i.test(cleanPath)) {
    return cleanPath; // Retournez cette URL absolue telle quelle.
  }

  // Si le chemin est un chemin relatif (juste le nom du fichier comme 'image.jpg'),
  // construisez l'URL finale en combinant le basePath et le chemin propre.
  return `${basePath}${cleanPath}`;
};

/**
 * Vérifie si une image existe à l'URL donnée
 * @param {string} url - URL de l'image à vérifier
 * @returns {Promise<boolean>}
 */
export const checkImageExists = async (url) => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' }); // Utilise HEAD pour ne pas télécharger tout le contenu
    return response.ok; // true si le statut est 2xx
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'image:', error);
    return false; // En cas d'erreur réseau ou autre
  }
};

/**
 * Précharge une image en arrière-plan
 * @param {string} url - URL de l'image à précharger
 * @returns {Promise<void>} Une promesse qui se résout quand l'image est chargée ou rejette en cas d'erreur.
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = resolve; // Résout la promesse quand l'image est chargée
    img.onerror = reject; // Rejette la promesse en cas d'erreur de chargement
  });
};