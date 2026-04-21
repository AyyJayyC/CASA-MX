/**
 * RequestInfoForm (client)
 * Purpose: Collect buyer details to request more info about a sale property.
 */
'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestSchema } from '../lib/validation/requestSchema';
import { addRequest } from '../lib/api/requests';

/**
 * @param {{propertyId:string,onSuccess?:function}} props
 */
export default function RequestInfoForm({ propertyId, onSuccess = () => {} }) {
  const [submitError, setSubmitError] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(requestSchema) });

  async function onSubmit(values) {
    try {
      setSubmitError(null);
      // Serialize extra fields into message
      const extraInfo = [
        values.budget ? `Presupuesto: ${values.budget}` : null,
        values.financing ? `Crédito hipotecario: ${{ yes: 'Sí', no: 'No', maybe: 'Tal vez' }[values.financing]}` : null,
        values.timeline ? `Plazo de compra: ${values.timeline}` : null,
        values.message ? `Mensaje: ${values.message}` : null,
      ].filter(Boolean).join(' | ');

      const entry = await addRequest({
        propertyId,
        name: values.name,
        phone: values.phone,
        message: extraInfo || undefined,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="req_name" className={labelClass}>Nombre completo *</label>
          <input id="req_name" {...register('name')} className={inputClass} placeholder="Tu nombre" />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="req_email" className={labelClass}>Email *</label>
          <input id="req_email" type="email" {...register('email')} className={inputClass} placeholder="tu@email.com" />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="req_phone" className={labelClass}>Teléfono *</label>
          <input id="req_phone" {...register('phone')} className={inputClass} placeholder="+52 55 0000 0000" />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
        <div>
          <label htmlFor="req_budget" className={labelClass}>Presupuesto aproximado</label>
          <input id="req_budget" {...register('budget')} className={inputClass} placeholder="Ej. $2,500,000 MXN" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="req_financing" className={labelClass}>¿Tienes crédito hipotecario?</label>
          <select id="req_financing" {...register('financing')} className={inputClass}>
            <option value="">Seleccionar...</option>
            <option value="yes">Sí, ya tengo crédito aprobado</option>
            <option value="maybe">Estoy tramitándolo</option>
            <option value="no">No, compra de contado</option>
          </select>
        </div>
        <div>
          <label htmlFor="req_timeline" className={labelClass}>¿Cuándo planeas comprar?</label>
          <select id="req_timeline" {...register('timeline')} className={inputClass}>
            <option value="">Seleccionar...</option>
            <option value="immediately">De inmediato</option>
            <option value="1-3months">En 1–3 meses</option>
            <option value="3-6months">En 3–6 meses</option>
            <option value="6+months">Más de 6 meses</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="req_message" className={labelClass}>Mensaje adicional</label>
        <textarea
          id="req_message"
          {...register('message')}
          rows={3}
          className={inputClass}
          placeholder="¿Tienes alguna pregunta o comentario sobre la propiedad?"
        />
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
      >
        Enviar solicitud de información
      </button>
    </form>
  );
}
