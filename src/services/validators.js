export function isEmail(value) {
  if (!value) return false;
  const v = String(value).trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(v);
}

export function isPasswordValid(value) {
  if (!value) return false;
  return String(value).length >= 6;
}

// Validador básico de RUT chileno con cálculo de dígito verificador
export function isRutValid(value) {
  if (!value) return false;
  const raw = String(value).replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
  const parts = raw.split('-');
  if (parts.length !== 2) return false;
  const num = parts[0];
  const dv = parts[1];
  if (!/^[0-9]+$/.test(num)) return false;

  // Cálculo Módulo 11
  let sum = 0;
  let mul = 2;
  for (let i = num.length - 1; i >= 0; i--) {
    sum += parseInt(num.charAt(i), 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const expected = res === 11 ? '0' : res === 10 ? 'K' : String(res);
  return expected === dv;
}

export default { isEmail, isPasswordValid, isRutValid };
