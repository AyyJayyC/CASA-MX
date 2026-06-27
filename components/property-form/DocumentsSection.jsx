'use client';
import React from 'react';
import DocumentUploadStep from '../DocumentUploadStep.jsx';

export default function DocumentsSection({
  success,
  isEditing,
  propertyId,
  sellerRole,
}) {
  if (!success || isEditing || !success.id) return null;

  return (
    <DocumentUploadStep
      propertyId={success.id}
      sellerRole={sellerRole}
    />
  );
}
