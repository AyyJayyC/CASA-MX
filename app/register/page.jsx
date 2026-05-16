'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth/useAuth';
import SocialLoginButtons from '@/components/SocialLoginButtons';

const registerSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
  roles: z.array(z.string()).min(1, 'Selecciona al menos un rol'),
  acceptLegal: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar Términos y Privacidad para continuar' }),
  })
});

const AVAILABLE_ROLES = [
  { value: 'buyer', label: 'Comprar propiedad' },
  { value: 'tenant', label: 'Rentar propiedad' },
  { value: 'seller', label: 'Publicar propiedad (vender o rentar)' },
  { value: 'wholesaler', label: 'Intermediar oportunidades' }
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated } = useAuth();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [registerError, setRegisterError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      roles: selectedRoles,
      acceptLegal: false,
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleRoleChange = (role) => {
    setSelectedRoles((prev) => {
      const next = prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role];
      // Keep the form's roles value in sync so validation passes
      setValue('roles', next);
      return next;
    });
  };

  const onSubmit = async (data) => {
    if (selectedRoles.length === 0) {
      setRegisterError('Selecciona al menos un rol');
      return;
    }

    const roles = [...selectedRoles];
    if (roles.includes('seller') && !roles.includes('landlord')) {
      roles.push('landlord');
    }

    try {
      setRegisterError(null);
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        roles,
        acceptLegal: data.acceptLegal,
      });

      const requiresApproval = selectedRoles.some((role) => role === 'admin');
      alert(
        requiresApproval
          ? '¡Registro exitoso! El acceso de administrador requiere aprobación.'
          : '¡Registro exitoso! Ya puedes iniciar sesión.'
      );
      router.push('/login');
    } catch (err) {
      console.error('Register error:', err);
      setRegisterError(err.message || 'Error al registrar');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="/brand/logo-light.png"
              alt="Casa-MX.com"
              className="mx-auto block h-12 w-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Crear Cuenta
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Unite a Casa-MX.com hoy mismo
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Nombre Completo
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
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
                placeholder="Juan Pérez"
              />
              {errors.name && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors.name.message}
                </p>
              )}
            </div>

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
                {...register('email')}
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
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
                {...register('password')}
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
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                Debe tener al menos 8 caracteres
              </p>
            </div>

            {/* Roles Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                ¿Qué quieres hacer en Casa-MX.com?
              </label>
              <div className="space-y-2">
                {AVAILABLE_ROLES.map((role) => {
                  const isSelected = selectedRoles.includes(role.value);
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleChange(role.value)}
                      className={`
                        w-full px-4 py-3 rounded-lg border-2 text-left transition-all
                        ${isSelected
                          ? 'border-clay bg-clay/10 dark:bg-clay-900/20'
                          : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-clay dark:hover:border-clay'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                          ${isSelected
                            ? 'border-amber-500 bg-clay/100'
                            : 'border-neutral-400 dark:border-neutral-600'
                          }
                        `}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${
                          isSelected
                            ? 'text-clay dark:text-clay'
                            : 'text-neutral-700 dark:text-neutral-300'
                        }`}>
                          {role.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedRoles.length === 0 && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Selecciona al menos un rol
                </p>
              )}
            </div>

            {/* Error Message */}
            {registerError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm">{registerError}</p>
              </div>
            )}

            <div>
              <label className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  {...register('acceptLegal')}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-clay focus:ring-clay"
                />
                <span>
                  Acepto los <a href="/terminos" className="text-clay dark:text-clay-400 hover:underline">Términos y Condiciones</a> y el <a href="/aviso-legal" className="text-clay dark:text-clay-400 hover:underline">Aviso de Privacidad</a>.
                </span>
              </label>
              {errors.acceptLegal && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors.acceptLegal.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || selectedRoles.length === 0}
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
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registrando...
                </span>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          {/* Social Login — quick sign-up alternative */}
          <div className="mt-6">
            <SocialLoginButtons
              redirectTo="/properties"
              onError={(msg) => setRegisterError(msg)}
            />
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-clay/10 dark:bg-clay-900/20 rounded-lg border border-sand-200 dark:border-amber-800">
            <p className="text-sm font-medium text-clay dark:text-clay mb-1">
              ℹ️ Nota sobre Roles
            </p>
            <p className="text-sm text-clay-600 dark:text-clay-400">
              Un administrador debe aprobar tus roles antes de que puedas usarlos. Te notificaremos cuando estén aprobados.
            </p>
          </div>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          ¿Ya tienes cuenta?{' '}
          <a 
            href="/login" 
            className="font-semibold text-clay dark:text-clay-400 hover:text-clay-600 dark:hover:text-amber-300 transition-colors"
          >
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}

