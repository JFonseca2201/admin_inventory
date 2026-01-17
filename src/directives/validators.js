// =========================
// VALIDACIÓN DE CÉDULA
// =========================
export function validateCedula(cedula) {
  if (!cedula || cedula.length !== 10) return false;

  const province = parseInt(cedula.substring(0, 2), 10);
  if (province < 1 || province > 24) return false;

  const third = parseInt(cedula[2], 10);
  if (third >= 6) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(cedula[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  const verifier = (10 - (sum % 10)) % 10;
  return verifier === parseInt(cedula[9], 10);
}

// =========================
// VALIDACIÓN DE RUC ECUATORIANO
// =========================
export function validateRuc(ruc) {
  if (!ruc || ruc.length !== 13) return false;
  const cedula = ruc.substring(0, 10);

  const third = parseInt(ruc[2], 10);

  if (third < 6) {
    if (!validateCedula(cedula)) return false;
    return ruc.substring(10) === "001";
  }

  if (third === 6) {
    const coef = [3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < coef.length; i++) {
      sum += parseInt(ruc[i], 10) * coef[i];
    }

    const verifier = 11 - (sum % 11);
    const check = verifier === 11 ? 0 : verifier;

    return check === parseInt(ruc[8], 10) && ruc.substring(9) === "0001";
  }

  if (third === 9) {
    const coef = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < coef.length; i++) {
      sum += parseInt(ruc[i], 10) * coef[i];
    }

    const verifier = 11 - (sum % 11);
    const check = verifier === 11 ? 0 : verifier;

    return check === parseInt(ruc[9], 10) && ruc.substring(10) === "001";
  }

  return false;
}

// =========================
// VALIDACIÓN SOLO PLACA MODERNA (ABC-1234)
// =========================
export function validatePlate(plate) {
  if (!plate) return false;
  const regex = /^[A-Z]{3}-\d{4}$/;
  return regex.test(plate.toUpperCase());
}

// =========================
// FORMATEADOR A ABC-1234
// =========================
export function formatPlate(value) {
  if (!value) return "";

  value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  const letters = value.substring(0, 3);
  const numbers = value.substring(3, 7);

  if (value.length <= 3) return letters;

  return `${letters}-${numbers}`;
}

// =========================
// EXPORTACIÓN GLOBAL
// =========================
export default {
  validateCedula,
  validateRuc,
  validatePlate,
  formatPlate,
};
