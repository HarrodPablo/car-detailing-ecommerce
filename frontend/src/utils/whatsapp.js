export const generateWhatsAppLink = (number, message) => {
  // Asegurar formato de número internacional (ej: 54911...)
  const cleanNumber = number.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
};
