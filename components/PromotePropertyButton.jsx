'use client';
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import PromotePropertyModal from './PromotePropertyModal.jsx';

export default function PromotePropertyButton({ propertyId, propertyTitle, sellerId }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user || user.id !== sellerId) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-br from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-white transition-colors flex items-center justify-center gap-2 shadow-md"
      >
        <span>🔥</span>
        Promocionar
      </button>

      {open && (
        <PromotePropertyModal
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
