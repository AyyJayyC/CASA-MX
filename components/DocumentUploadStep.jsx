'use client';

import React from 'react';
import { useState, useRef } from 'react';
import {
  uploadPropertyDocument,
  deletePropertyDocument,
} from '../lib/api/propertyDocuments';

const DOC_CONFIG = {
  title_deed: {
    label: 'Escritura o título de propiedad',
    hint: 'Escritura pública, contrato de compraventa o título de propiedad.',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  official_id: {
    label: 'Identificación oficial',
    hint: 'INE/IFE, pasaporte o cédula profesional del propietario.',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  agent_authorization: {
    label: 'Carta de autorización del propietario',
    hint: 'Firmada por el dueño autorizando tu gestión.',
    accept: '.pdf,.jpg,.jpeg,.png',
    templateUrl: '/templates/carta-autorizacion.pdf',
  },
};

const REQUIRED_DOCS = {
  seller: ['title_deed'],
  landlord: ['title_deed'],
  wholesaler: ['agent_authorization'],
};

// Initial slot state factory
function makeSlots(types) {
  return Object.fromEntries(
    types.map((t) => [t, { status: 'idle', progress: 0, docId: null, error: null }])
  );
}

export default function DocumentUploadStep({ propertyId, sellerRole = 'seller', onContinue, onUploadLater }) {
  const requiredTypes = REQUIRED_DOCS[sellerRole] ?? REQUIRED_DOCS.seller;
  const [slots, setSlots] = useState(() => makeSlots(requiredTypes));
  const [autoVerified, setAutoVerified] = useState(false);
  const fileRefs = useRef({});

  const navigateDashboard = () => {
    if (typeof window !== 'undefined') {
      window.location.assign('/dashboard');
    }
  };

  function updateSlot(type, patch) {
    setSlots((prev) => ({ ...prev, [type]: { ...prev[type], ...patch } }));
  }

  async function handleFileChange(type, e) {
    const file = e.target.files?.[0];
    if (!file) return;

    updateSlot(type, { status: 'uploading', progress: 0, error: null });

    try {
      const result = await uploadPropertyDocument(propertyId, file, type, (pct) => {
        updateSlot(type, { progress: pct });
      });

      updateSlot(type, { status: 'done', progress: 100, docId: result.document?.id ?? null });

      if (result.autoVerified) {
        setAutoVerified(true);
      }
    } catch (err) {
      updateSlot(type, { status: 'error', error: err.message });
    }

    // Reset the input so the same file can be re-selected after a delete
    if (fileRefs.current[type]) fileRefs.current[type].value = '';
  }

  async function handleDelete(type) {
    const { docId } = slots[type];
    if (!docId) {
      updateSlot(type, { status: 'idle', progress: 0, error: null });
      return;
    }
    try {
      await deletePropertyDocument(propertyId, docId);
      updateSlot(type, { status: 'idle', progress: 0, docId: null, error: null });
      setAutoVerified(false);
    } catch (err) {
      updateSlot(type, { error: err.message });
    }
  }

  const allDone = requiredTypes.every((t) => slots[t]?.status === 'done');

  const goDashboard = () => {
    if (typeof onUploadLater === 'function') {
      onUploadLater();
      return;
    }
    navigateDashboard();
  };

  const continueFlow = () => {
    if (typeof onContinue === 'function') {
      onContinue();
      return;
    }
    navigateDashboard();
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Verificación de propiedad</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sube los documentos requeridos para publicar tu propiedad. No compartiremos estos
          documentos con terceros.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          La identificación oficial (INE/IFE) se valida a nivel de cuenta y no es necesario subirla en cada propiedad.
        </p>
      </div>

      {requiredTypes.map((type) => {
        const config = DOC_CONFIG[type];
        const slot = slots[type];

        return (
          <div key={type} className="border rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-800">{config.label}</p>
                <p className="text-xs text-gray-500">{config.hint}</p>
                {config.templateUrl && (
                  <a
                    href={config.templateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-0.5 inline-block"
                  >
                    Descargar plantilla ↗
                  </a>
                )}
              </div>

              {slot.status === 'idle' && (
                <label className="cursor-pointer shrink-0">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
                    Subir
                  </span>
                  <input
                    ref={(el) => (fileRefs.current[type] = el)}
                    type="file"
                    accept={config.accept}
                    className="hidden"
                    onChange={(e) => handleFileChange(type, e)}
                  />
                </label>
              )}

              {slot.status === 'done' && (
                <button
                  onClick={() => handleDelete(type)}
                  className="shrink-0 text-xs text-red-500 hover:text-red-700 transition"
                  type="button"
                >
                  Eliminar
                </button>
              )}
            </div>

            {slot.status === 'uploading' && (
              <div className="space-y-1">
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${slot.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-right">{slot.progress}%</p>
              </div>
            )}

            {slot.status === 'done' && (
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                ✅ Documento subido correctamente
              </p>
            )}

            {slot.status === 'error' && (
              <div className="space-y-1">
                <p className="text-xs text-red-600">{slot.error}</p>
                <label className="cursor-pointer">
                  <span className="text-xs text-blue-600 hover:underline">Intentar de nuevo</span>
                  <input
                    ref={(el) => (fileRefs.current[type] = el)}
                    type="file"
                    accept={config.accept}
                    className="hidden"
                    onChange={(e) => handleFileChange(type, e)}
                  />
                </label>
              </div>
            )}
          </div>
        );
      })}

      {autoVerified && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-green-700 font-semibold text-base">
            ✅ Tu propiedad ya está publicada
          </p>
          <p className="text-green-600 text-sm mt-1">
            Verificamos tus documentos y tu anuncio ya es visible para compradores e inquilinos.
          </p>
        </div>
      )}

      {!autoVerified && allDone && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-center">
          <p className="text-yellow-800 font-semibold text-sm">
            Documentos recibidos — en revisión
          </p>
          <p className="text-yellow-700 text-xs mt-1">
            Tu propiedad será publicada una vez que un administrador revise tus documentos (24–48 h).
          </p>
        </div>
      )}

      {!allDone && (
        <p className="text-xs text-gray-400 text-center">
          {requiredTypes.filter((t) => slots[t]?.status !== 'done').length} documento(s) pendiente(s)
        </p>
      )}

      <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end">
        <button
          type="button"
          onClick={goDashboard}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
        >
          Subir documentos después
        </button>

        <button
          type="button"
          onClick={continueFlow}
          disabled={!allDone && !autoVerified}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
