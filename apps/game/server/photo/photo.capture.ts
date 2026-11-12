import { config } from '@npwd/config/server';
import { Delay } from '../../utils/fivem';
import { photoLogger } from './photo.utils';

const CAPTURE_ATTEMPTS = 3;
const RETRY_DELAY_MS = 150;
const MIN_WEBP_BYTES_PER_PIXEL = 0.0022;
const MIN_IMAGE_BYTES = 1024;

const exp = global.exports;

const captureFrame = (source: number): Promise<string> =>
  new Promise((resolve) => {
    exp['screenshot-basic'].requestClientScreenshot(
      source,
      { encoding: config.images.imageEncoding, quality: 0.85 },
      (_: string | boolean, data: string) => resolve(typeof data === 'string' ? data : ''),
    );
  });

const decodeDataUrl = (dataUrl: string): Buffer =>
  Buffer.from(dataUrl.replace(/^data:[^,]*,/, ''), 'base64');

const webpPixels = (image: Buffer): number | null => {
  if (image.length < 30 || image.toString('ascii', 0, 4) !== 'RIFF') return null;
  if (image.toString('ascii', 8, 12) !== 'WEBP') return null;

  switch (image.toString('ascii', 12, 16)) {
    case 'VP8 ':
      return (image.readUInt16LE(26) & 0x3fff) * (image.readUInt16LE(28) & 0x3fff);
    case 'VP8L': {
      const bits = image.readUInt32LE(21);
      return ((bits & 0x3fff) + 1) * (((bits >> 14) & 0x3fff) + 1);
    }
    case 'VP8X':
      return (image.readUIntLE(24, 3) + 1) * (image.readUIntLE(27, 3) + 1);
    default:
      return null;
  }
};

export const isBlankCapture = (dataUrl: string): boolean => {
  const image = decodeDataUrl(dataUrl);
  if (image.length < MIN_IMAGE_BYTES) return true;

  const pixels = webpPixels(image);
  return pixels !== null && pixels > 0 && image.length / pixels < MIN_WEBP_BYTES_PER_PIXEL;
};

export const captureVisibleFrame = async (source: number): Promise<string | null> => {
  for (let attempt = 1; attempt <= CAPTURE_ATTEMPTS; attempt++) {
    const data = await captureFrame(source);
    if (!isBlankCapture(data)) return data;

    photoLogger.warn(`Capture ${attempt} of ${CAPTURE_ATTEMPTS} came back blank`, { source });
    if (attempt < CAPTURE_ATTEMPTS) await Delay(RETRY_DELAY_MS);
  }

  return null;
};
