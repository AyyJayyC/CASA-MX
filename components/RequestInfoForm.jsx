/**
 * RequestInfoForm (client)
 * Purpose: Collect name and phone to request more info about a property.
 */
'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestSchema } from '../lib/validation/requestSchema';
import { addRequest } from '../lib/mock/requests';

/**
 * @param {{propertyId:string,onSuccess?:function}} props
 */
export default function RequestInfoForm({ propertyId, onSuccess = () => {} }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(requestSchema) });

  async function onSubmit(values) {
    const entry = await addRequest({ propertyId, ...values });
    onSuccess(entry);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label htmlFor="req_name" className="block">Nombre</label>
        <input id="req_name" {...register('name')} className="border p-2 w-full" />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="req_phone" className="block">Teléfono</label>
        <input id="req_phone" {...register('phone')} className="border p-2 w-full" />
        {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      <div className="flex gap-3">
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Enviar</button>
      </div>
    </form>
  );
}
