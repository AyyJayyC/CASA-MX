"use client";

import { useEffect, useMemo, useState } from "react";
import { RequireRole } from "@/components/guards/RequireRole.jsx";
import LeaveReviewModal from "@/components/LeaveReviewModal.jsx";
import NegotiationPanel from "@/components/NegotiationPanel.jsx";
import { getMyApplications } from "@/lib/api/applications";
import { getMyAuthoredReviews } from "@/lib/api/reviews";

const statusConfig = {
  pending: {
    label: "Pendiente",
    badge: "bg-clay-100 dark:bg-clay-900/30 text-clay-800 dark:text-clay-300",
  },
  under_review: {
    label: "En revisión",
    badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  },
  approved: {
    label: "Aprobada",
    badge:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  },
  rejected: {
    label: "Rechazada",
    badge: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  },
};

export default function RentalApplicationsPage() {
  return (
    <RequireRole roles={["tenant"]}>
      <RentalApplicationsContent />
    </RequireRole>
  );
}

function RentalApplicationsContent() {
  const [applications, setApplications] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewedApplicationIds, setReviewedApplicationIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [applicationsData, reviewsData] = await Promise.all([
          getMyApplications(),
          getMyAuthoredReviews("tenant"),
        ]);

        setApplications(applicationsData || []);
        setReviewedApplicationIds(
          (reviewsData || [])
            .map((review) => review.rentalApplicationId)
            .filter(Boolean),
        );
      } catch (loadError) {
        setError(
          loadError.message || "No se pudieron cargar tus solicitudes de renta",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    if (selectedStatus === "all") {
      return applications;
    }

    return applications.filter(
      (application) => application.status === selectedStatus,
    );
  }, [applications, selectedStatus]);

  const filters = [
    { value: "all", label: "Todas" },
    { value: "pending", label: "Pendientes" },
    { value: "under_review", label: "En revisión" },
    { value: "approved", label: "Aprobadas" },
    { value: "rejected", label: "Rechazadas" },
  ];

  return (
    <div className="container max-w-6xl py-12 space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Mis solicitudes de renta
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-3xl">
          Sigue el estado de tus rentas y deja una reseña verificada cuando una
          solicitud haya sido aprobada.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setSelectedStatus(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === filter.value
                ? "bg-gradient-to-br from-clay-400 to-clay-600 text-white"
                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-clay-400"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8 text-sm text-neutral-600 dark:text-neutral-400">
          Cargando solicitudes...
        </div>
      ) : !filteredApplications.length ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8 text-sm text-neutral-600 dark:text-neutral-400">
          No hay solicitudes en esta vista.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const badge =
              statusConfig[application.status] || statusConfig.pending;
            const alreadyReviewed = reviewedApplicationIds.includes(
              application.id,
            );

            return (
              <article
                key={application.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {application.property?.title || "Propiedad de renta"}
                      </h2>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {application.property?.address ||
                          "Dirección no disponible"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ${badge.badge}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Mudanza:{" "}
                        {new Date(
                          application.desiredMoveInDate,
                        ).toLocaleDateString("es-MX")}
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Plazo: {application.desiredLeaseTerm} meses
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-neutral-500 dark:text-neutral-400">
                          Ingreso mensual
                        </div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          ${application.monthlyIncome?.toLocaleString("es-MX")}{" "}
                          MXN
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-500 dark:text-neutral-400">
                          Renta publicada
                        </div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          $
                          {application.property?.monthlyRent?.toLocaleString(
                            "es-MX",
                          )}{" "}
                          MXN
                        </div>
                      </div>
                    </div>

                    {application.landlordNote && (
                      <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                        <span className="font-medium">
                          Nota del arrendador:
                        </span>{" "}
                        {application.landlordNote}
                      </div>
                    )}

                    {/* Negotiation panel — only for pending/under_review applications */}
                    {["pending", "under_review"].includes(application.status) &&
                      application.property?.monthlyRent && (
                        <NegotiationPanel
                          applicationId={application.id}
                          originalRent={application.property.monthlyRent}
                          applicantId={application.applicantId}
                          landlordId={application.property?.sellerId}
                        />
                      )}
                  </div>

                  <div className="lg:w-64 space-y-3">
                    {application.status === "approved" && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/contracts/rental/${application.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Descargar Contrato
                      </a>
                    )}
                    {application.status === "approved" && (
                      <button
                        type="button"
                        onClick={() => setSelectedApplication(application)}
                        disabled={alreadyReviewed}
                        className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-clay-400 to-clay-600 hover:from-clay-500 hover:to-clay-700 disabled:opacity-60 transition-all"
                      >
                        {alreadyReviewed
                          ? "Reseña enviada"
                          : "Calificar arrendador"}
                      </button>
                    )}

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-5">
                      Las reseñas solo están disponibles cuando la solicitud fue
                      aprobada dentro de Casa-MX.com.
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <LeaveReviewModal
        isOpen={Boolean(selectedApplication)}
        onClose={() => setSelectedApplication(null)}
        rentalApplicationId={selectedApplication?.id}
        reviewerRole="tenant"
        revieweeName="tu arrendador"
        propertyTitle={selectedApplication?.property?.title}
        onSubmitted={() => {
          if (!selectedApplication) return;
          setReviewedApplicationIds((current) => [
            ...new Set([...current, selectedApplication.id]),
          ]);
        }}
      />
    </div>
  );
}
