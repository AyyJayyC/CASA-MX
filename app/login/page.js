"use client";

/**
 * Login Page
 * Purpose: Authenticate user with email and select active role
 */

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth/useAuth";
import { getRoleLabel } from "@/lib/reviews";
import SocialLoginButtons from "@/components/SocialLoginButtons";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

const roleDescriptions = {
  buyer: "Buscar, comprar y rentar propiedades",
  tenant: "Buscar, comprar y rentar propiedades",
  seller: "Publicar, vender y rentar propiedades",
  landlord: "Publicar, vender y rentar propiedades",
  wholesaler: "Vender propiedades como mayorista",
  admin: "Administrar la plataforma",
};

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, switchRole, isAuthenticated, user } = useAuth();
  const [socialError, setSocialError] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [registeredMessage, setRegisteredMessage] = useState(null);
  const [pendingRoles, setPendingRoles] = useState(null);
  const [selectingRole, setSelectingRole] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      const msg = searchParams.get("message");
      if (msg) setRegisteredMessage(decodeURIComponent(msg));
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && !pendingRoles && !loggingIn) {
      const redirect = searchParams.get("redirect");
      router.replace(redirect || "/dashboard");
    }
  }, [isAuthenticated, pendingRoles, router, loggingIn, searchParams]);

  const onSubmit = async (data) => {
    setLoginError(null);
    setLoggingIn(true);
    try {
      const result = await login({
        email: data.email,
        password: data.password,
      });

      // DEBUG: log what the backend returned
      const rawRoles = result.user?.roles || [];
      console.error(
        "[LOGIN DEBUG] Raw roles from backend:",
        JSON.stringify(rawRoles),
      );

      const approvedRoles = (result.user?.roles || []).filter(
        (r) => r.status === "approved",
      );
      const pendingRolesList = (result.user?.roles || []).filter(
        (r) => r.status === "pending",
      );
      // Deduplicate: buyer+tenant → buyer, seller+landlord → seller
      const hasBuyer = approvedRoles.some((r) => r.type === "buyer");
      const hasTenant = approvedRoles.some((r) => r.type === "tenant");
      const hasSeller = approvedRoles.some((r) => r.type === "seller");
      const hasLandlord = approvedRoles.some((r) => r.type === "landlord");
      const displayApproved = approvedRoles
        .filter((r) => !(r.type === "tenant" && hasBuyer))
        .filter((r) => !(r.type === "landlord" && hasSeller));
      const pendingBuyer = pendingRolesList.some((r) => r.type === "buyer");
      const pendingTenant = pendingRolesList.some((r) => r.type === "tenant");
      const pendingSeller = pendingRolesList.some((r) => r.type === "seller");
      const pendingLandlord = pendingRolesList.some(
        (r) => r.type === "landlord",
      );
      // Deduplicate pending same way
      const displayPending = pendingRolesList
        .filter((r) => !(r.type === "tenant" && pendingBuyer))
        .filter((r) => !(r.type === "landlord" && pendingSeller))
        .filter((r) => !displayApproved.some((a) => a.type === r.type));
      const allRoles = [...displayApproved, ...displayPending];

      console.error(
        "[LOGIN DEBUG] approved:",
        JSON.stringify(displayApproved.map((r) => r.type)),
      );
      console.error(
        "[LOGIN DEBUG] pending:",
        JSON.stringify(displayPending.map((r) => r.type)),
      );
      console.error("[LOGIN DEBUG] allRoles count:", allRoles.length);
      setDebugInfo({
        raw: rawRoles,
        approved: displayApproved,
        pending: displayPending,
        count: allRoles.length,
      });

      if (allRoles.length > 1) {
        setPendingRoles(allRoles);
      } else {
        router.push("/properties");
      }
    } catch (err) {
      setLoginError(err.message || "Error al iniciar sesión");
    }
  };

  const handleRoleSelect = (roleType) => {
    switchRole(roleType);
    router.push("/dashboard");
  };

  if (pendingRoles) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-neutral-50 dark:bg-neutral-950">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                ¿Cómo quieres ingresar?
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {pendingRoles.some((r) => r.status === "approved")
                  ? "Tu cuenta tiene múltiples roles. Elige cómo deseas usar Casa-MX."
                  : "Todos tus roles están pendientes de aprobación. Espera la confirmación de un administrador."}
              </p>
            </div>
            <div className="space-y-3">
              {pendingRoles.map((role) => {
                const isPending = role.status === "pending";
                const label = isPending
                  ? `${getRoleLabel(role.type)} — Pendiente de aprobación`
                  : getRoleLabel(role.type);
                return (
                  <button
                    key={role.type}
                    onClick={() => !isPending && handleRoleSelect(role.type)}
                    disabled={isPending || selectingRole}
                    className={`w-full p-4 rounded-xl border transition-all text-left group ${
                      isPending
                        ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 cursor-not-allowed opacity-70"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-clay dark:hover:border-amber-500 bg-white dark:bg-neutral-800 hover:bg-clay/10 dark:hover:bg-amber-900/20"
                    }`}
                  >
                    <div
                      className={`font-semibold ${
                        isPending
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-neutral-900 dark:text-neutral-100 group-hover:text-clay dark:group-hover:text-clay-400"
                      }`}
                    >
                      {label}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {isPending
                        ? "Un administrador debe aprobar este rol antes de usarlo"
                        : roleDescriptions[role.type] ||
                          "Acceder a la plataforma"}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPendingRoles(null)}
              className="w-full mt-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              Cancelar y volver al inicio
            </button>
            {debugInfo && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-mono">
                <pre className="text-red-700 whitespace-pre-wrap">
                  {`=== LOGIN DEBUG ===
API: ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}
ActiveRole: ${user?.activeRole || "N/A"}
Raw roles: ${JSON.stringify(debugInfo.raw.map((r) => `${r.type}:${r.status}`))}
Approved: ${JSON.stringify(debugInfo.approved.map((r) => `${r.type}:${r.status}`))}
Pending: ${JSON.stringify(debugInfo.pending.map((r) => `${r.type}:${r.status}`))}
Total in picker: ${debugInfo.count}`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="/brand/logo-light.png"
              alt="Casa-MX.com"
              className="mx-auto block h-11 w-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Bienvenido
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Inicia sesión para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Registration success message */}
            {registeredMessage && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-400">
                  {registeredMessage}
                </p>
              </div>
            )}
            {/* Email */}
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
                placeholder="tu@email.com"
              />
              {errors.email && (
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
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="off"
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
                placeholder="Tu contraseña"
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

            <div className="text-right mt-1">
              <a
                href="/forgot-password"
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-clay dark:hover:text-clay-400 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Error */}
            {loginError && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {loginError}
              </p>
            )}

            {/* Submit */}
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
                  Iniciando...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            {socialError && (
              <p className="mb-3 text-sm text-red-600 dark:text-red-400 text-center">
                {socialError}
              </p>
            )}
            <SocialLoginButtons
              redirectTo="/properties"
              onError={(msg) => setSocialError(msg)}
            />
          </div>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-clay/10 dark:bg-clay-900/20 rounded-lg border border-sand-200 dark:border-amber-800">
            <p className="text-sm font-medium text-clay dark:text-clay mb-1">
              💡 Demo
            </p>
            <p className="text-sm text-clay-600 dark:text-clay-400">
              Regístrate para crear tu primera cuenta
            </p>
          </div>
        </div>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          ¿No tienes cuenta?{" "}
          <a
            href="/register"
            className="font-semibold text-clay dark:text-clay-400 hover:text-clay-600 dark:hover:text-amber-300 transition-colors"
          >
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}
