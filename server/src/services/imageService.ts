import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOADS_DIR = (() => {
  const dirFromDirname = path.resolve(__dirname, '../../uploads');
  if (fs.existsSync(dirFromDirname)) return dirFromDirname;
  const dirInCwd = path.join(process.cwd(), 'uploads');
  if (fs.existsSync(dirInCwd)) return dirInCwd;
  const dirInServerCwd = path.join(process.cwd(), 'server', 'uploads');
  if (fs.existsSync(dirInServerCwd)) return dirInServerCwd;
  try {
    fs.mkdirSync(dirFromDirname, { recursive: true });
    return dirFromDirname;
  } catch {
    return dirInCwd;
  }
})();

if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
  }
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface ProcessedImageResult {
  url: string;
  bytes: number;
  mimeType: string;
}

export const processImagePayload = async (
  rawPayload: string
): Promise<ProcessedImageResult> => {
  if (!rawPayload || typeof rawPayload !== 'string') {
    throw new Error('Image data is required');
  }

  // If already an HTTP/HTTPS URL, validate format
  if (rawPayload.startsWith('http://') || rawPayload.startsWith('https://')) {
    return {
      url: rawPayload,
      bytes: 0,
      mimeType: 'image/external',
    };
  }

  // Check if base64 data URI
  const match = rawPayload.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) {
    // If not a data URI or URL, reject
    throw new Error('Invalid image format. Supported formats: JPEG, PNG, WebP, GIF');
  }

  const mimeType = match[1].toLowerCase();
  const base64Data = match[2];

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported image type: ${mimeType}. Allowed types: JPEG, PNG, WebP, GIF`);
  }

  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length > MAX_SIZE_BYTES) {
    throw new Error(`Image size exceeds 5MB limit (current: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB)`);
  }

  // If Cloudinary environment variables exist, we can upload to Cloudinary
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    // Cloudinary direct REST upload without requiring extra bulky SDK dependencies
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signaturePayload = `timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

      const formData = new URLSearchParams();
      formData.append('file', rawPayload);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const json: any = await response.json();
        return {
          url: json.secure_url || json.url,
          bytes: buffer.length,
          mimeType,
        };
      }
    } catch (uploadError) {
      console.warn('Cloudinary upload failed, falling back to local disk storage:', uploadError);
    }
  }

  // Fallback / default: Store to local filesystem
  const extension = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const filename = `item-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  fs.writeFileSync(filePath, buffer);

  return {
    url: `/uploads/${filename}`,
    bytes: buffer.length,
    mimeType,
  };
};
