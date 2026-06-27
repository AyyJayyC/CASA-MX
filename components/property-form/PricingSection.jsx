'use client';
import React from 'react';

export default function PricingSection({
  register, errors, watch, setValue,
  inputClass, labelClass, errorClass,
  listingType, getNumericInputProps,
  securityDepositRegister, securityDepositInput,
  leaseTermMonthsRegister, leaseTermMonthsInput,
}) {
  if (listingType === 'for_rent') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="securityDeposit" className={labelClass}>
            Depósito de seguridad (MXN)
          </label>
          <input
            id="securityDeposit"
            {...getNumericInputProps(securityDepositRegister, securityDepositInput)}
            className={inputClass}
            placeholder="0"
          />
        </div>

        <div>
          <label htmlFor="leaseTermMonths" className={labelClass}>
            Plazo de contrato (meses)
          </label>
          <input
            id="leaseTermMonths"
            {...getNumericInputProps(leaseTermMonthsRegister, leaseTermMonthsInput)}
            className={inputClass}
            placeholder="12"
          />
        </div>

        <div>
          <label htmlFor="availableFrom" className={labelClass}>
            Disponible desde
          </label>
          <input
            id="availableFrom"
            type="date"
            {...register('availableFrom')}
            className={inputClass}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        Opciones de financiamiento
      </h2>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            id="fin_cash"
            type="checkbox"
            {...register('financeOptions.cash')}
            className="
              w-4 h-4
              text-clay-600
              border-neutral-300 dark:border-neutral-700
              rounded
              focus:ring-2 focus:ring-clay-400
            "
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
            Efectivo
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            id="fin_bank"
            type="checkbox"
            {...register('financeOptions.bankLoan')}
            className="
              w-4 h-4
              text-clay-600
              border-neutral-300 dark:border-neutral-700
              rounded
              focus:ring-2 focus:ring-clay-400
            "
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
            Crédito bancario
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            id="fin_infonavit"
            type="checkbox"
            {...register('financeOptions.INFONAVIT')}
            className="
              w-4 h-4
              text-clay-600
              border-neutral-300 dark:border-neutral-700
              rounded
              focus:ring-2 focus:ring-clay-400
            "
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
            INFONAVIT
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            id="fin_fovissste"
            type="checkbox"
            {...register('financeOptions.FOVISSSTE')}
            className="
              w-4 h-4
              text-clay-600
              border-neutral-300 dark:border-neutral-700
              rounded
              focus:ring-2 focus:ring-clay-400
            "
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
            FOVISSSTE
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            id="fin_payment_plan"
            type="checkbox"
            {...register('financeOptions.paymentPlan')}
            className="
              w-4 h-4
              text-clay-600
              border-neutral-300 dark:border-neutral-700
              rounded
              focus:ring-2 focus:ring-clay-400
            "
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
            Plan de pagos del desarrollador
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            id="fin_other_check"
            type="checkbox"
            {...register('financeOptions.other')}
            className="
              w-4 h-4
              text-clay-600
              border-neutral-300 dark:border-neutral-700
              rounded
              focus:ring-2 focus:ring-clay-400
            "
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
            Otro
          </span>
        </label>
      </div>
    </div>
  );
}
