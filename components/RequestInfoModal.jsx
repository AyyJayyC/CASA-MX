/**
 * RequestInfoModal (client)
 * Purpose: Provide a simple modal to collect request info on property detail page.
 */
'use client';
import React, { useState } from 'react';
import RequestInfoForm from './RequestInfoForm.jsx';

export default function RequestInfoModal({ propertyId }) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(null);

  return (
    <div>
      <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Solicitar más información</button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3">Solicitar más información</h3>
            {!success ? (
              <RequestInfoForm propertyId={propertyId} onSuccess={(s) => setSuccess(s)} />
            ) : (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800">Solicitud enviada. Gracias.</div>
            )}

            <div className="mt-4 flex justify-end">
              <button onClick={() => { setOpen(false); setSuccess(null); }} className="px-3 py-1 border rounded">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
