"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";
import { getMyProperties } from "@/lib/api/properties";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils/format";
import {
  getBuyers,
  createBuyer,
  updateBuyer,
  deleteBuyer,
} from "@/lib/api/crm";

// ─── Status column config for pipeline ─────────────────────────────
const PIPELINE_COLUMNS = [
  {
    status: "disponible",
    label: "Disponible",
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
  },
  {
    status: "preventa",
    label: "Preventa",
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
  },
  {
    status: "bajo_promesa",
    label: "Bajo promesa",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    status: "vendido",
    label: "Vendido",
    color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
  },
  {
    status: "rentado",
    label: "Rentado",
    color: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
  },
  {
    status: "en_remodelacion",
    label: "En remodelación",
    color:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  {
    status: "retirado",
    label: "Retirado",
    color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
  },
  {
    status: "incompleto",
    label: "Borrador",
    color:
      "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-800",
  },
];

const SALE_RENT = { for_sale: "Venta", for_rent: "Renta" };

const RETIRE_REASONS = {
  precio_alto: {
    label: "Precio fuera de mercado",
    color:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  },
  sin_interes: {
    label: "Falta de interés",
    color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  },
  vendida_fuera: {
    label: "Se vendió por fuera",
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  },
  retirada_dueno: {
    label: "El propietario desistió",
    color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  },
  duplicada: {
    label: "Registro duplicado",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  datos_erroneos: {
    label: "Datos erróneos",
    color:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  },
  captacion_termino: {
    label: "Captación se terminó (180 días)",
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  },
  otro: {
    label: "Otro motivo",
    color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  },
};

function getRetiredReason(p) {
  try {
    const notes = JSON.parse(p.inventoryNotes || "{}");
    if (notes.retiredReason) return RETIRE_REASONS[notes.retiredReason] || null;
  } catch {}
  return null;
}

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// ─── Pipeline Board ─────────────────────────────────────────────────
function PipelineBoard({ properties, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-48 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  const byStatus = {};
  PIPELINE_COLUMNS.forEach((c) => {
    byStatus[c.status] = [];
  });
  properties.forEach((p) => {
    const s = p.status || "disponible";
    if (!byStatus[s]) byStatus[s] = [];
    byStatus[s].push(p);
  });

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[1100px]">
        {PIPELINE_COLUMNS.map((col) => (
          <div
            key={col.status}
            className={`flex-1 min-w-[160px] p-3 rounded-xl border ${col.border} bg-white dark:bg-neutral-900/50`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${col.color}`}
              >
                {col.label}
              </span>
              <span className="text-xs text-neutral-400">
                {byStatus[col.status]?.length || 0}
              </span>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {(byStatus[col.status] || []).map((p) => {
                const retired =
                  col.status === "retirado" ? getRetiredReason(p) : null;
                return (
                  <Link
                    key={p.id}
                    href={`/properties/${p.id}`}
                    className="block p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:shadow-sm transition-shadow border border-transparent hover:border-clay/30"
                  >
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {p.colonia}
                      {p.ciudad ? `, ${p.ciudad}` : ""}
                    </p>
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mt-1">
                      {p.listingType === "for_sale"
                        ? formatCurrency(p.price)
                        : `${formatCurrency(p.monthlyRent)}/mes`}
                    </p>
                    {retired ? (
                      <span
                        className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${retired.color}`}
                      >
                        {retired.label}
                      </span>
                    ) : (
                      <p className="text-[10px] text-neutral-400">
                        {SALE_RENT[p.listingType] || ""} ·{" "}
                        {formatNumber(p.squareMeters)}m² ·{" "}
                        {p.imageUrls?.length || 0} fotos
                      </p>
                    )}
                  </Link>
                );
              })}
              {(byStatus[col.status] || []).length === 0 && (
                <p className="text-xs text-neutral-400 text-center py-4">
                  Vacío
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Calendar Widget ─────────────────────────────────────────────────
function CalendarWidget({
  properties,
  loading,
  year,
  month,
  onPrevMonth,
  onNextMonth,
}) {
  if (loading)
    return (
      <div className="h-64 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
    );

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const propsByDay = {};
  properties.forEach((p) => {
    const dates = [p.createdAt, p.availableFrom, p.updatedAt].filter(Boolean);
    dates.forEach((d) => {
      try {
        const date = new Date(d);
        if (date.getFullYear() === year && date.getMonth() === month) {
          const day = date.getDate();
          if (!propsByDay[day]) propsByDay[day] = [];
          propsByDay[day].push(p);
        }
      } catch {}
    });
  });

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return (
    <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrevMonth}
          className="px-2 py-1 text-xs rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          ◀
        </button>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          {MONTHS[month]} {year}
        </h3>
        <button
          onClick={onNextMonth}
          className="px-2 py-1 text-xs rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          ▶
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {dayNames.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-neutral-400 py-1"
          >
            {d}
          </div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={`aspect-square rounded flex flex-col items-center justify-start pt-0.5 text-xs ${
              d ? "hover:bg-clay/10 cursor-default" : ""
            } ${propsByDay[d || 0]?.length ? "bg-clay/5 dark:bg-clay/10 font-semibold text-clay" : "text-neutral-600 dark:text-neutral-400"}`}
          >
            {d && <span className="text-[11px]">{d}</span>}
            {d && propsByDay[d]?.length > 0 && (
              <span className="text-[9px] text-clay mt-0.5">
                {propsByDay[d].length}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-neutral-400 mt-2 text-center">
        Se muestran fechas de creación, disponibilidad y actualización de
        propiedades.
      </p>
    </div>
  );
}

// ─── Main CRM Page ───────────────────────────────────────────────────
export default function CRMPage() {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState("pipeline");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    setError(null);
    getMyProperties({ limit: 500 })
      .then((data) => setProperties(data || []))
      .catch(() => setError("No se pudieron cargar las propiedades"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="p-10 text-center text-neutral-500">
        Inicia sesión para acceder al CRM.
      </div>
    );
  }

  const TABS = [
    { key: "pipeline", label: "Pipeline", icon: "📋" },
    { key: "calendar", label: "Calendario", icon: "📅" },
    { key: "buyers", label: "Compradores", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            CRM
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {properties.length} propiedades en el pipeline
          </p>
        </div>
      </div>

      <div className="flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-clay text-white shadow-sm"
                : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-clay"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {tab === "pipeline" && (
        <PipelineBoard properties={properties} loading={loading} />
      )}

      {tab === "calendar" && (
        <CalendarWidget
          properties={properties}
          loading={loading}
          year={calYear}
          month={calMonth}
          onPrevMonth={() =>
            calMonth === 0
              ? (setCalMonth(11), setCalYear((y) => y - 1))
              : setCalMonth((m) => m - 1)
          }
          onNextMonth={() =>
            calMonth === 11
              ? (setCalMonth(0), setCalYear((y) => y + 1))
              : setCalMonth((m) => m + 1)
          }
        />
      )}

      {tab === "buyers" && <BuyersList isAuthenticated={isAuthenticated} />}
    </div>
  );
}

function BuyersPlaceholder() {
  return (
    <div className="text-center py-16 text-neutral-400">
      <p className="text-4xl mb-3">👥</p>
      <p className="font-medium text-neutral-600 dark:text-neutral-400">
        Lista de compradores próximamente
      </p>
      <p className="text-sm mt-1">
        Podrás agregar y gestionar compradores interesados.
      </p>
    </div>
  );
}

// ─── Buyers List ─────────────────────────────────────────────────────
function BuyersList({ isAuthenticated }) {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    budgetMin: "",
    budgetMax: "",
    preferredZones: "",
    propertyType: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const loadBuyers = async () => {
    setLoading(true);
    const data = await getBuyers();
    setBuyers(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) loadBuyers();
  }, [isAuthenticated]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone || undefined,
        email: form.email || undefined,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        preferredZones: form.preferredZones
          ? form.preferredZones
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        propertyType: form.propertyType || undefined,
        notes: form.notes || undefined,
      };
      if (editing) {
        await updateBuyer(editing, payload);
      } else {
        await createBuyer(payload);
      }
      setForm({
        name: "",
        phone: "",
        email: "",
        budgetMin: "",
        budgetMax: "",
        preferredZones: "",
        propertyType: "",
        notes: "",
      });
      setShowForm(false);
      setEditing(null);
      setSaveError(null);
      await loadBuyers();
    } catch (err) {
      setSaveError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (buyer) => {
    setEditing(buyer.id);
    setForm({
      name: buyer.name || "",
      phone: buyer.phone || "",
      email: buyer.email || "",
      budgetMin: buyer.budgetMin || "",
      budgetMax: buyer.budgetMax || "",
      preferredZones: (buyer.preferredZones || []).join(", "),
      propertyType: buyer.propertyType || "",
      notes: buyer.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este comprador?")) return;
    await deleteBuyer(id);
    await loadBuyers();
  };

  const formatBudget = (b) => {
    if (!b.budgetMin && !b.budgetMax) return "—";
    const parts = [];
    if (b.budgetMin) parts.push(`$${formatNumber(b.budgetMin)}`);
    if (b.budgetMax) parts.push(`$${formatNumber(b.budgetMax)}`);
    return parts.join(" - ");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">{buyers.length} compradores</p>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            setForm({
              name: "",
              phone: "",
              email: "",
              budgetMin: "",
              budgetMax: "",
              preferredZones: "",
              propertyType: "",
              notes: "",
            });
          }}
          className="px-3 py-1.5 text-xs font-medium bg-clay hover:bg-clay-500 text-white rounded-lg"
        >
          {showForm ? "Cancelar" : "+ Agregar"}
        </button>
      </div>

      {showForm && (
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {editing ? "Editar comprador" : "Nuevo comprador"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Nombre *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
            <input
              placeholder="Teléfono"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
            <input
              placeholder="Presupuesto mín"
              type="number"
              value={form.budgetMin}
              onChange={(e) =>
                setForm((f) => ({ ...f, budgetMin: e.target.value }))
              }
              className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
            <input
              placeholder="Presupuesto máx"
              type="number"
              value={form.budgetMax}
              onChange={(e) =>
                setForm((f) => ({ ...f, budgetMax: e.target.value }))
              }
              className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
            <input
              placeholder="Tipo de propiedad"
              value={form.propertyType}
              onChange={(e) =>
                setForm((f) => ({ ...f, propertyType: e.target.value }))
              }
              className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
          <input
            placeholder="Zonas preferidas (separadas por coma)"
            value={form.preferredZones}
            onChange={(e) =>
              setForm((f) => ({ ...f, preferredZones: e.target.value }))
            }
            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
          <textarea
            placeholder="Notas"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-clay hover:bg-clay-500 text-white rounded-lg disabled:opacity-50"
          >
            {saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
          </button>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : buyers.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <p className="text-3xl mb-2">👥</p>
          <p>No hay compradores aún.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 text-left">
                <th className="py-2 px-2 font-medium">Nombre</th>
                <th className="py-2 px-2 font-medium">Contacto</th>
                <th className="py-2 px-2 font-medium">Presupuesto</th>
                <th className="py-2 px-2 font-medium">Zonas</th>
                <th className="py-2 px-2 font-medium">Tipo</th>
                <th className="py-2 px-2 font-medium">Notas</th>
                <th className="py-2 px-2 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-neutral-100 dark:border-neutral-800"
                >
                  <td className="py-2 px-2 font-medium text-neutral-800 dark:text-neutral-200">
                    {b.name}
                  </td>
                  <td className="py-2 px-2 text-neutral-600 dark:text-neutral-400">
                    {b.phone && <span className="block">{b.phone}</span>}
                    {b.email && (
                      <span className="block text-[10px]">{b.email}</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                    {formatBudget(b)}
                  </td>
                  <td className="py-2 px-2 text-neutral-600 dark:text-neutral-400 max-w-[120px] truncate">
                    {(b.preferredZones || []).join(", ") || "—"}
                  </td>
                  <td className="py-2 px-2 text-neutral-600 dark:text-neutral-400">
                    {b.propertyType || "—"}
                  </td>
                  <td className="py-2 px-2 text-neutral-600 dark:text-neutral-400 max-w-[100px] truncate">
                    {b.notes || "—"}
                  </td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => handleEdit(b)}
                      className="text-xs text-clay hover:underline mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
