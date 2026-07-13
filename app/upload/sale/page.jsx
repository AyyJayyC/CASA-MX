"use client";

import { RequireAuth } from "@/components/guards/RequireAuth";
import PropertyUploadForm from "@/components/PropertyUploadForm";

export default function SaleUploadPage() {
  return (
    <RequireAuth>
      <PropertyUploadForm listingType="for_sale" />
    </RequireAuth>
  );
}
