import { describe, expect, it, vi } from 'vitest';
import {
  compressImage,
  computeDimensions,
  isAccepted,
  ACCEPTED_TYPES,
} from '../../lib/media/compressImage.js';

const MB = 1024 * 1024;
const jpegFile = (size = 1024) => ({ type: 'image/jpeg', size });

describe('compressImage helpers', () => {
  it('accepts jpeg/png/webp only', () => {
    expect(isAccepted({ type: 'image/jpeg' })).toBe(true);
    expect(isAccepted({ type: 'image/png' })).toBe(true);
    expect(isAccepted({ type: 'image/webp' })).toBe(true);
    expect(isAccepted({ type: 'image/gif' })).toBe(false);
    expect(isAccepted(null)).toBe(false);
    expect(ACCEPTED_TYPES).toContain('image/webp');
  });

  it('clamps the long edge and never upscales', () => {
    expect(computeDimensions(4000, 3000, 1920)).toEqual({ width: 1920, height: 1440 });
    expect(computeDimensions(3000, 4000, 1920)).toEqual({ width: 1440, height: 1920 });
    expect(computeDimensions(800, 600, 1920)).toEqual({ width: 800, height: 600 });
  });
});

describe('compressImage', () => {
  it('downscales to 1920 long edge and returns the first blob under target', async () => {
    const decode = vi.fn(async () => ({ width: 4000, height: 3000 }));
    const encode = vi.fn(async () => ({ size: 100 * 1024, type: 'image/webp' }));

    const result = await compressImage(jpegFile(), { decode, encode });

    expect(result.width).toBe(1920);
    expect(result.height).toBe(1440);
    expect(result.blob.type).toBe('image/webp');
    expect(encode).toHaveBeenCalledTimes(1);
    expect(encode.mock.calls[0][1]).toMatchObject({ quality: 0.82, width: 1920, height: 1440 });
  });

  it('walks the quality ladder before downscaling', async () => {
    const decode = async () => ({ width: 4000, height: 3000 });
    const sizes = { 0.82: 900 * 1024, 0.72: 800 * 1024, 0.62: 250 * 1024 };
    const encode = vi.fn(async (_src, { quality }) => ({
      size: sizes[quality] ?? 250 * 1024,
      type: 'image/webp',
    }));

    const result = await compressImage(jpegFile(), { decode, encode });

    expect(result.blob.size).toBe(250 * 1024);
    // 3 qualities tried at 1920 before finding the one under 300KB
    expect(encode).toHaveBeenCalledTimes(3);
    expect(encode.mock.calls[2][1].quality).toBe(0.62);
    expect(encode.mock.calls[2][1].width).toBe(1920);
  });

  it('downscales 1920 -> 1600 -> 1280 when quality alone is not enough', async () => {
    const decode = async () => ({ width: 4000, height: 3000 });
    const encode = vi.fn(async (_src, { width, quality }) => ({
      // only the 1600px / 0.82 attempt gets under target
      size: width === 1600 && quality === 0.82 ? 200 * 1024 : 600 * 1024,
      type: 'image/webp',
    }));

    const result = await compressImage(jpegFile(), { decode, encode });

    expect(result.width).toBe(1600);
    expect(result.blob.size).toBe(200 * 1024);
    // 4 attempts at 1920, then 1 at 1600
    expect(encode).toHaveBeenCalledTimes(5);
  });

  it('accepts a final result up to the 1MB hard cap', async () => {
    const decode = async () => ({ width: 4000, height: 3000 });
    const encode = vi.fn(async () => ({ size: 900 * 1024, type: 'image/webp' }));

    const result = await compressImage(jpegFile(), { decode, encode });
    expect(result.blob.size).toBe(900 * 1024);
  });

  it('throws when nothing fits under the 1MB hard cap', async () => {
    const decode = async () => ({ width: 4000, height: 3000 });
    const encode = vi.fn(async () => ({ size: 2 * MB, type: 'image/webp' }));

    await expect(compressImage(jpegFile(), { decode, encode })).rejects.toThrow(/1MB/);
  });

  it('rejects oversized input before decoding', async () => {
    const decode = vi.fn(async () => ({ width: 10, height: 10 }));
    const encode = vi.fn();
    await expect(
      compressImage(jpegFile(21 * MB), { decode, encode }),
    ).rejects.toThrow(/20MB/);
    expect(decode).not.toHaveBeenCalled();
  });

  it('rejects unsupported types', async () => {
    await expect(
      compressImage({ type: 'image/gif', size: 100 }, { decode: vi.fn(), encode: vi.fn() }),
    ).rejects.toThrow();
  });

  it('falls back to JPEG when webp encoding returns null', async () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage: vi.fn() }),
      toBlob: (cb, type) => cb(type === 'image/webp' ? null : { size: 50 * 1024, type: 'image/jpeg' }),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(canvas);

    const result = await compressImage(jpegFile(), {
      decode: async () => ({ width: 10, height: 10 }),
    });

    expect(result.blob.type).toBe('image/jpeg');
    vi.restoreAllMocks();
  });
});
