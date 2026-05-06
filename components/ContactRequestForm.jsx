'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactRequestSchema } from '../lib/validation/contactRequestSchema';
import { addRequest } from '../lib/api/requests';

export default function ContactRequestForm({ propertyId, onSuccess = () => {} }) {
  const [submitError, setSubmitError] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(contactRequestSchema) });

  async function onSubmit(values) {
    try {
      setSubmitError(null);
      const entry = await addRequest({
        propertyId,
        name: values.name,
        phone: values.phone,
        message: values.message || undefined,
      });
      onSuccess(entry);
      reset();
    } catch (error) {
      setSubmitError(error.message || 'No se pudo enviar la solicitud');
    }
  }

  const inputClass = 'w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1';
  const errorClass = 'text-xs text-red-600 mt-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="req_name" className={labelClass}>Nombre completo *</label>
        <input id="req_name" {...register('name')} className={inputClass} placeholder="Tu nombre" />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="req_phone" className={labelClass}>Teléfono *</label>
        <input id="req_phone" {...register('phone')} className={inputClass} placeholder="+52 55 0000 0000" />
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor="req_message" className={labelClass}>Mensaje adicional (opcional)</label>
        <textarea
          id="req_message"
          {...register('message')}
          rows={3}
          className={inputClass}
          placeholder="¿Tienes alguna pregunta sobre la propiedad o quieres coordinar una visita?"
        />
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
      >
        Solicitar dirección
      </button>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
        Al enviar, el vendedor recibirá tus datos y podrá compartir la dirección del inmueble.
      </p>
    </form>
  );
}
