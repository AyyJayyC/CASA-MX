/**
 * Properties listing page
 * Purpose: Show property search and cards (Spanish UI).
 * Design: Hero section with search, sidebar filters (desktop), responsive grid
 * Checkpoint 4: Buy/Rent tabs, rental filters (rent range, furnished)
 */
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyList from '../../components/PropertyList.jsx';
import { useProperties } from '../../lib/queries/properties';
import { getLocationsCatalog } from '../../lib/api/properties';

const MEXICO_STATES = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
];

function PropertiesContent() {
  const { data = [] } = useProperties();
  const searchParams = useSearchParams();
  const [locationsCatalog, setLocationsCatalog] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [listingType, setListingType] = useState(() => {
    const type = searchParams.get('type');
    return type === 'for_rent' ? 'for_rent' : 'for_sale';
  });

  // Sync listingType when URL param changes (navigation via NavBar)
  useEffect(() => {
    const type = searchParams.get('type');
    setListingType(type === 'for_rent' ? 'for_rent' : 'for_sale');
  }, [searchParams]);
  const [estado, setEstado] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [colonia, setColonia] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRent, setMinRent] = useState('5000');
  const [maxRent, setMaxRent] = useState('50000');
  const [furnished, setFurnished] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedFinancing, setSelectedFinancing] = useState([]);

  const AMENITY_OPTIONS = ['Alberca', 'Gimnasio', 'Elevador', 'Roof Garden', 'Vigilancia 24h', 'Área de juegos'];
  const SERVICE_OPTIONS_RENT = ['Agua', 'Gas', 'Internet', 'Luz', 'Estacionamiento', 'TV por Cable', 'Vigilancia'];
  const SERVICE_OPTIONS_SALE = ['Estacionamiento', 'Vigilancia', 'Agua'];
  const FINANCING_OPTIONS = ['Efectivo', 'Crédito bancario', 'INFONAVIT', 'FOVISSSTE', 'Plan de pagos'];

  const toggleFilter = (setter, current, value) => {
    setter(current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
  };

  useEffect(() => {
    let active = true;

    (async () => {
      const catalog = await getLocationsCatalog();
      if (active && catalog) {
        setLocationsCatalog(catalog);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const estadosCatalogo = (locationsCatalog?.estados || []).map((e) => e?.nombre).filter(Boolean);
  const estadosDisponibles = [...new Set([...MEXICO_STATES, ...estadosCatalogo])].sort((a, b) =>
    a.localeCompare(b, 'es-MX')
  );

  const estadoCatalogo = (locationsCatalog?.estados || []).find(
    (e) => String(e?.nombre || '').toLowerCase() === String(estado || '').toLowerCase()
  );
  const ciudadesCatalogo = (estadoCatalogo?.ciudades || []).map((c) => c?.nombre).filter(Boolean);
  const ciudadesDesdeDatos = [
    ...new Set(
      data
        .filter((p) => !estado || p.estado === estado)
        .map((p) => p.ciudad)
        .filter(Boolean)
    ),
  ];
  const ciudadesDisponibles = [...new Set([...ciudadesCatalogo, ...ciudadesDesdeDatos])].sort((a, b) =>
    a.localeCompare(b, 'es-MX')
  );

  const ciudadCatalogo = (estadoCatalogo?.ciudades || []).find(
    (c) => String(c?.nombre || '').toLowerCase() === String(ciudad || '').toLowerCase()
  );
  const coloniasCatalogo = (ciudadCatalogo?.colonias || []).filter(Boolean);
  const coloniasDesdeDatos = [
    ...new Set(
      data
        .filter((p) => !estado || p.estado === estado)
        .filter((p) => !ciudad || p.ciudad === ciudad)
        .map((p) => p.colonia)
        .filter(Boolean)
    ),
  ];
  const coloniasDisponibles = [...new Set([...coloniasCatalogo, ...coloniasDesdeDatos])].sort((a, b) =>
    a.localeCompare(b, 'es-MX')
  );

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality will be handled by PropertyList component
  };

  const clearFilters = () => {
    setEstado('');
    setCiudad('');
    setColonia('');
    setCodigoPostal('');
    if (listingType === 'for_sale') {
      setMinPrice('');
      setMaxPrice('');
    } else {
      setMinRent('5000');
      setMaxRent('50000');
      setFurnished(false);
    }
    setSelectedAmenities([]);
    setSelectedServices([]);
    setSelectedFinancing([]);
    setSearchQuery('');
  };

  const hasFilters = listingType === 'for_sale' 
    ? (estado || ciudad || colonia || codigoPostal || minPrice || maxPrice || selectedAmenities.length || selectedServices.length || selectedFinancing.length)
    : (estado || ciudad || colonia || codigoPostal || minRent !== '5000' || maxRent !== '50000' || furnished || selectedAmenities.length || selectedServices.length);
  const activeFiltersCount = Object.values({
    estado,
    ciudad,
    colonia,
    codigoPostal,
    ...(listingType === 'for_sale'
      ? { minPrice, maxPrice }
      : {
          minRent: minRent !== '5000' ? minRent : '',
          maxRent: maxRent !== '50000' ? maxRent : '',
          furnished: furnished ? '1' : '',
        }),
  }).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero Section */}
      <section className="
        bg-gradient-to-br from-amber-50 to-yellow-50 
        dark:from-neutral-900 dark:to-neutral-800
        border-b border-neutral-200 dark:border-neutral-800
      ">
        <div className="container max-w-7xl py-12 sm:py-16">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="
              text-3xl sm:text-4xl 
              font-bold 
              text-neutral-900 dark:text-neutral-100
              mb-3
            ">
              Encuentra tu hogar ideal
            </h1>
            <p className="
              text-base sm:text-lg 
              text-neutral-600 dark:text-neutral-400
              mb-6
            ">
              {data.length} {data.length === 1 ? 'propiedad disponible' : 'propiedades disponibles'}
            </p>

            {/* Buy/Rent Tabs */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setListingType('for_sale')}
                className={`
                  px-6 py-2.5
                  font-semibold
                  rounded-lg
                  transition-all
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
                  ${listingType === 'for_sale'
                    ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-md'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:border-amber-400 dark:hover:border-amber-400'
                  }
                `}
              >
                Comprar
              </button>
              <button
                onClick={() => setListingType('for_rent')}
                className={`
                  px-6 py-2.5
                  font-semibold
                  rounded-lg
                  transition-all
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
                  ${listingType === 'for_rent'
                    ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-md'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:border-amber-400 dark:hover:border-amber-400'
                  }
                `}
              >
                Rentar
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ubicación, colonia o características..."
                className="
                  flex-1
                  px-4 py-3
                  bg-white dark:bg-neutral-900
                  border border-neutral-300 dark:border-neutral-700
                  rounded-lg
                  text-neutral-900 dark:text-neutral-100
                  placeholder:text-neutral-500
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                  text-base
                "
              />
              <button
                type="submit"
                className="
                  px-6 py-3
                  bg-gradient-to-br from-amber-400 to-yellow-600
                  hover:from-amber-500 hover:to-yellow-700
                  text-white
                  font-semibold
                  rounded-lg
                  transition-all
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
                  whitespace-nowrap
                "
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="container max-w-7xl py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="
              sticky top-8
              bg-white dark:bg-neutral-900
              border border-neutral-200 dark:border-neutral-800
              rounded-lg
              p-6
              space-y-6
            ">
              {/* Heading */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Filtros
                </h2>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="
                      text-xs 
                      text-amber-600 dark:text-amber-400
                      hover:text-amber-700 dark:hover:text-amber-300
                      font-medium
                    "
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Price Range Filter (For Sale) */}
              {listingType === 'for_sale' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Rango de precio
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="min-price" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        Mínimo
                      </label>
                      <input
                        id="min-price"
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="$ 0"
                        className="
                          w-full
                          px-3 py-2
                          bg-white dark:bg-neutral-950
                          border border-neutral-300 dark:border-neutral-700
                          rounded-md
                          text-sm
                          text-neutral-900 dark:text-neutral-100
                          placeholder:text-neutral-500
                          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                        "
                      />
                    </div>
                    <div>
                      <label htmlFor="max-price" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        Máximo
                      </label>
                      <input
                        id="max-price"
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="$ Sin límite"
                        className="
                          w-full
                          px-3 py-2
                          bg-white dark:bg-neutral-950
                          border border-neutral-300 dark:border-neutral-700
                          rounded-md
                          text-sm
                          text-neutral-900 dark:text-neutral-100
                          placeholder:text-neutral-500
                          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                        "
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Rent Range Filter (For Rent) */}
              {listingType === 'for_rent' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Rango de renta mensual
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="min-rent" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        Mínimo
                      </label>
                      <input
                        id="min-rent"
                        type="number"
                        value={minRent}
                        onChange={(e) => setMinRent(e.target.value)}
                        min="5000"
                        max="50000"
                        step="1000"
                        className="
                          w-full
                          px-3 py-2
                          bg-white dark:bg-neutral-950
                          border border-neutral-300 dark:border-neutral-700
                          rounded-md
                          text-sm
                          text-neutral-900 dark:text-neutral-100
                          placeholder:text-neutral-500
                          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                        "
                      />
                    </div>
                    <div>
                      <label htmlFor="max-rent" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        Máximo
                      </label>
                      <input
                        id="max-rent"
                        type="number"
                        value={maxRent}
                        onChange={(e) => setMaxRent(e.target.value)}
                        min="5000"
                        max="50000"
                        step="1000"
                        className="
                          w-full
                          px-3 py-2
                          bg-white dark:bg-neutral-950
                          border border-neutral-300 dark:border-neutral-700
                          rounded-md
                          text-sm
                          text-neutral-900 dark:text-neutral-100
                          placeholder:text-neutral-500
                          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                        "
                      />
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-500 text-center">
                      MXN {parseInt(minRent).toLocaleString('es-MX')} - {parseInt(maxRent).toLocaleString('es-MX')}
                    </div>
                  </div>
                </div>
              )}

              {/* Furnished Checkbox (For Rent Only) */}
              {listingType === 'for_rent' && (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={furnished}
                      onChange={(e) => setFurnished(e.target.checked)}
                      className="
                        w-4 h-4
                        text-amber-600
                        bg-white dark:bg-neutral-950
                        border-neutral-300 dark:border-neutral-700
                        rounded
                        focus:ring-2 focus:ring-amber-400 focus:ring-offset-0
                      "
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Solo amuebladas
                    </span>
                  </label>
                </div>
              )}

              {/* Services Filter */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Servicios incluidos
                </label>
                <div className="space-y-2">
                  {(listingType === 'for_rent' ? SERVICE_OPTIONS_RENT : SERVICE_OPTIONS_SALE).map((svc) => (
                    <label key={svc} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(svc)}
                        onChange={() => toggleFilter(setSelectedServices, selectedServices, svc)}
                        className="w-4 h-4 text-amber-600 bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-amber-400 focus:ring-offset-0"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{svc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities Filter */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Amenidades
                </label>
                <div className="space-y-2">
                  {AMENITY_OPTIONS.map((am) => (
                    <label key={am} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(am)}
                        onChange={() => toggleFilter(setSelectedAmenities, selectedAmenities, am)}
                        className="w-4 h-4 text-amber-600 bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-amber-400 focus:ring-offset-0"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{am}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Financing Filter (For Sale Only) */}
              {listingType === 'for_sale' && (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Formas de pago
                  </label>
                  <div className="space-y-2">
                    {FINANCING_OPTIONS.map((fin) => (
                      <label key={fin} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFinancing.includes(fin)}
                          onChange={() => toggleFilter(setSelectedFinancing, selectedFinancing, fin)}
                          className="w-4 h-4 text-amber-600 bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-amber-400 focus:ring-offset-0"
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{fin}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Area Filters */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Zona
                </label>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="estado-filter" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                      Estado
                    </label>
                    <select
                      id="estado-filter"
                      value={estado}
                      onChange={(e) => {
                        const nextEstado = e.target.value;
                        setEstado(nextEstado);
                        setCiudad('');
                        setColonia('');
                      }}
                      className="
                        w-full
                        px-3 py-2
                        bg-white dark:bg-neutral-950
                        border border-neutral-300 dark:border-neutral-700
                        rounded-md
                        text-sm
                        text-neutral-900 dark:text-neutral-100
                        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                      "
                    >
                      <option value="">Todos</option>
                      {estadosDisponibles.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ciudad-filter" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                      Ciudad
                    </label>
                    <select
                      id="ciudad-filter"
                      value={ciudad}
                      onChange={(e) => {
                        setCiudad(e.target.value);
                        setColonia('');
                      }}
                      disabled={!estado}
                      className="
                        w-full
                        px-3 py-2
                        bg-white dark:bg-neutral-950
                        border border-neutral-300 dark:border-neutral-700
                        rounded-md
                        text-sm
                        text-neutral-900 dark:text-neutral-100
                        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                        disabled:opacity-60
                      "
                    >
                      <option value="">Todas</option>
                      {ciudadesDisponibles.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="colonia-filter" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                      Colonia
                    </label>
                    <select
                      id="colonia-filter"
                      value={colonia}
                      onChange={(e) => setColonia(e.target.value)}
                      disabled={!estado || !ciudad}
                      className="
                        w-full
                        px-3 py-2
                        bg-white dark:bg-neutral-950
                        border border-neutral-300 dark:border-neutral-700
                        rounded-md
                        text-sm
                        text-neutral-900 dark:text-neutral-100
                        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                        disabled:opacity-60
                      "
                    >
                      <option value="">Todas</option>
                      {coloniasDisponibles.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cp-filter" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                      Código postal
                    </label>
                    <input
                      id="cp-filter"
                      type="text"
                      value={codigoPostal}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!/^\d{0,5}$/.test(value)) return;
                        setCodigoPostal(value);
                      }}
                      maxLength={5}
                      placeholder="Ej: 06700"
                      className="
                        w-full
                        px-3 py-2
                        bg-white dark:bg-neutral-950
                        border border-neutral-300 dark:border-neutral-700
                        rounded-md
                        text-sm
                        text-neutral-900 dark:text-neutral-100
                        placeholder:text-neutral-500
                        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Filtros
                  </h2>
                  <div className="flex items-center gap-3">
                    {hasFilters && (
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        {activeFiltersCount} filtro(s) activo(s)
                      </span>
                    )}
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>

                {/* Price Range Filter (For Sale) */}
                {listingType === 'for_sale' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                      Rango de precio
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="min-price-mobile" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                          Mínimo
                        </label>
                        <input
                          id="min-price-mobile"
                          type="number"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="$ 0"
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="max-price-mobile" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                          Máximo
                        </label>
                        <input
                          id="max-price-mobile"
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="$ Sin límite"
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Rent Range + Furnished (For Rent) */}
                {listingType === 'for_rent' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                        Rango de renta mensual
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="min-rent-mobile" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                            Mínimo
                          </label>
                          <input
                            id="min-rent-mobile"
                            type="number"
                            value={minRent}
                            onChange={(e) => setMinRent(e.target.value)}
                            min="5000"
                            max="50000"
                            step="1000"
                            className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="max-rent-mobile" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                            Máximo
                          </label>
                          <input
                            id="max-rent-mobile"
                            type="number"
                            value={maxRent}
                            onChange={(e) => setMaxRent(e.target.value)}
                            min="5000"
                            max="50000"
                            step="1000"
                            className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-500 text-center mt-2">
                        MXN {parseInt(minRent).toLocaleString('es-MX')} - {parseInt(maxRent).toLocaleString('es-MX')}
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={furnished}
                          onChange={(e) => setFurnished(e.target.checked)}
                          className="w-4 h-4 text-amber-600 bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-amber-400 focus:ring-offset-0"
                        />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Solo amuebladas
                        </span>
                      </label>
                    </div>
                  </>
                )}

                {/* Services Filter - Mobile */}
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Servicios incluidos
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(listingType === 'for_rent' ? SERVICE_OPTIONS_RENT : SERVICE_OPTIONS_SALE).map((svc) => (
                      <label key={svc} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(svc)}
                          onChange={() => toggleFilter(setSelectedServices, selectedServices, svc)}
                          className="w-4 h-4 text-amber-600 bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-amber-400 focus:ring-offset-0"
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{svc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amenities Filter - Mobile */}
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Amenidades
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {AMENITY_OPTIONS.map((am) => (
                      <label key={am} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(am)}
                          onChange={() => toggleFilter(setSelectedAmenities, selectedAmenities, am)}
                          className="w-4 h-4 text-amber-600 bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-amber-400 focus:ring-offset-0"
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{am}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Financing Filter - Mobile (For Sale Only) */}
                {listingType === 'for_sale' && (
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Formas de pago
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {FINANCING_OPTIONS.map((fin) => (
                        <label key={fin} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFinancing.includes(fin)}
                            onChange={() => toggleFilter(setSelectedFinancing, selectedFinancing, fin)}
                            className="w-4 h-4 text-amber-600 bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-amber-400 focus:ring-offset-0"
                          />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">{fin}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Area Filters */}
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Zona
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="estado-filter-mobile" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        Estado
                      </label>
                      <select
                        id="estado-filter-mobile"
                        value={estado}
                        onChange={(e) => {
                          const nextEstado = e.target.value;
                          setEstado(nextEstado);
                          setCiudad('');
                          setColonia('');
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      >
                        <option value="">Todos</option>
                        {estadosDisponibles.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="ciudad-filter-mobile" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        Ciudad
                      </label>
                      <select
                        id="ciudad-filter-mobile"
                        value={ciudad}
                        onChange={(e) => {
                          setCiudad(e.target.value);
                          setColonia('');
                        }}
                        disabled={!estado}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-60"
                      >
                        <option value="">Todas</option>
                        {ciudadesDisponibles.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="colonia-filter-mobile" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        Colonia
                      </label>
                      <select
                        id="colonia-filter-mobile"
                        value={colonia}
                        onChange={(e) => setColonia(e.target.value)}
                        disabled={!estado || !ciudad}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-60"
                      >
                        <option value="">Todas</option>
                        {coloniasDisponibles.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="cp-filter-mobile" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        Código postal
                      </label>
                      <input
                        id="cp-filter-mobile"
                        type="text"
                        value={codigoPostal}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!/^\d{0,5}$/.test(value)) return;
                          setCodigoPostal(value);
                        }}
                        maxLength={5}
                        placeholder="Ej: 06700"
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <PropertyList 
              listingType={listingType}
              searchQuery={searchQuery}
              estado={estado}
              ciudad={ciudad}
              colonia={colonia}
              codigoPostal={codigoPostal}
              minPrice={minPrice}
              maxPrice={maxPrice}
              minRent={minRent}
              maxRent={maxRent}
              furnished={furnished}
              selectedAmenities={selectedAmenities}
              selectedServices={selectedServices}
              selectedFinancing={selectedFinancing}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-neutral-500">Cargando...</div></div>}>
      <PropertiesContent />
    </Suspense>
  );
}
