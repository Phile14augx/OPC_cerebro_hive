import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32
let lastTime = 0;
let seq = 0;

/** ULID-compatible sortable identifier (time-ordered, no deps). */
export function newId(prefix?: string): string {
  let now = Date.now();
  if (now === lastTime) seq += 1; else { lastTime = now; seq = 0; }
  let time = now;
  let timePart = "";
  for (let i = 0; i < 10; i++) { timePart = ALPHABET[time % 32] + timePart; time = Math.floor(time / 32); }
  const rand = randomBytes(10);
  rand[0] = (rand[0]! + seq) & 0xff;
  let randPart = "";
  for (let i = 0; i < 16; i++) {
    const idx = i < 10 ? rand[i]! % 32 : Math.floor(Math.random() * 32);
    randPart += ALPHABET[idx];
  }
  const ulid = timePart + randPart;
  return prefix ? `${prefix}_${ulid}` : ulid;
}

export function idTime(id: string): number {
  const raw = id.includes("_") ? id.split("_")[1]! : id;
  let t = 0;
  for (let i = 0; i < 10; i++) t = t * 32 + ALPHABET.indexOf(raw[i]!);
  return t;
}
