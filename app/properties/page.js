"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import PropertyList from "../../components/PropertyList.jsx";
import { useProperties } from "../../lib/queries/properties";
import { getUnifiedCatalog } from "../../lib/api/locations.js";
import {
  CONDITION_LABELS,
  STATUS_LABELS,
} from "../../lib/constants/propertyOptions";
import { useAuth } from "../../lib/auth/useAuth";
import { useUserStore } from "../../lib/stores/userStore";

const AMENITY_OPTIONS = [
  "Alberca", "Gimnasio", "Elevador", "Roof Garden", "Vigilancia 24h",
  "Área de juegos", "Piscina privada", "Piscina común", "Jardín", "Terraza",
  "Balcón", "Seguridad 24h", "Acceso controlado", "Aire acondicionado",
  "Calefacción", "Amueblado", "Equipado", "Cocina integral", "Walk-in closet",
];

const SERVICE_OPTIONS_RENT = ["Agua", "Gas", "Internet", "Luz", "Estacionamiento", "TV por Cable", "Vigilancia"];
const SERVICE_OPTIONS_SALE = ["Estacionamiento", "Vigilancia", "Agua"];
const FINANCING_OPTIONS = ["Efectivo", "Crédito bancario", "INFONAVIT", "FOVISSSTE", "Plan de pagos"];

function PropertiesContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [locationsCatalog, setLocationsCatalog] = useState(null);

  const [listingType, setListingType] = useQueryState("type", { defaultValue: "for_sale" });
  const [searchQuery, setSearchQuery] = useQueryState("q", { defaultValue: "" });
  const [estado, setEstado] = useQueryState("estado", { defaultValue: "" });
  const [ciudad, setCiudad] = useQueryState("ciudad", { defaultValue: "" });
  const [colonia, setColonia] = useQueryState("colonia", { defaultValue: "" });
  const [codigoPostal, setCodigoPostal] = useQueryState("cp", { defaultValue: "" });
  const [minPrice, setMinPrice] = useQueryState("minPrice", { defaultValue: "" });
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", { defaultValue: "" });
  const [minRent, setMinRent] = useQueryState("minRent", { defaultValue: "5000" });
  const [maxRent, setMaxRent] = useQueryState("maxRent", { defaultValue: "50000" });
  const [furnished, setFurnished] = useQueryState("furnished", { defaultValue: "" });
  const [condition, setCondition] = useQueryState("condition", { defaultValue: "" });
  const [statusFilter, setStatusFilter] = useQueryState("status", { defaultValue: "" });
  const [minM2, setMinM2] = useQueryState("minM2", { defaultValue: "" });
  const [maxM2, setMaxM2] = useQueryState("maxM2", { defaultValue: "" });
  const [minLot, setMinLot] = useQueryState("minLot", { defaultValue: "" });
  const [maxLot, setMaxLot] = useQueryState("maxLot", { defaultValue: "" });

  const amenityParam = searchParams.get("amenities") || "";
  const serviceParam = searchParams.get("services") || "";
  const financeParam = searchParams.get("financing") || "";
  const selectedAmenities = amenityParam ? amenityParam.split(",").filter(Boolean) : [];
  const selectedServices = serviceParam ? serviceParam.split(",").filter(Boolean) : [];
  const selectedFinancing = financeParam ? financeParam.split(",").filter(Boolean) : [];

  const router = useRouter();
  const pathname = usePathname();

  function setAmenities(arr) {
    const params = new URLSearchParams(searchParams);
    if (arr.length) params.set("amenities", arr.join(","));
    else params.delete("amenities");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setServices(arr) {
    const params = new URLSearchParams(searchParams);
    if (arr.length) params.set("services", arr.join(","));
    else params.delete("services");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setFinancing(arr) {
    const params = new URLSearchParams(searchParams);
    if (arr.length) params.set("financing", arr.join(","));
    else params.delete("financing");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const toggleFilter = (setter, current, value) => {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  const filters = {
    listingType,
    searchQuery: searchQuery || undefined,
    estado: estado || undefined,
    ciudad: ciudad || undefined,
    colonia: colonia || undefined,
    codigoPostal: codigoPostal || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    minRent: minRent !== "5000" ? minRent : undefined,
    maxRent: maxRent !== "50000" ? maxRent : undefined,
    furnished: furnished ? true : undefined,
    condition: condition || undefined,
    status: statusFilter || undefined,
    minConstructionMeters: minM2 || undefined,
    maxConstructionMeters: maxM2 || undefined,
    minLotSize: minLot || undefined,
    maxLotSize: maxLot || undefined,
    swLat: searchParams.get("swLat") ? parseFloat(searchParams.get("swLat")) : undefined,
    swLng: searchParams.get("swLng") ? parseFloat(searchParams.get("swLng")) : undefined,
    neLat: searchParams.get("neLat") ? parseFloat(searchParams.get("neLat")) : undefined,
    neLng: searchParams.get("neLng") ? parseFloat(searchParams.get("neLng")) : undefined,
    centerLat: searchParams.get("centerLat") ? parseFloat(searchParams.get("centerLat")) : undefined,
    centerLng: searchParams.get("centerLng") ? parseFloat(searchParams.get("centerLng")) : undefined,
    radiusKm: searchParams.get("radiusKm") ? parseFloat(searchParams.get("radiusKm")) : undefined,
  };

  const { data: pages, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useProperties(filters);

  const allProperties = pages?.pages?.flat() || [];

  useEffect(() => {
    if (!user) return;
    const role = user.activeRole || "buyer";
    const prefs = useUserStore.getState().getPreferences(role);
    const params = new URLSearchParams(searchParams);
    let changed = false;
    if (prefs.minPrice && !params.has("minPrice")) { params.set("minPrice", prefs.minPrice); changed = true; }
    if (prefs.maxPrice && !params.has("maxPrice")) { params.set("maxPrice", prefs.maxPrice); changed = true; }
    if (prefs.minMonthlyRent && !params.has("minRent")) { params.set("minRent", prefs.minMonthlyRent); changed = true; }
    if (prefs.maxMonthlyRent && !params.has("maxRent")) { params.set("maxRent", prefs.maxMonthlyRent); changed = true; }
    if (changed) router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [user]);

  useEffect(() => {
    let active = true;
    (async () => {
      const catalog = await getUnifiedCatalog();
      if (active && catalog) setLocationsCatalog(catalog);
    })();
    return () => { active = false; };
  }, []);

  const estadosDisponibles = (locationsCatalog?.estados || [])
    .map((e) => e?.nombre)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es-MX"));

  const estadoCatalogo = (locationsCatalog?.estados || []).find(
    (e) => String(e?.nombre || "").toLowerCase() === String(estado || "").toLowerCase()
  );
  const ciudadesCatalogo = (estadoCatalogo?.ciudades || [])
    .map((c) => c?.nombre)
    .filter(Boolean);
  const ciudadesDesdeDatos = [...new Set(
    allProperties.filter((p) => !estado || p.estado === estado).map((p) => p.ciudad).filter(Boolean)
  )];
  const ciudadesDisponibles = [...new Set([...ciudadesCatalogo, ...ciudadesDesdeDatos])]
    .sort((a, b) => a.localeCompare(b, "es-MX"));

  const ciudadCatalogo = (estadoCatalogo?.ciudades || []).find(
    (c) => String(c?.nombre || "").toLowerCase() === String(ciudad || "").toLowerCase()
  );
  const coloniasCatalogo = (ciudadCatalogo?.colonias || []).filter(Boolean);
  const coloniasDesdeDatos = [...new Set(
    allProperties
      .filter((p) => !estado || p.estado === estado)
      .filter((p) => !ciudad || p.ciudad === ciudad)
      .map((p) => p.colonia)
      .filter(Boolean)
  )];
  const coloniasDisponibles = [...new Set([...coloniasCatalogo, ...coloniasDesdeDatos])]
    .sort((a, b) => a.localeCompare(b, "es-MX"));

  const clearFilters = () => {
    const params = new URLSearchParams();
    params.set("type", listingType);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const hasFilters =
    Boolean(estado || ciudad || colonia || codigoPostal || condition || statusFilter ||
      minPrice || maxPrice || minM2 || maxM2 || minLot || maxLot ||
      (listingType === "for_sale" ? false : (minRent !== "5000" || maxRent !== "50000" || furnished)) ||
      selectedAmenities.length || selectedServices.length || selectedFinancing.length);

  const activeFiltersCount = [
    estado, ciudad, colonia, codigoPostal,
    listingType === "for_sale" ? undefined : (minRent !== "5000" ? "1" : ""),
    listingType === "for_sale" ? undefined : (maxRent !== "50000" ? "1" : ""),
    condition, statusFilter, minM2, maxM2, minLot, maxLot,
    minPrice, maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <section className="bg-gradient-to-br from-sand-50 to-sand-100 dark:from-neutral-900 dark:to-neutral-800 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container max-w-7xl py-12 sm:py-16">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
              Encuentra tu hogar ideal
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mb-6">
              {allProperties.length} {allProperties.length === 1 ? "propiedad disponible" : "propiedades disponibles"}
            </p>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setListingType("for_sale")}
                className={`px-6 py-2.5 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 ${
                  listingType === "for_sale"
                    ? "bg-clay text-white shadow-md"
                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:border-clay"
                }`}
              >
                Comprar
              </button>
              <button
                onClick={() => setListingType("for_rent")}
                className={`px-6 py-2.5 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 ${
                  listingType === "for_rent"
                    ? "bg-clay text-white shadow-md"
                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:border-clay"
                }`}
              >
                Rentar
              </button>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="max-w-3xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value || null)}
                placeholder="Buscar por ubicación, colonia o características..."
                className="flex-1 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-clay focus:border-transparent text-base"
              />
            </div>
          </form>
        </div>
      </section>

      <div className="container max-w-7xl py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <MobileFilterToggle />
            <FilterPanel>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Filtros</h2>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-clay hover:text-clay font-medium">
                    Limpiar
                  </button>
                )}
              </div>

              {listingType === "for_sale" ? (
                <FilterGroup label="Rango de precio">
                  <FilterInput id="min-price" value={minPrice} onChange={setMinPrice} placeholder="$ 0" label="Mínimo" />
                  <FilterInput id="max-price" value={maxPrice} onChange={setMaxPrice} placeholder="$ Sin límite" label="Máximo" />
                </FilterGroup>
              ) : (
                <FilterGroup label="Rango de renta mensual">
                  <FilterInput id="min-rent" value={minRent} onChange={setMinRent} placeholder="$ 5,000" label="Mínimo" />
                  <FilterInput id="max-rent" value={maxRent} onChange={setMaxRent} placeholder="$ 50,000" label="Máximo" />
                  <p className="text-xs text-neutral-500 text-center">
                    MXN {parseInt(minRent || "5000").toLocaleString("es-MX")} - {parseInt(maxRent || "50000").toLocaleString("es-MX")}
                  </p>
                </FilterGroup>
              )}

              <FilterSeparator />
              <FilterGroup label="Tamaño">
                <div className="text-xs text-neutral-500">Construcción (m²)</div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input type="number" placeholder="Mín" value={minM2 || ""} onChange={(e) => setMinM2(e.target.value || null)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-sm" />
                  <input type="number" placeholder="Máx" value={maxM2 || ""} onChange={(e) => setMaxM2(e.target.value || null)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-sm" />
                </div>
                <div className="text-xs text-neutral-500 mt-3">Terreno (m²)</div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input type="number" placeholder="Mín" value={minLot || ""} onChange={(e) => setMinLot(e.target.value || null)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-sm" />
                  <input type="number" placeholder="Máx" value={maxLot || ""} onChange={(e) => setMaxLot(e.target.value || null)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-sm" />
                </div>
              </FilterGroup>

              {listingType === "for_rent" && (
                <>
                  <FilterSeparator />
                  <FilterGroup label="Amueblado">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={furnished === "true"} onChange={(e) => setFurnished(e.target.checked ? "true" : null)}
                        className="w-4 h-4 text-clay rounded focus:ring-2 focus:ring-clay" />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Solo amuebladas</span>
                    </label>
                  </FilterGroup>
                </>
              )}

              <FilterSeparator />
              <FilterGroup label="Condición">
                <RadioOption name="condition" value="" label="Todas" current={condition} onChange={setCondition} />
                {Object.entries(CONDITION_LABELS).map(([v, lbl]) => (
                  <RadioOption key={v} name="condition" value={v} label={lbl} current={condition} onChange={setCondition} />
                ))}
              </FilterGroup>

              <FilterSeparator />
              <FilterGroup label="Estatus">
                <RadioOption name="status" value="" label="Todos" current={statusFilter} onChange={setStatusFilter} />
                {Object.entries(STATUS_LABELS).map(([v, lbl]) => (
                  <RadioOption key={v} name="status" value={v} label={lbl} current={statusFilter} onChange={setStatusFilter} />
                ))}
              </FilterGroup>

              <FilterSeparator />
              <FilterGroup label="Servicios incluidos">
                {(listingType === "for_rent" ? SERVICE_OPTIONS_RENT : SERVICE_OPTIONS_SALE).map((svc) => (
                  <label key={svc} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedServices.includes(svc)}
                      onChange={() => toggleFilter(setServices, selectedServices, svc)}
                      className="w-4 h-4 text-clay rounded focus:ring-2 focus:ring-clay" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{svc}</span>
                  </label>
                ))}
              </FilterGroup>

              <FilterSeparator />
              <FilterGroup label="Amenidades">
                {AMENITY_OPTIONS.map((am) => (
                  <label key={am} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedAmenities.includes(am)}
                      onChange={() => toggleFilter(setAmenities, selectedAmenities, am)}
                      className="w-4 h-4 text-clay rounded focus:ring-2 focus:ring-clay" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{am}</span>
                  </label>
                ))}
              </FilterGroup>

              {listingType === "for_sale" && (
                <>
                  <FilterSeparator />
                  <FilterGroup label="Formas de pago">
                    {FINANCING_OPTIONS.map((fin) => (
                      <label key={fin} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selectedFinancing.includes(fin)}
                          onChange={() => toggleFilter(setFinancing, selectedFinancing, fin)}
                          className="w-4 h-4 text-clay rounded focus:ring-2 focus:ring-clay" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{fin}</span>
                      </label>
                    ))}
                  </FilterGroup>
                </>
              )}

              <FilterSeparator />
              <FilterGroup label="Zona">
                <select value={estado || ""} onChange={(e) => { setEstado(e.target.value || null); setCiudad(null); setColonia(null); }}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-clay">
                  <option value="">Todos</option>
                  {estadosDisponibles.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={ciudad || ""} onChange={(e) => { setCiudad(e.target.value || null); setColonia(null); }} disabled={!estado}
                  className="mt-3 w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-clay disabled:opacity-60">
                  <option value="">Todas</option>
                  {ciudadesDisponibles.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <input type="text" list="colonia-datalist" value={colonia || ""} onChange={(e) => setColonia(e.target.value || null)}
                  placeholder={!estado || !ciudad ? "Selecciona estado y ciudad" : "Buscar colonia"} disabled={!estado || !ciudad}
                  className="mt-3 w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-clay disabled:opacity-60" />
                <datalist id="colonia-datalist">
                  {coloniasDisponibles.map((item) => <option key={item} value={item} />)}
                </datalist>
                <input type="text" value={codigoPostal || ""} onChange={(e) => { const v = e.target.value; if (/^\d{0,5}$/.test(v)) setCodigoPostal(v || null); }}
                  maxLength={5} placeholder="Ej: 06700"
                  className="mt-3 w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-clay" />
              </FilterGroup>
            </FilterPanel>
          </aside>

          <main className="flex-1 min-w-0">
            {filters.swLat && (
              <div className="mb-4 p-3 bg-clay/10 dark:bg-clay-900/20 border border-clay-200 dark:border-clay-800 rounded-lg flex items-center justify-between">
                <span className="text-sm text-clay dark:text-clay">
                  Zona de busqueda aplicada desde el mapa
                </span>
                <Link
                  href="/properties/map/draw"
                  className="text-xs text-clay hover:underline font-medium"
                >
                  Ajustar en el mapa →
                </Link>
              </div>
            )}
            <PropertyList
              properties={allProperties}
              isLoading={isLoading}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              searchQuery={searchQuery || ""}
              listingType={listingType}
              showPrivate={false}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

function FilterPanel({ children }) {
  const [showFilters, setShowFilters] = useState(false);
  return (
    <>
      <div className="lg:hidden mb-3">
        <button onClick={() => setShowFilters(!showFilters)}
          className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-sand-200 dark:border-slate-700 rounded-lg text-sm font-medium text-ink-muted dark:text-sand-200 flex items-center justify-center gap-2">
          <svg className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showFilters ? "Ocultar filtros" : "Filtros"}
        </button>
      </div>
      <div className={`lg:block space-y-4 ${showFilters ? "block" : "hidden"}`}>{children}</div>
    </>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">{label}</label>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FilterSeparator() {
  return null;
}

function FilterInput({ id, value, onChange, placeholder, label }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">{label}</label>
      <input id={id} type="number" value={value || ""} onChange={(e) => onChange(e.target.value || null)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-clay focus:border-transparent" />
    </div>
  );
}

function RadioOption({ name, value, label, current, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" name={name} value={value} checked={current === value || (!current && value === "")}
        onChange={() => onChange(value || null)}
        className="w-4 h-4 text-clay border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-clay" />
      <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
    </label>
  );
}

function MobileFilterToggle() {
  return null;
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-neutral-500">Cargando...</div></div>}>
      <PropertiesContent />
    </Suspense>
  );
}
