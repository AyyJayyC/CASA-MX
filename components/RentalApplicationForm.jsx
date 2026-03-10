/**
 * RentalApplicationForm component
 * Purpose: Allow tenants to submit rental applications with validation
 * Design: Multi-section form with 15 required fields, client-side validation, success/error states
 * Checkpoint 5: Integrates with POST /applications backend endpoint
 */
'use client';
import React, { useState } from 'react';
import { z } from 'zod';

// Zod validation schema matching backend requirements
const applicationSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  employer: z.string().min(1, 'El empleador es requerido'),
  jobTitle: z.string().min(1, 'El puesto de trabajo es requerido'),
  monthlyIncome: z.number({ invalid_type_error: 'El ingreso mensual debe ser un número' })
    .positive('El ingreso mensual debe ser mayor a 0'),
  employmentDuration: z.string().min(1, 'La duración del empleo es requerida'),
  desiredMoveInDate: z.string().min(1, 'La fecha de mudanza es requerida'),
  desiredLeaseTerm: z.number({ invalid_type_error: 'El término del contrato debe ser un número' })
    .int('El término debe ser un número entero')
    .positive('El término debe ser mayor a 0'),
  numberOfOccupants: z.number({ invalid_type_error: 'El número de ocupantes debe ser un número' })
    .int('El número de ocupantes debe ser un número entero')
    .positive('El número de ocupantes debe ser mayor a 0'),
  reference1Name: z.string().min(1, 'El nombre de la referencia 1 es requerido'),
  reference1Phone: z.string().min(10, 'El teléfono de la referencia 1 debe tener al menos 10 dígitos'),
  reference2Name: z.string().optional(),
  reference2Phone: z.string().optional(),
  messageToLandlord: z.string().optional(),
});

