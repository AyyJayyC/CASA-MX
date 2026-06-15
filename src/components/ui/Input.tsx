import { forwardRef, type InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-ink mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`block w-full rounded-lg border bg-white px-4 py-2.5 text-ink placeholder:text-ink-muted transition-colors focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay ${icon ? "pl-10" : ""} ${error ? "border-red-400 focus:ring-red-400/30 focus:border-red-400" : "border-sand-dark hover:border-clay/30"} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
