"use client";

export default function PreferencesSection({ formData, errors, handleChange, monthlyRent }) {
  const inputClass = (field) =>
    `w-full px-3 py-2 bg-white dark:bg-neutral-950 border ${errors[field] ? "border-red-500" : "border-neutral-300 dark:border-neutral-700"} rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent`;

  return (
    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Detalles de Renta
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="desiredMoveInDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Fecha de Mudanza *
          </label>
          <input type="date" id="desiredMoveInDate" name="desiredMoveInDate" value={formData.desiredMoveInDate}
            onChange={handleChange} className={inputClass("desiredMoveInDate")} />
          {errors.desiredMoveInDate && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.desiredMoveInDate}</p>}
        </div>
        <div>
          <label htmlFor="desiredLeaseTerm" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Término de Contrato (meses) *
          </label>
          <input type="number" id="desiredLeaseTerm" name="desiredLeaseTerm" value={formData.desiredLeaseTerm}
            onChange={handleChange} className={inputClass("desiredLeaseTerm")} placeholder="12" min="1" />
          {errors.desiredLeaseTerm && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.desiredLeaseTerm}</p>}
        </div>
        <div>
          <label htmlFor="numberOfOccupants" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Número de Ocupantes *
          </label>
          <input type="number" id="numberOfOccupants" name="numberOfOccupants" value={formData.numberOfOccupants}
            onChange={handleChange} className={inputClass("numberOfOccupants")} placeholder="2" min="1" />
          {errors.numberOfOccupants && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.numberOfOccupants}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="offeredMonthlyRent" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Renta mensual ofrecida (MXN)
          {monthlyRent && (
            <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">
              Precio publicado: ${monthlyRent.toLocaleString("es-MX")}
            </span>
          )}
        </label>
        <input type="number" id="offeredMonthlyRent" name="offeredMonthlyRent" value={formData.offeredMonthlyRent}
          onChange={handleChange}
          className={`w-full sm:w-1/3 px-3 py-2 bg-white dark:bg-neutral-950 border ${errors.offeredMonthlyRent ? "border-red-500" : "border-neutral-300 dark:border-neutral-700"} rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent`}
          placeholder={monthlyRent ? String(monthlyRent) : "0"} min="1" />
        {errors.offeredMonthlyRent && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.offeredMonthlyRent}</p>}
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Opcional — déjalo vacío si aceptas el precio publicado.
        </p>
      </div>
    </div>
  );
}
