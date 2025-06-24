export const getPhotoUrl = (photoPath, options = {}) => {
  const {
    defaultImage = "placeholder.webp",
    basePath = import.meta.env.MODE === "development"
      ? "https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/modules/"
      : "https://formafusionmg.ams3.cdn.digitaloceanspaces.com/formafusionmg/img/modules/",
  } = options;

  if (!photoPath || typeof photoPath !== "string") {
    if (!/^https?:\/\//i.test(defaultImage)) {
      return `${basePath}${defaultImage}`;
    }
    return defaultImage;
  }

  const cleanPath = photoPath.trim();

  if (
    cleanPath.includes("..") ||
    cleanPath.startsWith("/") ||
    cleanPath.startsWith("\\")
  ) {
    console.error("Chemin de fichier non sécurisé détecté:", cleanPath);
    if (!/^https?:\/\//i.test(defaultImage)) {
      return `${basePath}${defaultImage}`;
    }
    return defaultImage;
  }

  if (/^https?:\/\//i.test(cleanPath)) {
    return cleanPath;
  }

  return `${basePath}${cleanPath}`;
};

export const checkImageExists = async (url) => {
  if (!url) return false;

  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'image:", error);
    return false;
  }
};

export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = resolve;
    img.onerror = reject;
  });
};
