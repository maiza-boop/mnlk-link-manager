export const SHORT_DOMAIN = "mnlk.com.br";

export function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!parsed.hostname.includes(".") && parsed.hostname !== "localhost") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function generateShortCode(length = 6): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const values = new Uint32Array(length);

  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(values);
  } else {
    for (let index = 0; index < length; index += 1) {
      values[index] = Math.floor(Math.random() * alphabet.length);
    }
  }

  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

export function normalizeAlias(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
}
