const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DISPLAY_DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

function isValidDateParts(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function formatIsoDateToDisplay(value: string) {
  if (!ISO_DATE_REGEX.test(value)) {
    return value;
  }

  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function formatDisplayDateForInput(value: string) {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 8);

  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }

  if (digitsOnly.length <= 4) {
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  }

  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`;
}

export function parseDisplayDateToIso(value: string) {
  if (!DISPLAY_DATE_REGEX.test(value)) {
    return value;
  }

  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

export function isSupportedBirthDate(value: string) {
  if (ISO_DATE_REGEX.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return isValidDateParts(year, month, day);
  }

  if (DISPLAY_DATE_REGEX.test(value)) {
    const [day, month, year] = value.split('/').map(Number);
    return isValidDateParts(year, month, day);
  }

  return false;
}
