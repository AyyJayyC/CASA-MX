"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Catches errors thrown in the root layout. Reports to Sentry when configured.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: "3rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h1>Algo salió mal</h1>
        <p>Ocurrió un error inesperado. Intenta de nuevo.</p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1.2rem",
            borderRadius: "0.5rem",
            border: "1px solid #d1d5db",
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
