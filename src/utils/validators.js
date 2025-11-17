// Validadores simples reutilizables
export function isEmail(value) {
  if (!value) return false;
  // regex simple y práctica
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  return re.test(value.trim());
}

export function isPasswordValid(value, minLength = 6) {
  return typeof value === 'string' && value.length >= minLength;
}

export function isRutValid(value) {
  if (!value) return false;
  // Normalizar: eliminar puntos y guiones
  const s = String(value).replace(/\./g, '').replace(/-/g, '').toUpperCase().trim();
  if (!/^[0-9]+[0-9K]$/.test(s)) return false;
  const body = s.slice(0, -1);
  const dv = s.slice(-1);

  // Calcular dígito verificador mod 11
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const remainder = 11 - (sum % 11);
  const computed = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  return computed === dv;
}

export default { isEmail, isPasswordValid, isRutValid };
