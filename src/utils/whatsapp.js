export const buildWaUrl = (phoneNumber) => {
  let phone = phoneNumber.replace(/\D/g, '');
  if (phone.length === 10) phone = `91${phone}`;
  else if (phone.length > 10 && phone.startsWith('0')) phone = `91${phone.substring(1)}`;
  return `https://api.whatsapp.com/send?phone=${phone}`;
};
