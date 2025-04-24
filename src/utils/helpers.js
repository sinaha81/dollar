// Helper functions

export const convertToToman = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return "N/A"; // Return N/A or some indicator for invalid input
  }
  return price / 10;
};

export const formatPrice = (price) => {
  if (price === "erorr" || typeof price !== 'number' || isNaN(price)) {
    return price; // Return 'erorr' or original invalid input
  }
  // Format to locale string with options for better readability if needed
  return Number(price).toLocaleString(undefined, {
    // minimumFractionDigits: 0, // Example options
    // maximumFractionDigits: 2,
  });
};

export const getPersianDate = () => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date());
}; 