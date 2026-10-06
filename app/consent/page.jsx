"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";
import { apiPost } from "@/lib/api/client";

/**
 * Post-OAuth consent step. OAuth providers can't collect our legal + 18+
 * attestation during the round-trip, so the session is flagged
 * `consentRequired` and the user lands here before continuing.
 */
export default function ConsentPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [acceptLegal, setAcceptLegal] = useState(false);
  const [isAdult, setIsAdult] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!acceptLegal || !isAdult) {
      setError(
        "Debes aceptar los términos y confirmar que eres mayor de 18 años.",
      );
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await apiPost("/auth/consent", { acceptLegal: true, isAdult: true });
      router.push("/properties");
    } catch (err) {
      setError(err.message || "No se pudo registrar tu consentimiento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Antes de continuar
      </h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
        Para usar Casa-MX.com necesitamos tu consentimiento legal y confirmar
        tu edad.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={acceptLegal}
            onChange={(e) => setAcceptLegal(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300"
          />
          <span>
            Acepto los{" "}
            <Link href="/terminos" className="text-clay hover:underline">
              Términos y Condiciones
            </Link>{" "}
            y el{" "}
            <Link href="/aviso-legal" className="text-clay hover:underline">
              Aviso de Privacidad
            </Link>
            .
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={isAdult}
            onChange={(e) => setIsAdult(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300"
          />
          <span>Confirmo que soy mayor de 18 años.</span>
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg bg-clay hover:bg-clay-500 text-white font-semibold disabled:opacity-50"
        >
          {submitting ? "Guardando…" : "Continuar"}
        </button>
      </form>
    </main>
  );
}
