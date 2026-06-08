"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BACKEND_URL } from "@/lib/api/client";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { RequireRole } from "@/components/guards/RequireRole";

const slideSchema = z.object({
  imageUrl: z.string().url("URL de imagen inválida"),
  title: z
    .string()
    .min(1, "Título requerido")
    .max(120, "Máximo 120 caracteres"),
  subtitle: z.string().max(200).optional().or(z.literal("")),
  link: z.string().min(1, "Enlace requerido"),
  buttonText: z.string().max(30).optional().or(z.literal("")),
});

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Error de red");
  }
  return res.json();
}

export default function AdminCarouselPage() {
  return (
    <RequireAuth>
      <RequireRole role="admin">
        <CarouselManager />
      </RequireRole>
    </RequireAuth>
  );
}

function CarouselManager() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      imageUrl: "",
      title: "",
      subtitle: "",
      link: "",
      buttonText: "Ver más",
    },
  });

  const loadSlides = async () => {
    try {
      const data = await apiFetch("/admin/carousel");
      setSlides(data.slides || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await apiFetch(`/admin/carousel/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        await apiFetch("/admin/carousel", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
      reset();
      setEditing(null);
      await loadSlides();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (slide) => {
    setEditing(slide);
    setValue("imageUrl", slide.imageUrl);
    setValue("title", slide.title);
    setValue("subtitle", slide.subtitle || "");
    setValue("link", slide.link);
    setValue("buttonText", slide.buttonText || "Ver más");
  };

  const handleCancelEdit = () => {
    setEditing(null);
    reset();
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este slide?")) return;
    try {
      await apiFetch(`/admin/carousel/${id}`, { method: "DELETE" });
      await loadSlides();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleToggleActive = async (slide) => {
    try {
      await apiFetch(`/admin/carousel/${slide.id}`, {
        method: "PUT",
        body: JSON.stringify({ active: !slide.active }),
      });
      await loadSlides();
    } catch (e) {
      setError(e.message);
    }
  };

  const inputClass =
    "w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-clay focus:border-transparent";
  const labelClass =
    "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1";

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Carrusel
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Administra los slides del carrusel principal. Los slides activos se
          muestran en orden.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          {editing ? "Editar slide" : "Nuevo slide"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>URL de imagen</label>
            <input
              type="url"
              {...register("imageUrl")}
              className={inputClass}
              placeholder="https://..."
            />
            {errors.imageUrl && (
              <p className="text-red-600 text-sm mt-1">
                {errors.imageUrl.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Título</label>
              <input
                type="text"
                {...register("title")}
                className={inputClass}
                placeholder="Título del slide"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Subtítulo (opcional)</label>
              <input
                type="text"
                {...register("subtitle")}
                className={inputClass}
                placeholder="Subtítulo"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Enlace</label>
              <input
                type="text"
                {...register("link")}
                className={inputClass}
                placeholder="/properties"
              />
              {errors.link && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.link.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Texto del botón</label>
              <input
                type="text"
                {...register("buttonText")}
                className={inputClass}
                placeholder="Ver más"
              />
            </div>
          </div>

          {/* Image preview */}
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <img
              src={editing?.imageUrl || ""}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            {!editing?.imageUrl && (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                Previsualización
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-clay hover:bg-clay-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
            >
              {saving ? "Guardando..." : editing ? "Actualizar" : "Crear slide"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-2.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 text-sm font-semibold rounded-lg transition-all"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Slides list */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Slides ({slides.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-neutral-500">Cargando...</div>
        ) : slides.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No hay slides. Crea el primero.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {slides.map((slide) => (
              <div key={slide.id} className="p-4 flex items-center gap-4">
                <div className="w-20 h-14 shrink-0 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={slide.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {slide.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {slide.link}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${slide.active ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"}`}
                >
                  {slide.active ? "Activo" : "Inactivo"}
                </span>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className="p-1.5 text-xs rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    title={slide.active ? "Desactivar" : "Activar"}
                  >
                    {slide.active ? "⏸" : "▶"}
                  </button>
                  <button
                    onClick={() => handleEdit(slide)}
                    className="p-1.5 text-xs rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-1.5 text-xs rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    title="Eliminar"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
