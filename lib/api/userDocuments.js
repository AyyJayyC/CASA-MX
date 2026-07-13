import { apiGet, apiDelete } from "./client";
import { uploadFile } from "./uploadUtils";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function validateFile(file) {
  if (!file) return { valid: false, error: "No file selected." };
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `File type ".${ext}" not accepted. Allowed: PDF, JPEG, PNG, WebP.`,
    };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" not accepted. Allowed: PDF, JPEG, PNG, WebP.`,
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMB} MB). Maximum: 10 MB.`,
    };
  }
  return { valid: true };
}

export async function uploadUserDocument(file, documentType, onProgress) {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return uploadFile({
    endpoint: "/users/documents",
    file,
    documentType,
    onProgress,
  });
}

export async function getUserDocuments() {
  const res = await apiGet("/users/documents");
  return res?.documents ?? [];
}

export async function deleteUserDocument(docId) {
  try {
    await apiDelete(`/users/documents/${docId}`);
  } catch (err) {
    if (err.status !== 204) throw err;
  }
}
