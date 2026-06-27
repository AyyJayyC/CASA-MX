"use client";

export default function PersonalSection({ formData, errors, handleChange }) {
  const inputClass = (field) =>
    `w-full px-3 py-2 bg-white dark:bg-neutral-950 border ${errors[field] ? "border-red-500" : "border-neutral-300 dark:border-neutral-700"} rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent`;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Información Personal
      </h3>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Nombre Completo *
        </label>
        <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange}
          className={inputClass("fullName")} placeholder="Juan Pérez García" />
        {errors.fullName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.fullName}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Email *
          </label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
            className={inputClass("email")} placeholder="juan@example.com" />
          {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Teléfono *
          </label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
            className={inputClass("phone")} placeholder="5512345678" />
          {errors.phone && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>}
        </div>
      </div>
    </div>
  );
}
