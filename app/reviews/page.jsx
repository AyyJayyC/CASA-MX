"use client";

import { useEffect, useMemo, useState } from "react";
import ReviewList from "@/components/ReviewList.jsx";
import ReviewSummaryCard from "@/components/ReviewSummaryCard.jsx";
import { useAuth } from "@/lib/auth/useAuth";
import { getReviewSummary, getUserReviews } from "@/lib/api/reviews";
import { getRoleLabel, hasApprovedRole } from "@/lib/reviews";

export default function ReviewsPage() {
  return <ReviewsPageContent />;
}

function ReviewsPageContent() {
  const { user, loading } = useAuth();
  const availableRoles = useMemo(() => {
    if (!user) return [];

    return ["tenant", "landlord"].filter((role) => hasApprovedRole(user, role));
  }, [user]);

  const [selectedRole, setSelectedRole] = useState(null);
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const effectiveRole = useMemo(() => {
    if (selectedRole && availableRoles.includes(selectedRole)) {
      return selectedRole;
    }

    return availableRoles[0] || null;
  }, [availableRoles, selectedRole]);
  const effectiveRoleLabel = getRoleLabel(effectiveRole) || "tu perfil";

  useEffect(() => {
    if (!selectedRole && availableRoles.length > 0) {
      setSelectedRole(availableRoles[0]);
    }
  }, [availableRoles, selectedRole]);

  useEffect(() => {
    if (!user?.id || !effectiveRole) {
      return;
    }

    const loadReviews = async () => {
      try {
        setIsFetching(true);
        setError(null);

        const [summaryData, reviewsData] = await Promise.all([
          getReviewSummary(user.id, effectiveRole),
          getUserReviews(user.id, effectiveRole),
        ]);

        setSummary(summaryData);
        setReviews(reviewsData || []);
      } catch (loadError) {
        setError(loadError.message || "No se pudo cargar tu reputación");
      } finally {
        setIsFetching(false);
      }
    };

    loadReviews();
  }, [effectiveRole, user?.id]);

  if (loading) {
    return (
      <div className="container max-w-6xl py-12 text-neutral-600 dark:text-neutral-400">
        Cargando...
      </div>
    );
  }

  if (!availableRoles.length) {
    return (
      <div className="container max-w-5xl py-12">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            Reputación de renta
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Esta sección se activa para cuentas con rol aprobado de inquilino o
            arrendador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-12 space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Reputación de renta
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-3xl">
          Consulta tus calificaciones verificadas y los comentarios recibidos
          después de solicitudes aprobadas.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {availableRoles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedRole === role
                ? "bg-gradient-to-br from-clay-400 to-clay-600 text-white"
                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-clay-400"
            }`}
          >
            {getRoleLabel(role)}
          </button>
        ))}
      </div>

      <ReviewSummaryCard
        summary={summary}
        role={effectiveRole}
        loading={isFetching}
        error={error}
        title={`Tu reputación como ${effectiveRoleLabel}`}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Reseñas recientes
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Solo se muestran reseñas vinculadas a rentas aprobadas dentro de
            Casa-MX.com.
          </p>
        </div>

        <ReviewList
          reviews={reviews}
          loading={isFetching}
          error={error}
          emptyMessage={`Aún no tienes reseñas verificadas como ${effectiveRoleLabel.toLowerCase()}.`}
        />
      </section>
    </div>
  );
}
