"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
} from "@/lib/api/apiKeys";

function fmtDate(value) {
  return value ? new Date(value).toLocaleDateString("es-MX") : "—";
}

export default function ApiKeysPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setKeys(await listApiKeys());
    } catch (e) {
      setError(e.message || "No se pudieron cargar tus API keys.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  function openDialog() {
    setLabel("");
    setCreatedKey(null);
    setCopied(false);
    setError("");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setCreatedKey(null);
    setLabel("");
    load();
  }

  async function handleCreate() {
    if (!label.trim()) return;
    setCreating(true);
    setError("");
    try {
      setCreatedKey(await createApiKey(label.trim()));
    } catch (e) {
      setError(e.message || "No se pudo crear la API key.");
    } finally {
      setCreating(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard?.writeText(createdKey.key);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function handleRevoke(id) {
    if (
      !window.confirm(
        "¿Revocar esta API key? Las integraciones que la usen dejarán de funcionar.",
      )
    ) {
      return;
    }
    setError("");
    try {
      await revokeApiKey(id);
      await load();
    } catch (e) {
      setError(e.message || "No se pudo revocar la API key.");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              API Keys
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Crea llaves para publicar propiedades desde tus propias
              integraciones. La llave se muestra una sola vez.
            </p>
          </div>
          <button
            onClick={openDialog}
            className="shrink-0 rounded-lg bg-clay-500 hover:bg-clay-600 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            Nueva API key
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-neutral-400 py-10 text-center">Cargando…</p>
        ) : keys.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 dark:text-neutral-600">
            <div className="text-4xl mb-3">🔑</div>
            <p className="font-medium">No tienes API keys todavía.</p>
            <p className="text-sm mt-1">
              Crea una para conectar tu sistema de publicación.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div
                key={k.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {k.label}
                    </span>
                    {k.active ? (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                        Activa
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 rounded px-2 py-0.5">
                        Revocada
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-mono text-neutral-500 mt-1">
                    {k.keyPrefix}…
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Creada: {fmtDate(k.createdAt)} · Último uso:{" "}
                    {fmtDate(k.lastUsedAt)}
                  </p>
                </div>
                {k.active && (
                  <button
                    onClick={() => handleRevoke(k.id)}
                    className="shrink-0 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 text-sm font-medium"
                  >
                    Revocar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-5 space-y-4">
            {createdKey ? (
              <>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Tu nueva API key
                </h2>
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Guárdala ahora; no se mostrará otra vez.
                </p>
                <code className="block w-full break-all rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-3 text-sm text-neutral-900 dark:text-neutral-100">
                  {createdKey.key}
                </code>
                {createdKey.warning && (
                  <p className="text-xs text-amber-700">{createdKey.warning}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCopy}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                  <button
                    onClick={closeDialog}
                    className="rounded-lg bg-clay-500 hover:bg-clay-600 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Listo
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Nueva API key
                </h2>
                <div>
                  <label
                    htmlFor="api-key-label"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    Nombre
                  </label>
                  <input
                    id="api-key-label"
                    value={label}
                    maxLength={60}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Ej. Pipeline Hermosillo"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-clay-400"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeDialog}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={creating || !label.trim()}
                    className="rounded-lg bg-clay-500 hover:bg-clay-600 disabled:opacity-50 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Crear
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
