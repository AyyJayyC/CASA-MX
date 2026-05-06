'use client';

/**
 * DocumentUpload - Lets applicants upload required documents for a rental application.
 * Uploads to the secure backend /documents/upload/:applicationId endpoint.
 */

import { useRef, useState } from 'react';

const FIELD_LABELS = {
  idDocument: 'Identificación oficial (INE/Pasaporte)',
  incomeProof: 'Comprobante de ingresos',
  additional: 'Documento adicional',
};

const FIELD_DESCRIPTIONS = {
  idDocument: 'PDF, JPEG o PNG · máx. 10 MB',
  incomeProof: 'Últimos 3 meses de estados de cuenta o recibos de nómina',
  additional: 'Cartas de recomendación, contratos anteriores, etc.',
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * @param {{ applicationId: string, currentUrls: { idDocumentUrl?, incomeProofUrl?, additionalDocsUrls? }, onUploaded: (urls) => void }} props
 */
export default function DocumentUpload({ applicationId, currentUrls = {}, onUploaded }) {
  const [uploading, setUploading] = useState(null); // fieldname being uploaded
  const [errors, setErrors] = useState({});
  const [uploaded, setUploaded] = useState({
    idDocument: !!currentUrls.idDocumentUrl,
    incomeProof: !!currentUrls.incomeProofUrl,
    additional: (currentUrls.additionalDocsUrls?.length ?? 0) > 0,
  });

  const fileInputRefs = {
    idDocument: useRef(null),
    incomeProof: useRef(null),
    additional: useRef(null),
  };

  const handleUpload = async (fieldName) => {
    const file = fileInputRefs[fieldName].current?.files?.[0];
    if (!file) return;

    setUploading(fieldName);
    setErrors((prev) => ({ ...prev, [fieldName]: null }));

    const form = new FormData();
    form.append(fieldName, file);

    try {
      const res = await fetch(`${BACKEND_URL}/documents/upload/${applicationId}`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al subir archivo');
      }

      setUploaded((prev) => ({ ...prev, [fieldName]: true }));
      onUploaded?.({ ...currentUrls, [`${fieldName}Url`]: data.url });
    } catch (err) {
      setErrors((prev) => ({ ...prev, [fieldName]: err.message }));
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Todos los documentos son privados y sólo serán visibles para el propietario.
      </p>

      {Object.entries(FIELD_LABELS).map(([fieldName, label]) => (
        <div key={fieldName} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-900">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-neutral-800 dark:text-white">
                {label}
                {fieldName !== 'additional' && <span className="text-red-500 ml-1">*</span>}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{FIELD_DESCRIPTIONS[fieldName]}</p>
              {errors[fieldName] && (
                <p className="text-xs text-red-600 mt-1">{errors[fieldName]}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {uploaded[fieldName] && (
                <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Subido
                </span>
              )}

              <input
                ref={fileInputRefs[fieldName]}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={() => handleUpload(fieldName)}
              />
              <button
                type="button"
                onClick={() => fileInputRefs[fieldName].current?.click()}
                disabled={uploading === fieldName}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {uploading === fieldName ? 'Subiendo...' : uploaded[fieldName] ? 'Reemplazar' : 'Subir archivo'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