export default function RentalApplicationForm({ propertyId, monthlyRent, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    employer: '',
    jobTitle: '',
    monthlyIncome: '',
    employmentDuration: '',
    desiredMoveInDate: '',
    desiredLeaseTerm: '',
    numberOfOccupants: '',
    reference1Name: '',
    reference1Phone: '',
    reference2Name: '',
    reference2Phone: '',
    messageToLandlord: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitStatus(null);
    setSubmitMessage('');

    // Convert string numbers to actual numbers for validation
    const dataToValidate = {
      ...formData,
      monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : undefined,
      desiredLeaseTerm: formData.desiredLeaseTerm ? parseInt(formData.desiredLeaseTerm) : undefined,
      numberOfOccupants: formData.numberOfOccupants ? parseInt(formData.numberOfOccupants) : undefined,
    };

    // Client-side validation with Zod
    const result = applicationSchema.safeParse(dataToValidate);
    
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth token when authentication is implemented
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId,
          ...result.data,
          desiredMoveInDate: new Date(result.data.desiredMoveInDate).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar la solicitud');
      }

      // Success
      setSubmitStatus('success');
      setSubmitMessage('¡Solicitud enviada exitosamente! El propietario revisará tu aplicación pronto.');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        employer: '',
        jobTitle: '',
        monthlyIncome: '',
        employmentDuration: '',
        desiredMoveInDate: '',
        desiredLeaseTerm: '',
        numberOfOccupants: '',
        reference1Name: '',
        reference1Phone: '',
        reference2Name: '',
        reference2Phone: '',
        messageToLandlord: '',
      });

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Ocurrió un error al enviar la solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success/Error Messages */}
      {submitStatus && (
        <div className={`
          p-4 rounded-lg border
          ${submitStatus === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }
        `}>
          <div className="flex items-start gap-3">
            <svg 
              className="w-5 h-5 flex-shrink-0 mt-0.5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              {submitStatus === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            <p className="text-sm font-medium">{submitMessage}</p>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Información Personal
        </h3>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`
              w-full px-3 py-2
              bg-white dark:bg-neutral-950
              border ${errors.fullName ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
              rounded-md text-sm
              text-neutral-900 dark:text-neutral-100
              placeholder:text-neutral-500
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
            `}
            placeholder="Juan Pérez García"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.fullName}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`
                w-full px-3 py-2
                bg-white dark:bg-neutral-950
                border ${errors.email ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
                rounded-md text-sm
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              `}
              placeholder="juan@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`
                w-full px-3 py-2
                bg-white dark:bg-neutral-950
                border ${errors.phone ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
                rounded-md text-sm
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              `}
              placeholder="5512345678"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Información Laboral
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employer" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Empleador *
            </label>
            <input
              type="text"
              id="employer"
              name="employer"
              value={formData.employer}
              onChange={handleChange}
              className={`
                w-full px-3 py-2
                bg-white dark:bg-neutral-950
                border ${errors.employer ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
                rounded-md text-sm
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              `}
              placeholder="Empresa S.A."
            />
            {errors.employer && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.employer}</p>
            )}
          </div>

          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Puesto *
            </label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              className={`
                w-full px-3 py-2
                bg-white dark:bg-neutral-950
                border ${errors.jobTitle ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
                rounded-md text-sm
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              `}
              placeholder="Gerente de Ventas"
            />
            {errors.jobTitle && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.jobTitle}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="monthlyIncome" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Ingreso Mensual (MXN) *
            </label>
            <input
              type="number"
              id="monthlyIncome"
              name="monthlyIncome"
              value={formData.monthlyIncome}
              onChange={handleChange}
              className={`
                w-full px-3 py-2
                bg-white dark:bg-neutral-950
                border ${errors.monthlyIncome ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
                rounded-md text-sm
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              `}
              placeholder="25000"
              min="0"
              step="1000"
            />
            {errors.monthlyIncome && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.monthlyIncome}</p>
            )}
            {monthlyRent && formData.monthlyIncome && (
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                Ratio ingreso/renta: {(parseFloat(formData.monthlyIncome) / monthlyRent).toFixed(1)}x
              </p>
            )}
          </div>

          <div>
            <label htmlFor="employmentDuration" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Tiempo en Empleo *
            </label>
            <input
              type="text"
              id="employmentDuration"
              name="employmentDuration"
              value={formData.employmentDuration}
              onChange={handleChange}
              className={`
                w-full px-3 py-2
                bg-white dark:bg-neutral-950
                border ${errors.employmentDuration ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
                rounded-md text-sm
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              `}
              placeholder="2 años"
            />
            {errors.employmentDuration && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.employmentDuration}</p>
            )}
          </div>
        </div>
      </div>

      {/* Rental Details */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Detalles de Renta
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="desiredMoveInDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Fecha de Mudanza *
            </label>
            <input
              type="date"
              id="desiredMoveInDate"
              name="desiredMoveInDate"
              value={formData.desiredMoveInDate}
              onChange={handleChange}
              className={`
                w-full px-3 py-2
                bg-white dark:bg-neutral-950
                border ${errors.desiredMoveInDate ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
                rounded-md text-sm
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              `}
            />
            {errors.desiredMoveInDate && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.desiredMoveInDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="desiredLeaseTerm" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Término de Contrato (meses) *
            </label>
            <input
              type="number"
              id="desiredLeaseTerm"
              name="desiredLeaseTerm"
              value={formData.desiredLeaseTerm}
              onChange={handleChange}
              className={`
                w-full px-3 py-2
                bg-white dark:bg-neutral-950
                border ${errors.desiredLeaseTerm ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
                rounded-md text-sm
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              `}
              placeholder="12"
              min="1"
            />
            {errors.desiredLeaseTerm && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.desiredLeaseTerm}</p>
            )}
          </div>

          <div>
            <label htmlFor="numberOfOccupants" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Número de Ocupantes *
            </label>
            <input
              type="number"
              id="numberOfOccupants"
              name="numberOfOccupants"
              value={formData.numberOfOccupants}
              onChange={handleChange}
              className={`
                w-full px-3 py-2
                bg-white dark:bg-neutral-950
                border ${errors.numberOfOccupants ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
                rounded-md text-sm
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              `}
              placeholder="2"
              min="1"
            />
            {errors.numberOfOccupants && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.numberOfOccupants}</p>
            )}
          </div>
        </div>
      </div>

      {/* References */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Referencias
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reference1Name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Referencia 1 - Nombre *
              </label>
              <input
                type="text"
                id="reference1Name"
                name="reference1Name"
                value={formData.reference1Name}
                onChange={handleChange}
                className={`
                  w-full px-3 py-2
                  bg-white dark:bg-neutral-950
                  border ${errors.reference1Name ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
                  rounded-md text-sm
                  text-neutral-900 dark:text-neutral-100
                  placeholder:text-neutral-500
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                `}
                placeholder="María López"
              />
              {errors.reference1Name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.reference1Name}</p>
              )}
            </div>

            <div>
              <label htmlFor="reference1Phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Referencia 1 - Teléfono *
              </label>
              <input
                type="tel"
                id="reference1Phone"
                name="reference1Phone"
                value={formData.reference1Phone}
                onChange={handleChange}
                className={`
                  w-full px-3 py-2
                  bg-white dark:bg-neutral-950
                  border ${errors.reference1Phone ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
                  rounded-md text-sm
                  text-neutral-900 dark:text-neutral-100
                  placeholder:text-neutral-500
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                `}
                placeholder="5598765432"
              />
              {errors.reference1Phone && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.reference1Phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reference2Name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Referencia 2 - Nombre (Opcional)
              </label>
              <input
                type="text"
                id="reference2Name"
                name="reference2Name"
                value={formData.reference2Name}
                onChange={handleChange}
                className="
                  w-full px-3 py-2
                  bg-white dark:bg-neutral-950
                  border border-neutral-300 dark:border-neutral-700
                  rounded-md text-sm
                  text-neutral-900 dark:text-neutral-100
                  placeholder:text-neutral-500
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                "
                placeholder="Carlos Ramírez"
              />
            </div>

            <div>
              <label htmlFor="reference2Phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Referencia 2 - Teléfono (Opcional)
              </label>
              <input
                type="tel"
                id="reference2Phone"
                name="reference2Phone"
                value={formData.reference2Phone}
                onChange={handleChange}
                className="
                  w-full px-3 py-2
                  bg-white dark:bg-neutral-950
                  border border-neutral-300 dark:border-neutral-700
                  rounded-md text-sm
                  text-neutral-900 dark:text-neutral-100
                  placeholder:text-neutral-500
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                "
                placeholder="5587654321"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Message to Landlord */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
        <div>
          <label htmlFor="messageToLandlord" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Mensaje al Propietario (Opcional)
          </label>
          <textarea
            id="messageToLandlord"
            name="messageToLandlord"
            value={formData.messageToLandlord}
            onChange={handleChange}
            rows={4}
            className="
              w-full px-3 py-2
              bg-white dark:bg-neutral-950
              border border-neutral-300 dark:border-neutral-700
              rounded-md text-sm
              text-neutral-900 dark:text-neutral-100
              placeholder:text-neutral-500
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              resize-none
            "
            placeholder="Cuéntale al propietario por qué eres un buen candidato..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            w-full
            px-6 py-3
            bg-gradient-to-br from-amber-400 to-yellow-600
            hover:from-amber-500 hover:to-yellow-700
            disabled:from-neutral-400 disabled:to-neutral-500
            text-white
            font-semibold
            rounded-lg
            transition-all
            focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
            ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Enviando...
            </span>
          ) : (
            'Enviar Solicitud'
          )}
        </button>
        <p className="mt-2 text-xs text-center text-neutral-600 dark:text-neutral-400">
          Al enviar esta solicitud, aceptas compartir tu información con el propietario.
        </p>
      </div>
    </form>
  );
}
