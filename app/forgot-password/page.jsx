"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as authAPI from "@/lib/api/auth";
import AuthCard from "@/components/AuthCard";

const forgotSchema = z.object({
  email: z.string().email("Email inválido"),
});

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setError(null);
    try {
      await authAPI.forgotPassword(data);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Error al enviar el correo");
    }
  };

  return (
    <AuthCard
      title="Recuperar cuenta"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña"
    >
      {success ? (
        <div className="text-center">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6">
            <p className="text-sm text-green-700 dark:text-green-400">
              Si el correo existe en nuestro sistema, recibirás un enlace
              para restablecer tu contraseña. Revisa tu bandeja de entrada.
            </p>
          </div>
          <Link
            href="/login"
            className="text-sm font-semibold text-clay dark:text-clay-400 hover:text-clay-600 dark:hover:text-amber-300 transition-colors"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="off"
              {...register("email")}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-clay focus:border-transparent transition-all"
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.email.message}
              </p>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-2 bg-clay hover:bg-clay-500 disabled:from-neutral-300 disabled:to-neutral-400 dark:disabled:from-neutral-700 dark:disabled:to-neutral-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Enviando...
              </span>
            ) : (
              "Enviar enlace"
            )}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
