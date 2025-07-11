export const formatMontant = (montant, currency = "XOF") => {
  const montantNum = Number(montant); // force conversion
  if (isNaN(montantNum)) return "—"; // évite NaN

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(montantNum);
};
