/**
 * NOT SECURITY. A tiny non-cryptographic hash (cyrb53) so the demo never keeps
 * typed passwords in localStorage as plain text. Anyone with access to the
 * browser can still tamper with the demo data — real authentication must be
 * implemented on a server.
 */
export const DEMO_PASSWORD = "agromo2026";

function cyrb53(input: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function demoHash(email: string, password: string): string {
  return `demo$${cyrb53(`${email.trim().toLowerCase()}|${password}`).toString(16)}`;
}
