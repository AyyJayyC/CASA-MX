import { useState, useRef, useCallback, useEffect } from "react"
import { Layout } from "@/components/layout/Layout"
import { Logo } from "@/components/ui/Logo"
import { SearchHero } from "@/components/home/SearchHero"
import { PropertyCarousel } from "@/components/home/PropertyCarousel"
import { useProperties, useCarousel, useMostViewed } from "@/lib/queries"
import type { PropertyFilters } from "@/types/property"

export default function HomePage() {
  const [filters, setFilters] = useState<PropertyFilters>({ limit: 8 })
  const [searchLabel, setSearchLabel] = useState("")
  const carouselsRef = useRef<HTMLDivElement>(null)

  const handleSearch = useCallback((f: PropertyFilters) => {
    setFilters({ ...f, limit: 8 })
    const parts: string[] = []
    if (f.ciudad) parts.push(f.ciudad)
    if (f.listingType === "for_sale") parts.push("en venta")
    else if (f.listingType === "for_rent") parts.push("en renta")
    setSearchLabel(parts.length ? "Mostrando: " + parts.join(" · ") : "")
  }, [])

  const handleSearchComplete = useCallback(() => {
    carouselsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const { data: carousel } = useCarousel()
  const activeSlides = carousel?.slides?.filter((s: { active: boolean }) => s.active) ?? []
  const [slideIndex, setSlideIndex] = useState(0)
  const heroSlide = activeSlides[slideIndex] ?? activeSlides[0]

  useEffect(() => {
    if (activeSlides.length <= 1) return
    const timer = setInterval(() => setSlideIndex((i) => (i + 1) % activeSlides.length), 5000)
    return () => clearInterval(timer)
  }, [activeSlides.length])

  const { data: trending, isLoading: trendingLoading } = useMostViewed(8)
  const { data: houses, isLoading: housesLoading } = useProperties({ ...filters, propertyType: "Casa", limit: 8 })
  const { data: apartments, isLoading: apartmentsLoading } = useProperties({ ...filters, propertyType: "Departamento", limit: 8 })
  const { data: recommended, isLoading: recommendedLoading } = useProperties({ limit: 8 })

  return (
    <Layout>
      <section className="relative h-[60vh] min-h-[400px] bg-clay-dark overflow-hidden">
        {heroSlide?.imageUrl && (
          <div
            className="absolute inset-0 bg-no-repeat bg-cover bg-center transition-opacity duration-1000"
            style={{ backgroundImage: `url(${heroSlide.imageUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-15" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.3\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4 gap-4">
          <Logo variant="white-lg" size="hero" showText={false} asLink={false} className="hidden sm:block" />
          <Logo variant="white-lg" size="xl" showText={false} asLink={false} className="sm:hidden" />
          <h1 className="text-3xl md:text-5xl font-bold text-center max-w-2xl leading-tight">
            Encuentra tu pr&oacute;ximo hogar en M&eacute;xico
          </h1>
          <SearchHero onSearch={handleSearch} onSearchComplete={handleSearchComplete} />
        </div>
      </section>

      <div ref={carouselsRef}>
        {searchLabel && (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <div className="inline-flex items-center gap-2 bg-clay/10 text-clay px-4 py-2 rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              {searchLabel}
              <button onClick={() => { setFilters({ limit: 8 }); setSearchLabel("") }} className="ml-1 hover:bg-clay/20 rounded-full p-0.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}

        <PropertyCarousel
        title={"\uD83D\uDD25 Tendencias"}
        properties={trending?.properties ?? []}
        loading={trendingLoading}
        emptyMessage="Sin tendencias aún"
      />
      <PropertyCarousel
        title={"\uD83C\uDFE1 Casas"}
        properties={houses?.data ?? []}
        loading={housesLoading}
        emptyMessage="No hay casas disponibles"
      />
      <PropertyCarousel
        title={"\uD83C\uDFE2 Departamentos"}
        properties={apartments?.data ?? []}
        loading={apartmentsLoading}
        emptyMessage="No hay departamentos disponibles"
      />
      <PropertyCarousel
        title={"\u2B50 Recomendado para ti"}
        properties={recommended?.data ?? []}
        loading={recommendedLoading}
        emptyMessage="Explora nuestras propiedades"
      />
      </div>
    </Layout>
  )
}
