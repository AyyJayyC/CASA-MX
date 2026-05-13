'use client';
import React from 'react';
import FeaturedCarousel from './FeaturedCarousel.jsx';
import { useProperties } from '@/lib/queries/properties';

export default function HomepageCarousel() {
  const { data = [] } = useProperties();
  const promoted = data.filter(p => p.promotionTier === 'carousel');

  if (promoted.length === 0) return null;

  return (
    <section className="py-10 px-4 bg-white dark:bg-neutral-950">
      <div className="container max-w-6xl">
        <FeaturedCarousel properties={promoted} />
      </div>
    </section>
  );
}
