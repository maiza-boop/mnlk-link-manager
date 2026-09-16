export const SHORT_DOMAIN = "mnlk.com.br";

const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateShortCode(length = 5): string {
  let out = "";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

export const RESERVED_CODES = new Set([
  "auth",
  "dashboard",
  "api",
  "login",
  "signup",
  "reset-password",
  "assets",
  "favicon",
  "robots",
  "admin",
  "app",
  "sobre",
  "planos",
]);

export function normalizeUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function isValidAlias(alias: string): boolean {
  return /^[a-zA-Z0-9_-]{3,32}$/.test(alias) && !RESERVED_CODES.has(alias.toLowerCase());
}

export function shortUrl(code: string): string {
  return `https://${SHORT_DOMAIN}/${code}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
