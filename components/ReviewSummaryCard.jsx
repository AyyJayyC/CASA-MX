'use client';

import RatingStars from './RatingStars.jsx';
import { getRoleLabel } from '@/lib/reviews';

export default function ReviewSummaryCard({
  summary,
  role,
  title,
  loading = false,
  error = null,
  emptyMessage = 'Aún no hay reseñas verificadas para este perfil.',
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
        {title || `Reputación como ${getRoleLabel(role)}`}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
        Basado en rentas aprobadas y reseñas verificadas.
      </p>

      {loading ? (
        <div className="text-sm text-neutral-600 dark:text-neutral-400">Cargando reputación...</div>
      ) : error ? (
        <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
      ) : !summary?.totalReviews ? (
        <div className="text-sm text-neutral-600 dark:text-neutral-400">{emptyMessage}</div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {summary.averageRating?.toFixed(1)}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {summary.totalReviews} reseña{summary.totalReviews === 1 ? '' : 's'}
            </div>
          </div>
          <RatingStars value={summary.averageRating || 0} readOnly size="lg" />
        </div>
      )}
    </div>
  );
}
