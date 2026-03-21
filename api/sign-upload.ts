import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type SignUploadRequestBody = {
  contentType: string;
  objectKey: string;
  contentLength: number;
};

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

let cachedS3Client: S3Client | null = null;

const getR2Client = (): S3Client => {
  if (cachedS3Client) {
    return cachedS3Client;
  }

  const accountId = getRequiredEnv('R2_ACCOUNT_ID');
  cachedS3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getRequiredEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: getRequiredEnv('R2_SECRET_ACCESS_KEY')
    }
  });

  return cachedS3Client;
};

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const OBJECT_KEY_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9/_.-]*$/;

// naive in-memory rate limiter (per-IP) - suitable for light student usage
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests/minute per IP
const ipHits: Record<string, { count: number; resetAt: number }> = {};

const getOrigin = (req: VercelRequest): string | undefined => {
  const originOrReferer = (req.headers.origin || req.headers.referer) as string | undefined;
  if (!originOrReferer) {
    return undefined;
  }

  try {
    return new URL(originOrReferer).origin;
  } catch {
    return undefined;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseRequestBody = (body: unknown): SignUploadRequestBody | null => {
  let rawBody = body;

  if (typeof rawBody === 'string') {
    try {
      rawBody = JSON.parse(rawBody) as unknown;
    } catch {
      return null;
    }
  }

  if (!isRecord(rawBody)) {
    return null;
  }

  const { contentType, objectKey, contentLength } = rawBody;
  if (
    typeof contentType !== 'string' ||
    typeof objectKey !== 'string' ||
    typeof contentLength !== 'number'
  ) {
    return null;
  }

  return { contentType, objectKey, contentLength };
};

const isValidObjectKey = (value: string): boolean =>
  value.length > 0 &&
  value.length <= 512 &&
  !value.startsWith('/') &&
  !value.includes('..') &&
  !value.includes('//') &&
  OBJECT_KEY_PATTERN.test(value);

const getUploadRuntimeConfig = () => ({
  bucket: getRequiredEnv('R2_BUCKET'),
  publicBaseUrl: getRequiredEnv('PUBLIC_CDN_BASE_URL').replace(/\/$/, ''),
  adminSharedSecret: getRequiredEnv('ADMIN_SHARED_SECRET')
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = process.env.CORS_ALLOW_ORIGIN || '*';
  const requestOrigin = getOrigin(req);
  let allowOrigin = raw;

  if (raw !== '*') {
    const allowList = raw.split(',').map((origin) => origin.trim()).filter(Boolean);
    if (requestOrigin && allowList.includes(requestOrigin)) {
      allowOrigin = requestOrigin;
    } else if (allowList.length > 0) {
      allowOrigin = allowList[0];
    }
  }

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-comite-role, x-comite-secret');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const ip = forwardedIp?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = ipHits[ip] || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
    }
    entry.count += 1;
    ipHits[ip] = entry;

    if (entry.count > RATE_LIMIT_MAX) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000).toString());
      return res.status(429).json({ error: 'Too Many Requests' });
    }

    const role = req.headers['x-comite-role'];
    const secret = req.headers['x-comite-secret'];
    if (!role || !secret || typeof role !== 'string' || typeof secret !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!['owner', 'admin', 'editor'].includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { bucket, publicBaseUrl, adminSharedSecret } = getUploadRuntimeConfig();
    if (secret !== adminSharedSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const requestBody = parseRequestBody(req.body);
    if (!requestBody) {
      return res.status(400).json({ error: 'contentType, objectKey, and contentLength are required' });
    }

    const { contentType, objectKey, contentLength } = requestBody;
    if (!ALLOWED_MIME.has(contentType)) {
      return res.status(400).json({ error: 'Invalid MIME type' });
    }
    if (!isValidObjectKey(objectKey)) {
      return res.status(400).json({ error: 'Invalid objectKey' });
    }
    if (!Number.isInteger(contentLength) || contentLength <= 0) {
      return res.status(400).json({ error: 'Invalid contentLength' });
    }
    if (contentLength > MAX_BYTES) {
      return res.status(400).json({ error: 'File too large' });
    }

    const commandInput: PutObjectCommandInput = {
      Bucket: bucket,
      Key: objectKey,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable'
    };
    const command = new PutObjectCommand(commandInput);

    const signedUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 60 });
    const publicUrl = `${publicBaseUrl}/${encodeURI(objectKey)}`;

    return res.status(200).json({ uploadUrl: signedUrl, key: objectKey, publicUrl, expiresIn: 60 });
  } catch (error: unknown) {
    console.error('sign-upload error', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
