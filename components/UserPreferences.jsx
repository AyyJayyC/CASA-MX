"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { useUserStore } from "@/lib/stores/userStore";
import {
  PROPERTY_TYPE_OPTIONS,
  CONDITION_LABELS,
} from "@/lib/constants/propertyOptions";
import TagSubscriptions from "./TagSubscriptions";

const PERFIL_OPTIONS = [
  { value: "flipper", label: "Flipper" },
  { value: "buy_hold", label: "Buy & Hold" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "developer", label: "Desarrollador" },
  { value: "owner", label: "Propietario" },
];
const ENFOQUE_OPTIONS = [
  { value: "residencial", label: "Residencial" },
  { value: "comercial", label: "Comercial" },
  { value: "terrenos", label: "Terrenos" },
  { value: "industrial", label: "Industrial" },
  { value: "mixto", label: "Mixto" },
];
const OPERACION_OPTIONS = [
  { value: "cash", label: "Contado" },
  { value: "credit", label: "Crédito" },
  { value: "infonavit", label: "INFONAVIT" },
  { value: "subject_to", label: "Sujeto a" },
  { value: "assume_loan", label: "Asume hipoteca" },
];
const ZONA_OPTIONS = [
  { value: "norte", label: "Norte" },
  { value: "bajio", label: "Bajío" },
  { value: "centro", label: "Centro" },
  { value: "occidente", label: "Occidente" },
  { value: "sureste", label: "Sureste" },
  { value: "todo_mexico", label: "Todo México" },
];
const ACTIVIDAD_OPTIONS = [
  { value: "principiante", label: "Principiante" },
  { value: "intermedio", label: "Intermedio" },
  { value: "profesional", label: "Profesional" },
  { value: "alto_volumen", label: "Alto volumen" },
];
const FREQUENCY_OPTIONS = {
  instant: "Al instante",
  daily: "Diario",
  weekly: "Semanal",
};

const CHIP_LABELS = {
  perfil: PERFIL_OPTIONS,
  enfoque: ENFOQUE_OPTIONS,
  operacion: OPERACION_OPTIONS,
  zona: ZONA_OPTIONS,
  actividad: ACTIVIDAD_OPTIONS,
};

const CHIP_CATEGORY_LABELS = {
  perfil: "Perfil de inversionista",
  enfoque: "Enfoque de propiedad",
  operacion: "Tipo de operación",
  zona: "Zona geográfica",
  actividad: "Nivel de actividad",
};

