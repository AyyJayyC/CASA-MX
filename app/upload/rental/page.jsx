"use client";

import { RequireAuth } from "@/components/guards/RequireAuth";
import PropertyUploadForm from "@/components/PropertyUploadForm";

export default function RentalUploadPage() {
  return (
    <RequireAuth>
      <PropertyUploadForm listingType="for_rent" />
    </RequireAuth>
  );
}
