/** Letters (incl. accented), spaces, hyphens, apostrophes — no digits. */
const NAME_PATTERN = /^[\p{L}\s'-]+$/u;

export function sanitizeNameInput(value) {
  if (!value || typeof value !== "string") return "";
  return value.replace(/[^\p{L}\s'-]/gu, "");
}

export function isValidName(name) {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 50) return false;
  return NAME_PATTERN.test(trimmed);
}

export function normalizeName(name) {
  if (!name || typeof name !== "string") return "";
  return name.trim().replace(/\s+/g, " ");
}
