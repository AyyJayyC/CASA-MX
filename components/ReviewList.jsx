'use client';

import RatingStars from './RatingStars.jsx';
import VerificationBadges from '@/components/VerificationBadges';

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
              {(review.reviewer?.officialIdVerified || review.reviewer?.officialIdUploaded || review.reviewer?.paidSubscriber) && (
                <div className="mt-1">
                  <VerificationBadges
                    compact
                    identityVerified={Boolean(review.reviewer?.officialIdVerified)}
                    identityUploaded={Boolean(review.reviewer?.officialIdUploaded)}
                    paidSubscriber={Boolean(review.reviewer?.paidSubscriber)}
                  />
                </div>
              )}
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {review.property?.title || 'Propiedad verificada'} · {new Date(review.createdAt).toLocaleDateString('es-MX')}
              </p>
            </div>
            <RatingStars value={review.overallRating} readOnly showValue />
          </div>

          {review.comment && (
            <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              {review.comment}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
