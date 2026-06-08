"use client";
import React, { useState } from "react";
import ContactRequestForm from "./ContactRequestForm.jsx";

export default function ContactRequestModal({ propertyId }) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(null);

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="
        w-full px-4 py-2.5 rounded-lg font-semibold text-sm
        border border-neutral-300 dark:border-neutral-700
        text-neutral-700 dark:text-neutral-300
        hover:bg-neutral-100 dark:hover:bg-neutral-800
        transition-colors
      "
      >
        Solicitar dirección
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Solicitar dirección
              </h3>
              <button
                onClick={() => {
                  setOpen(false);
                  setSuccess(null);
                }}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {!success ? (
              <ContactRequestForm
                propertyId={propertyId}
                onSuccess={(s) => setSuccess(s)}
              />
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300 text-sm">
                <p className="font-medium">Solicitud enviada</p>
                <p className="text-xs mt-1">
                  El vendedor revisará tu solicitud y compartirá la dirección
                  contigo.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
