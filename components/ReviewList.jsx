'use client';

import RatingStars from './RatingStars.jsx';
import { getReviewCategoryLabel } from '@/lib/reviews';

export default function ReviewList({
  reviews = [],
  loading = false,
  error = null,
  emptyMessage = 'Todavía no hay reseñas para mostrar.',
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 text-sm text-neutral-600 dark:text-neutral-400">
        Cargando reseñas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 text-sm text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 text-sm text-neutral-600 dark:text-neutral-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                {review.reviewer?.name || 'Usuario verificado'}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {review.property?.title || 'Propiedad verificada'} · {new Date(review.createdAt).toLocaleDateString('es-MX')}
              </p>
            </div>
            <RatingStars value={review.overallRating} readOnly showValue />
          </div>

          {review.comment && (
            <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300 mb-4">
              {review.comment}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(review.categoryScores || []).map((categoryScore) => (
              <div
                key={categoryScore.id || categoryScore.category}
                className="flex items-center justify-between gap-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 px-4 py-3"
              >
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {getReviewCategoryLabel(categoryScore.category)}
                </span>
                <RatingStars value={categoryScore.score} readOnly size="sm" />
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
