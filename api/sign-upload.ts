import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const s3 = new S3Client({
  region: 'auto',
  endpoint: requireEnv('R2_ACCOUNT_ID') && `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY')
  }
});

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

// naive in-memory rate limiter (per-IP) — suitable for light student usage
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests/minute per IP
const ipHits: Record<string, { count: number; resetAt: number }> = {};

const getOrigin = (req: VercelRequest): string | undefined => {
  const o = (req.headers.origin || req.headers.referer) as string | undefined;
  if (!o) return undefined;
  try { return new URL(o).origin; } catch { return undefined; }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS with allowlist
  const raw = process.env.CORS_ALLOW_ORIGIN || '*';
  const requestOrigin = getOrigin(req);
  let allow = raw;
  if (raw !== '*') {
    const list = raw.split(',').map(s => s.trim()).filter(Boolean);
    if (requestOrigin && list.includes(requestOrigin)) {
      allow = requestOrigin;
    } else if (list.length > 0) {
      allow = list[0];
    }
  }
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-amz-acl, x-amz-content-sha256');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // rate limit by IP
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = ipHits[ip] || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    if (now > entry.resetAt) {
      entry.count = 0; entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
    }
    entry.count += 1;
    ipHits[ip] = entry;
    if (entry.count > RATE_LIMIT_MAX) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000).toString());
      return res.status(429).json({ error: 'Too Many Requests' });
    }

    // Basic auth guard: require role header and secret
    const role = req.headers['x-comite-role'];
    const secret = req.headers['x-comite-secret'];
    if (!role || !secret || typeof role !== 'string' || typeof secret !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!['owner', 'admin', 'editor'].includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (secret !== requireEnv('ADMIN_SHARED_SECRET')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { contentType, objectKey, contentLength } = req.body || {};
    if (!contentType || !objectKey) {
      return res.status(400).json({ error: 'contentType and objectKey are required' });
    }
    if (!ALLOWED_MIME.includes(contentType)) {
      return res.status(400).json({ error: 'Invalid MIME type' });
    }
    if (typeof contentLength === 'number' && contentLength > MAX_BYTES) {
      return res.status(400).json({ error: 'File too large' });
    }

    const bucket = requireEnv('R2_BUCKET');

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: contentType,
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000, immutable'
    } as any);

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const publicBase = requireEnv('PUBLIC_CDN_BASE_URL').replace(/\/$/, '');
    const publicUrl = `${publicBase}/${encodeURI(objectKey)}`;

    return res.status(200).json({ uploadUrl: signedUrl, key: objectKey, publicUrl, expiresIn: 60 });
  } catch (err: any) {
    console.error('sign-upload error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


