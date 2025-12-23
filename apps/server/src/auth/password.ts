import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

type ScryptStoredHash = {
  algorithm: 'scrypt';
  saltHex: string;
  hashHex: string;
};

function parseStoredHash(stored: string): ScryptStoredHash | null {
  const [algorithm, saltHex, hashHex, ...rest] = stored.split('$');
  if (rest.length > 0) return null;
  if (algorithm !== 'scrypt') return null;
  if (!saltHex || !hashHex) return null;
  return { algorithm: 'scrypt', saltHex, hashHex };
}

export async function hashPassword(password: string) {
  const saltHex = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, saltHex, 64)) as Buffer;
  return `scrypt$${saltHex}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const parsed = parseStoredHash(storedHash);
  if (!parsed) return false;

  const expected = Buffer.from(parsed.hashHex, 'hex');
  const actual = (await scrypt(password, parsed.saltHex, expected.length)) as Buffer;

  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

