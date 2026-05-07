'use client';

import { useEffect, useState } from 'react';
import { getReviewSummary } from '@/lib/api/reviews';
import ReviewSummaryCard from './ReviewSummaryCard.jsx';

export default function ApplicantReviewSummary({ applicantId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getReviewSummary(applicantId, 'tenant');

        if (!cancelled) {
          setSummary(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'No se pudo cargar la reputación del inquilino');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [applicantId]);

  return (
    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
      <ReviewSummaryCard
        summary={summary}
        role="tenant"
        loading={loading}
        error={error}
        title="Reputación del inquilino"
        emptyMessage="Este inquilino aún no tiene reseñas verificadas en Casa-MX.com."
      />
    </div>
  );
}
