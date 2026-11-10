import { requirements, type Profile } from "../types";
export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`dare-${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function writeStored(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(`dare-${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function loadShortlist(): string[] {
  const x = readStored<unknown>("shortlist", []);
  return Array.isArray(x) ? x.filter((v) => typeof v === "string") : [];
}
export function saveShortlist(ids: string[]) {
  return writeStored("shortlist", ids);
}
export function loadProfile(): Profile {
  const p = readStored<Profile | null>("profile", null);
  return p &&
    Array.isArray(p.requirements) &&
    p.requirements.every((k) => Object.hasOwn(requirements, k)) &&
    typeof p.strict === "boolean" &&
    typeof p.independent === "boolean"
    ? {
        requirements: [...new Set(p.requirements)],
        strict: p.strict,
        independent: p.independent,
      }
    : { requirements: [], strict: true, independent: false };
}
