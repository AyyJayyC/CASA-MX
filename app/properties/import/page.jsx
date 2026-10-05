"use client";
import React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { RequireRole } from "@/components/guards/RequireRole";
import { bulkImportProperties } from "@/lib/api/properties";

const PropertyImportWizard = dynamic(
  () => import("@/components/PropertyImportWizard.jsx"),
  { loading: () => <div className="p-8 text-center text-neutral-500">Cargando importador...</div> }
);

export default function ImportPage() {
  return (
    <RequireRole roles={["agent", "owner", "admin"]}>
      <ImportContent />
    </RequireRole>
  );
}

function ImportContent() {
  const router = useRouter();

  const handleSubmit = async (rows, onProgress) => {
    return bulkImportProperties(rows, "private", onProgress);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Importar propiedades
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8">
          Importa múltiples propiedades desde Excel. Las propiedades importadas
          se marcarán como <strong>Privadas</strong> por defecto (solo visibles
          para mayoristas y realtors).
        </p>
        <PropertyImportWizard
          onSubmit={handleSubmit}
          onCancel={() => router.push("/properties")}
        />
      </div>
    </div>
  );
}
