"use client";

export default function EmploymentSection({ formData, errors, handleChange, monthlyRent }) {
  const inputClass = (field) =>
    `w-full px-3 py-2 bg-white dark:bg-neutral-950 border ${errors[field] ? "border-red-500" : "border-neutral-300 dark:border-neutral-700"} rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent`;

  return (
    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Información Laboral
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="employer" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Empleador *
          </label>
          <input type="text" id="employer" name="employer" value={formData.employer} onChange={handleChange}
            className={inputClass("employer")} placeholder="Empresa S.A." />
          {errors.employer && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.employer}</p>}
        </div>
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Puesto *
          </label>
          <input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange}
            className={inputClass("jobTitle")} placeholder="Gerente de Ventas" />
          {errors.jobTitle && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.jobTitle}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="monthlyIncome" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Ingreso Mensual (MXN) *
          </label>
          <input type="number" id="monthlyIncome" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange}
            className={inputClass("monthlyIncome")} placeholder="25000" min="0" step="1000" />
          {errors.monthlyIncome && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.monthlyIncome}</p>}
          {monthlyRent && formData.monthlyIncome && (
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Ratio ingreso/renta: {(parseFloat(formData.monthlyIncome) / monthlyRent).toFixed(1)}x
            </p>
          )}
        </div>
        <div>
          <label htmlFor="employmentDuration" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Tiempo en Empleo (años) *
          </label>
          <input type="number" id="employmentDuration" name="employmentDuration" value={formData.employmentDuration}
            onChange={handleChange} className={inputClass("employmentDuration")} placeholder="1" min="0" step="0.5" />
          {errors.employmentDuration && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.employmentDuration}</p>}
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Ingresa el tiempo en años. Si llevas menos de un año, usa decimales (ej. 0.5 = 6 meses).
          </p>
        </div>
      </div>
    </div>
  );
}
