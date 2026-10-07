/**
 * Browser-side property image compression.
 *
 * Goal: turn a phone photo into a web-friendly WebP under ~300KB, max 1920px
 * long edge, never upscaled. `decode`/`encode` can be injected for tests.
 */

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_INPUT_BYTES = 20 * 1024 * 1024;
export const TARGET_BYTES = 300 * 1024;
export const HARD_CAP_BYTES = 1024 * 1024;
export const MAX_LONG_EDGE = 1920;
export const QUALITY_LADDER = [0.82, 0.72, 0.62, 0.52];
export const SCALE_LADDER = [1920, 1600, 1280];

export function isAccepted(file) {
  return Boolean(file) && ACCEPTED_TYPES.includes(file.type);
}

/**
 * Scale (w,h) so the long edge equals `maxEdge`, preserving aspect ratio.
 * Never upscales: images already within the cap are returned unchanged.
 */
export function computeDimensions(width, height, maxEdge) {
  const long = Math.max(width, height);
  if (!long || long <= maxEdge) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  const scale = maxEdge / long;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function decodeDefault(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Older Safari rejects the options object — retry without it.
      try {
        return await createImageBitmap(file);
      } catch {
        // fall through to <img>
      }
    }
  }
  return await decodeWithImg(file);
}

function decodeWithImg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

function encodeDefault(source, { width, height, quality }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Promise.reject(new Error("Canvas no disponible."));
  }
  ctx.drawImage(source, 0, 0, width, height);

  const toBlob = (type) =>
    new Promise((resolve) => canvas.toBlob(resolve, type, quality));

  // WebP when supported, JPEG otherwise.
  return toBlob("image/webp").then((blob) => blob || toBlob("image/jpeg"));
}

/**
 * @param {File} file
 * @param {{ decode?: Function, encode?: Function }} [opts]
 * @returns {Promise<{ blob: Blob, width: number, height: number }>}
 */
export async function compressImage(file, opts = {}) {
  if (!isAccepted(file)) {
    throw new Error("Formato no soportado. Usa JPG, PNG o WebP.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("La imagen supera 20MB.");
  }

  const decode = opts.decode || decodeDefault;
  const encode = opts.encode || encodeDefault;

  const source = await decode(file);
  const srcWidth = source.width;
  const srcHeight = source.height;
  let best = null;

  try {
    for (const maxEdge of SCALE_LADDER) {
      const { width, height } = computeDimensions(srcWidth, srcHeight, maxEdge);
      for (const quality of QUALITY_LADDER) {
        const blob = await encode(source, { width, height, quality });
        if (!blob) continue;
        best = { blob, width, height };
        if (blob.size <= TARGET_BYTES) {
          return { blob, width, height };
        }
      }
    }
  } finally {
    if (typeof source.close === "function") {
      try {
        source.close();
      } catch {
        /* ignore */
      }
    }
  }

  if (best && best.blob.size <= HARD_CAP_BYTES) {
    return best;
  }
  throw new Error("No se pudo comprimir la imagen por debajo de 1MB.");
}
