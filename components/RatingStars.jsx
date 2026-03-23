'use client';

export default function RatingStars({
  value = 0,
  onChange,
  size = 'md',
  readOnly = false,
  showValue = false,
  className = '',
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const starSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= value;
          const buttonClasses = readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-105';

          return (
            <button
              key={star}
              type="button"
              onClick={readOnly ? undefined : () => onChange?.(star)}
              className={`${buttonClasses} transition-transform`}
              aria-label={`${star} estrellas`}
              disabled={readOnly}
            >
              <svg
                className={`${starSize} ${filled ? 'text-amber-400' : 'text-neutral-300 dark:text-neutral-700'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.291c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.196-1.539-1.118l1.07-3.291a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {value ? `${value.toFixed?.(1) || value}/5` : 'Sin reseñas'}
        </span>
      )}
    </div>
  );
}
