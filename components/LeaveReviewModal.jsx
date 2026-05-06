'use client';

import { useEffect, useState } from 'react';
import RatingStars from './RatingStars.jsx';
import { createReview } from '@/lib/api/reviews';
import { getRoleLabel, REVIEWEE_ROLE_BY_REVIEWER_ROLE } from '@/lib/reviews';

export default function LeaveReviewModal({
  isOpen,
  onClose,
  onSubmitted,
  rentalApplicationId,
  reviewerRole,
  revieweeName,
  propertyTitle,
}) {
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setOverallRating(0);
      setComment('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const revieweeRole = REVIEWEE_ROLE_BY_REVIEWER_ROLE[reviewerRole];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!overallRating) {
      setError('Selecciona una calificación general.');
      return;
    }

    if (overallRating <= 2 && comment.trim().length < 20) {
      setError('Para 2 estrellas o menos, agrega un comentario detallado de al menos 20 caracteres.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createReview({
        rentalApplicationId,
        reviewerRole,
        overallRating,
        comment: comment.trim() || undefined,
      });

      onSubmitted?.();
      onClose?.();
    } catch (submitError) {
      setError(submitError.message || 'No se pudo enviar la reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl">
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Calificar a {revieweeName || getRoleLabel(revieweeRole).toLowerCase()}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Reseña verificada para {propertyTitle || 'una renta aprobada'}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
              Calificación general
            </label>
            <RatingStars value={overallRating} onChange={setOverallRating} size="lg" />
          </div>

          <div>
            <label htmlFor="review-comment" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Comentario
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="Comparte detalles útiles sobre la experiencia."
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Si das 2 estrellas o menos, se requiere un comentario más detallado.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 disabled:opacity-60 transition-all"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
