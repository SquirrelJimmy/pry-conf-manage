import { createHmac } from 'node:crypto';

function base64UrlEncodeJson(input: unknown) {
  return Buffer.from(JSON.stringify(input)).toString('base64url');
}

function parseExpiresInSeconds(expiresIn: string | undefined) {
  if (!expiresIn) return 60 * 60 * 24 * 7; // 默认 7 天

  const trimmed = expiresIn.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);

  const m = trimmed.match(/^(\d+)([smhd])$/i);
  if (!m) {
    throw new Error(
      `JWT_EXPIRES_IN 格式不合法: "${expiresIn}"，支持如 "3600"、"30m"、"12h"、"7d"`,
    );
  }

  const value = Number(m[1]);
  const unit = m[2].toLowerCase();
  const multiplier =
    unit === 's'
      ? 1
      : unit === 'm'
        ? 60
        : unit === 'h'
          ? 60 * 60
          : 60 * 60 * 24;

  return value * multiplier;
}

export function signJwtHS256(payload: Record<string, unknown>, secret: string, opts?: {
  expiresIn?: string;
}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseExpiresInSeconds(opts?.expiresIn);

  const fullPayload = { ...payload, iat: now, exp };

  const headerPart = base64UrlEncodeJson(header);
  const payloadPart = base64UrlEncodeJson(fullPayload);
  const signingInput = `${headerPart}.${payloadPart}`;

  const signature = createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64url');

  return `${signingInput}.${signature}`;
}

