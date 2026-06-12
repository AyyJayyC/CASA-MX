"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as authAPI from "@/lib/api/auth";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe contener una mayúscula")
      .regex(/[a-z]/, "Debe contener una minúscula")
      .regex(/[0-9]/, "Debe contener un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  );
}

function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    setError(null);
    try {
      await authAPI.resetPassword({ token, password: data.password });
      setSuccess(true);
      setTimeout(() => router.push("/login?reset=true"), 3000);
    } catch (err) {
      setError(err.message || "Error al restablecer la contraseña");
    }
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-neutral-50 dark:bg-neutral-950">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Enlace inválido
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6">
              Este enlace de restablecimiento no es válido o ha expirado.
              Solicita uno nuevo.
            </p>
            <a
              href="/forgot-password"
              className="inline-block w-full py-3 bg-clay hover:bg-clay-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Solicitar nuevo enlace
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-8">
          <div className="text-center mb-8">
            <img
              src="/brand/logo-light.png"
              alt="Casa-MX.com"
              className="mx-auto block h-11 w-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Nueva contraseña
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Ingresa tu nueva contraseña
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6">
                <p className="text-sm text-green-700 dark:text-green-400">
                  Tu contraseña ha sido restablecida. Serás redirigido al inicio
                  de sesión...
                </p>
              </div>
              <a
                href="/login"
                className="text-sm font-semibold text-clay dark:text-clay-400 hover:text-clay-600 dark:hover:text-amber-300 transition-colors"
              >
                Ir al inicio de sesión ahora
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  Nueva contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                  className="
                    w-full px-4 py-3
                    bg-neutral-50 dark:bg-neutral-800
                    border border-neutral-300 dark:border-neutral-700
                    rounded-lg
                    text-neutral-900 dark:text-neutral-100
                    placeholder-neutral-500 dark:placeholder-neutral-500
                    focus:outline-none focus:ring-2 focus:ring-clay focus:border-transparent
                    transition-all
                  "
                  placeholder="Mínimo 8 caracteres"
                />
                {errors.password && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className="
                    w-full px-4 py-3
                    bg-neutral-50 dark:bg-neutral-800
                    border border-neutral-300 dark:border-neutral-700
                    rounded-lg
                    text-neutral-900 dark:text-neutral-100
                    placeholder-neutral-500 dark:placeholder-neutral-500
                    focus:outline-none focus:ring-2 focus:ring-clay focus:border-transparent
                    transition-all
                  "
                  placeholder="Repite tu nueva contraseña"
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.confirmPassword.message}
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
                className="
                  w-full py-3 mt-2
                  bg-clay
                  hover:bg-clay-500
                  disabled:from-neutral-300 disabled:to-neutral-400
                  dark:disabled:from-neutral-700 dark:disabled:to-neutral-800
                  text-white font-semibold
                  rounded-lg
                  transition-all duration-200
                  shadow-md hover:shadow-lg
                  disabled:cursor-not-allowed
                "
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Restableciendo...
                  </span>
                ) : (
                  "Restablecer contraseña"
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <a
            href="/login"
            className="font-semibold text-clay dark:text-clay-400 hover:text-clay-600 dark:hover:text-amber-300 transition-colors"
          >
            Volver al inicio de sesión
          </a>
        </p>
      </div>
    </div>
  );
}
