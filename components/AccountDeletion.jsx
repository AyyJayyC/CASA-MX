"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { exportMyData, deleteMyAccount } from "@/lib/api/users";

/**
 * ARCO controls: data portability (export) and erasure (delete).
 * Self-service only — actions are scoped to the authenticated user by the API.
 */
export default function AccountDeletion() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleExport() {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const data = await exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "mis-datos-casa-mx.json";
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("Descarga iniciada.");
    } catch (e) {
      setError(e.message || "No se pudieron exportar tus datos.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "¿Eliminar tu cuenta? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await deleteMyAccount();
      setMessage("Tu cuenta fue eliminada.");
      router.replace("/");
    } catch (e) {
      setError(e.message || "No se pudo eliminar la cuenta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5 mt-6">
      <h2 className="font-semibold text-gray-800 mb-1">Privacidad y datos</h2>
      <p className="text-xs text-gray-500 mb-4">
        Descarga una copia de tu información o elimina tu cuenta. Al eliminar,
        anonimizamos tus datos personales y revocamos tus sesiones. Conservamos
        los comprobantes de transacciones de forma anonimizada por obligaciones
        legales.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 hover:bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
        >
          Exportar mis datos
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          Eliminar cuenta
        </button>
      </div>

      {message && (
        <p role="status" className="mt-3 text-sm text-green-700">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
