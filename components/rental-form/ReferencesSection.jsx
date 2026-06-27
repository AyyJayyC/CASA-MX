"use client";

export default function ReferencesSection({ formData, errors, handleChange }) {
  const inputClass = (field) =>
    `w-full px-3 py-2 bg-white dark:bg-neutral-950 border ${errors[field] ? "border-red-500" : "border-neutral-300 dark:border-neutral-700"} rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent`;

  return (
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
            <input type="text" id="reference1Name" name="reference1Name" value={formData.reference1Name}
              onChange={handleChange} className={inputClass("reference1Name")} placeholder="María López" />
            {errors.reference1Name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.reference1Name}</p>}
          </div>
          <div>
            <label htmlFor="reference1Phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Referencia 1 - Teléfono *
            </label>
            <input type="tel" id="reference1Phone" name="reference1Phone" value={formData.reference1Phone}
              onChange={handleChange} className={inputClass("reference1Phone")} placeholder="5598765432" />
            {errors.reference1Phone && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.reference1Phone}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reference2Name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Referencia 2 - Nombre (Opcional)
            </label>
            <input type="text" id="reference2Name" name="reference2Name" value={formData.reference2Name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent"
              placeholder="Carlos Ramírez" />
          </div>
          <div>
            <label htmlFor="reference2Phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Referencia 2 - Teléfono (Opcional)
            </label>
            <input type="tel" id="reference2Phone" name="reference2Phone" value={formData.reference2Phone}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent"
              placeholder="5587654321" />
          </div>
        </div>
      </div>
    </div>
  );
}
