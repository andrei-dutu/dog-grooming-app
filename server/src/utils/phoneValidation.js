/** Allowed formatting characters; digits required when phone is provided. */
const PHONE_PATTERN = /^[\d+\s().-]+$/;

export function sanitizePhoneInput(value) {
  if (!value || typeof value !== "string") return "";
  return value.replace(/[^\d+\s().-]/g, "");
}

export function isValidPhone(phone) {
  if (!phone || typeof phone !== "string" || !phone.trim()) return true;

  const trimmed = phone.trim();
  if (!PHONE_PATTERN.test(trimmed)) return false;

  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function normalizePhone(phone) {
  if (!phone || typeof phone !== "string") return null;
  const trimmed = sanitizePhoneInput(phone.trim());
  return trimmed || null;
}