export default function UserPreferences() {
  const { user } = useAuth();
  const activeRole = user?.activeRole || "client";
  const isClient = activeRole === "client";
  const isSeller = ["owner", "agent"].includes(activeRole);

  const [prefs, setPrefs] = useState(null);
  const [notifs, setNotifs] = useState(null);
  const [tags, setTagsState] = useState(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(
    isClient ? "intereses" : "operacion",
  );

  useEffect(() => {
    setPrefs(useUserStore.getState().getPreferences(activeRole));
    setNotifs(useUserStore.getState().getNotifications());
    setTagsState(useUserStore.getState().getTags());
  }, [activeRole]);

  const handlePrefChange = (field, value) => {
    setPrefs((p) => ({ ...p, [field]: value }));
    setSaved(false);
  };

  const handleArrayToggle = (field, value) => {
    setPrefs((p) => ({
      ...p,
      [field]: p[field].includes(value)
        ? p[field].filter((v) => v !== value)
        : [...p[field], value],
    }));
    setSaved(false);
  };

  const handleSavePrefs = () => {
    useUserStore.getState().savePreferences(activeRole, prefs);
    setSaved(true);
  };

  const handleSaveNotifs = () => {
    useUserStore.getState().saveNotifications(notifs);
    setSaved(true);
  };

  const handleSaveTags = () => {
    useUserStore.getState().saveTags(tags);
    setSaved(true);
  };

  if (!prefs || !notifs || !tags) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
        Preferencias
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
        {(isClient || (isSeller && !isClient)) && (
          <button
            onClick={() => setActiveTab(isClient ? "intereses" : "operacion")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "intereses" || activeTab === "operacion"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {isClient ? "Mis intereses" : "Donde opero"}
          </button>
        )}
        <button
          onClick={() => setActiveTab("notificaciones")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "notificaciones"
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Notificaciones
        </button>
        <button
          onClick={() => setActiveTab("etiquetas")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "etiquetas"
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Etiquetas
        </button>
        <button
          onClick={() => setActiveTab("suscripciones")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "suscripciones"
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Suscripciones
        </button>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 space-y-4">
        {saved && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Preferencias guardadas
          </p>
        )}

        {/* Tab: Intereses (Buy Box for buyers) */}
        {activeTab === "intereses" && isClient && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Tipos de propiedad
              </label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleArrayToggle("propertyTypes", type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      prefs.propertyTypes.includes(type)
                        ? "bg-clay-500 text-white border-clay-500"
                        : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-600 hover:border-clay-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  Precio mínimo (MXN)
                </label>
                <input
                  type="number"
                  value={prefs.minPrice}
                  onChange={(e) => handlePrefChange("minPrice", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  Precio máximo (MXN)
                </label>
                <input
                  type="number"
                  value={prefs.maxPrice}
                  onChange={(e) => handlePrefChange("maxPrice", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                  placeholder="Sin límite"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Condición
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => handleArrayToggle("conditions", value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      prefs.conditions.includes(value)
                        ? "bg-clay-500 text-white border-clay-500"
                        : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-600 hover:border-clay-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  Construcción mín (m²)
                </label>
                <input
                  type="number"
                  value={prefs.minConstructionMeters}
                  onChange={(e) =>
                    handlePrefChange("minConstructionMeters", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  Construcción máx (m²)
                </label>
                <input
                  type="number"
                  value={prefs.maxConstructionMeters}
                  onChange={(e) =>
                    handlePrefChange("maxConstructionMeters", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                  placeholder="Sin límite"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  Recámaras (mín)
                </label>
                <input
                  type="number"
                  value={prefs.minBedrooms}
                  onChange={(e) =>
                    handlePrefChange("minBedrooms", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  Baños (mín)
                </label>
                <input
                  type="number"
                  value={prefs.minBathrooms}
                  onChange={(e) =>
                    handlePrefChange("minBathrooms", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.petFriendly}
                onChange={(e) =>
                  handlePrefChange("petFriendly", e.target.checked)
                }
                className="w-4 h-4 rounded border-neutral-300 text-clay-500 focus:ring-clay-400"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Acepta mascotas
              </span>
            </label>

            <button
              onClick={handleSavePrefs}
              className="px-4 py-2 rounded-lg bg-clay-500 hover:bg-clay-600 text-white text-sm font-medium transition-colors"
            >
              Guardar intereses
            </button>
          </div>
        )}

        {/* Tab: Donde Opero (for sellers) */}
        {activeTab === "operacion" && isSeller && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Define las zonas donde operas. Estas preferencias se usarán para
              recomendarte propiedades y conectar con compradores en tu área.
            </p>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Tipos de propiedad que manejas
              </label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleArrayToggle("propertyTypes", type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      prefs.propertyTypes.includes(type)
                        ? "bg-clay-500 text-white border-clay-500"
                        : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-600 hover:border-clay-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSavePrefs}
              className="px-4 py-2 rounded-lg bg-clay-500 hover:bg-clay-600 text-white text-sm font-medium transition-colors"
            >
              Guardar zona
            </button>
          </div>
        )}

        {/* Tab: Notificaciones */}
        {activeTab === "notificaciones" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Nuevas propiedades que coincidan
                </span>
                <input
                  type="checkbox"
                  checked={notifs.newProperties}
                  onChange={(e) =>
                    setNotifs((n) => ({
                      ...n,
                      newProperties: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-neutral-300 text-clay-500 focus:ring-clay-400"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Nuevas ofertas
                </span>
                <input
                  type="checkbox"
                  checked={notifs.newOffers}
                  onChange={(e) =>
                    setNotifs((n) => ({ ...n, newOffers: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-neutral-300 text-clay-500 focus:ring-clay-400"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Mensajes nuevos
                </span>
                <input
                  type="checkbox"
                  checked={notifs.newMessages}
                  onChange={(e) =>
                    setNotifs((n) => ({ ...n, newMessages: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-neutral-300 text-clay-500 focus:ring-clay-400"
                />
              </label>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Frecuencia
                </label>
                <div className="flex gap-2">
                  {Object.entries(FREQUENCY_OPTIONS).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() =>
                        setNotifs((n) => ({ ...n, frequency: value }))
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        notifs.frequency === value
                          ? "bg-clay-500 text-white border-clay-500"
                          : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-600 hover:border-clay-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveNotifs}
              className="px-4 py-2 rounded-lg bg-clay-500 hover:bg-clay-600 text-white text-sm font-medium transition-colors"
            >
              Guardar notificaciones
            </button>
          </div>
        )}

        {/* Tab: Etiquetas */}
        {activeTab === "etiquetas" && (
          <div className="space-y-5">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Estas etiquetas describen tu perfil como profesional inmobiliario
              y serán visibles en tus propiedades y ofertas.
            </p>
            {Object.entries(CHIP_CATEGORY_LABELS).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {label}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CHIP_LABELS[key].map((opt) => {
                    const isMulti = key !== "actividad";
                    const isSelected = isMulti
                      ? tags[key].includes(opt.value)
                      : tags[key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          if (isMulti) {
                            setTagsState((t) => ({
                              ...t,
                              [key]: t[key].includes(opt.value)
                                ? t[key].filter((v) => v !== opt.value)
                                : [...t[key], opt.value],
                            }));
                          } else {
                            setTagsState((t) => ({ ...t, [key]: opt.value }));
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "bg-clay-500 text-white border-clay-500"
                            : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-600 hover:border-clay-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <button
              onClick={handleSaveTags}
              className="px-4 py-2 rounded-lg bg-clay-500 hover:bg-clay-600 text-white text-sm font-medium transition-colors"
            >
              Guardar etiquetas
            </button>
          </div>
        )}
        {/* Tab: Suscripciones */}
        {activeTab === "suscripciones" && <TagSubscriptions />}
      </div>
    </div>
  );
}
