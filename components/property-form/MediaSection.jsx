'use client';
import React from 'react';
import Image from 'next/image';
import PropertyImageGallery from '../PropertyImageGallery.jsx';

export default function MediaSection({
  register, errors, setValue, getValues,
  inputClass, labelClass, errorClass,
  photoInputRef, photoFiles, handlePhotoFiles, removePhotoAt,
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        Fotos de la propiedad
      </h2>

      <div>
        <label htmlFor="photos-upload" className={labelClass}>
          Subir imágenes <span className="text-neutral-400 text-xs font-normal">(máximo 10)</span>
        </label>
        <input
          id="photos-upload"
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoFiles}
          className="block w-full text-sm text-neutral-700 dark:text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-clay-50 file:text-clay-700 hover:file:bg-clay-100"
        />
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          La primera imagen será la portada en listados.
        </p>
        <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {photoFiles.length} de 10 fotos cargadas
        </p>
      </div>

      {photoFiles.length > 0 && (
        <div className="space-y-4">
          <PropertyImageGallery images={photoFiles} title="Vista previa" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photoFiles.map((photo, index) => (
              <div key={`${index}-${String(photo).slice(0, 24)}`} className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="relative h-28 w-full">
                  <Image
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePhotoAt(index)}
                  className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/70 text-xs text-white hover:bg-black"
                  aria-label={`Eliminar foto ${index + 1}`}
                >
                  ✕
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-clay-500 px-2 py-0.5 text-[10px] font-medium text-white">
                    Portada
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
