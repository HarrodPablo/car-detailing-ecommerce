const generateWhatsAppLink = (phoneNumber, message) => {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

module.exports = {
  generateWhatsAppLink
};
