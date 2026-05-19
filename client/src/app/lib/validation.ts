/** Matches server emailValidation.js */
export function normalizeEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  if (normalized.length === 0 || normalized.length > 254) return false;

  const atIndex = normalized.indexOf('@');
  if (atIndex <= 0 || atIndex !== normalized.lastIndexOf('@')) return false;

  const local = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);

  if (local.length > 64 || domain.length > 253) return false;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return false;
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false;
  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) return false;

  const labels = domain.split('.');
  if (labels.length < 2) return false;

  for (const label of labels) {
    if (label.length === 0 || label.startsWith('-') || label.endsWith('-')) return false;
  }

  const tld = labels[labels.length - 1];
  if (!/^[a-zA-Z]{2,}$/.test(tld)) return false;

  return true;
}
