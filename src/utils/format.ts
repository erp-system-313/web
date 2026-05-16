export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 12 && digits.startsWith('20')) {
    return `+20 ${digits.slice(2, 4)} ${digits.slice(4)}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+20 ${digits.slice(1, 3)} ${digits.slice(3)}`;
  }
  if (digits.length === 10) {
    return `+20 ${digits.slice(0, 2)} ${digits.slice(2)}`;
  }
  return phone;
};
