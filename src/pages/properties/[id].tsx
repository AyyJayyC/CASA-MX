import { useRouter } from "next/router"
import { useState } from "react"
import { useProperty, useMakeOffer, useCreateApplication } from "@/lib/queries"
import { Layout } from "@/components/layout/Layout"
import { FullBleedHero } from "@/components/property/FullBleedHero"
import { PropertyStats } from "@/components/property/PropertyStats"
import { PropertyDescription } from "@/components/property/PropertyDescription"
import { ContactOwner } from "@/components/property/ContactOwner"
import { MapPreview } from "@/components/property/MapPreview"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { formatPrice } from "@/lib/format"
import type { GetServerSideProps } from "next"

const FINANCING_OPTIONS = [
  { value: "cash", label: "Efectivo" },
  { value: "bankLoan", label: "Crédito bancario" },
  { value: "INFONAVIT", label: "INFONAVIT" },
  { value: "FOVISSSTE", label: "FOVISSSTE" },
  { value: "paymentPlan", label: "Plan de pagos" },
  { value: "other", label: "Otro" },
]

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} }
}

export default function PropertyDetailPage() {
  const router = useRouter()
  const { id } = router.query as { id: string }
  const { data, isLoading } = useProperty(id)
  const makeOffer = useMakeOffer()
  const createApplication = useCreateApplication()
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerAmount, setOfferAmount] = useState("")
  const [offerDeposit, setOfferDeposit] = useState("")
  const [offerMessage, setOfferMessage] = useState("")
  const [financing, setFinancing] = useState("cash")
  const [enganche, setEnganche] = useState("")
  const [plazoMeses, setPlazoMeses] = useState("")
  const [cuotaMensual, setCuotaMensual] = useState("")
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [buyerPhone, setBuyerPhone] = useState("")
  const [offerSent, setOfferSent] = useState(false)
  const [offerSending, setOfferSending] = useState(false)
  const [leaseTerm, setLeaseTerm] = useState("12")

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-[50vh] bg-sand-light rounded-2xl" />
            <div className="h-8 bg-sand-light rounded w-1/2" />
            <div className="h-4 bg-sand-light/70 rounded w-3/4" />
          </div>
        </div>
      </Layout>
    )
  }

  const property = data?.data
  if (!property) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <p className="text-6xl mb-4">\uD83D\uDC4B</p>
          <h2 className="text-2xl font-bold text-ink mb-2">Propiedad no encontrada</h2>
          <p className="text-ink-muted">Esta propiedad no existe o no está disponible.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <FullBleedHero property={property} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <PropertyStats property={property} />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PropertyDescription property={property} />

            {property.imageUrls && property.imageUrls.length > 1 && (
              <div>
                <h2 className="text-lg font-semibold text-ink mb-3">Galería</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.imageUrls.map((url, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg bg-sand-light overflow-hidden">
                      <img src={url} alt={`${property.title} ${i + 2}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-ink mb-3">Ubicación</h2>
              <MapPreview property={property} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white border border-sand-dark/30 rounded-2xl p-6 text-center">
                <p className="text-2xl font-bold text-clay">
                  {property.listingType === "for_rent"
                    ? `$${property.monthlyRent?.toLocaleString()}/mes`
                    : `$${property.price?.toLocaleString()}`}
                </p>
                <p className="text-sm text-ink-muted mt-1">
                  {property.listingType === "for_sale" ? "Precio de venta" : "Renta mensual"}
                </p>
              </div>

              {!showOfferForm && !offerSent ? (
                <Button
                  className="w-full"
                  variant="primary"
                  onClick={() => setShowOfferForm(true)}
                >
                  {property.listingType === "for_rent" ? "Solicitar renta" : "Hacer oferta"}
                </Button>
              ) : offerSent ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                  <p className="text-2xl mb-2">\u2705</p>
                  <p className="font-semibold text-green-800 text-sm">
                    {property.listingType === "for_rent" ? "Solicitud enviada" : "Oferta enviada"}
                  </p>
                  <p className="text-green-700 text-xs mt-1">
                    El propietario revisará tu {property.listingType === "for_rent" ? "solicitud" : "oferta"} y te notificará.
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-sand-dark/30 rounded-2xl p-5 space-y-3 max-h-[50vh] overflow-y-auto">
                  <h3 className="font-semibold text-ink text-sm">
                    {property.listingType === "for_rent" ? "Solicitud de renta" : "Hacer oferta"}
                  </h3>

                  {property.listingType === "for_sale" && (
                    <div className="bg-sand-light/50 rounded-lg p-3 text-sm">
                      <p className="text-ink-muted">Precio de venta:</p>
                      <p className="text-lg font-bold text-clay">{formatPrice(property.price)}</p>
                    </div>
                  )}

                  {property.listingType === "for_rent" && (
                    <div className="bg-sand-light/50 rounded-lg p-3 text-sm">
                      <p className="text-ink-muted">Renta actual:</p>
                      <p className="text-lg font-bold text-clay">${property.monthlyRent?.toLocaleString()}/mes</p>
                    </div>
                  )}

                  <Input label="Tu nombre" placeholder="Juan Pérez" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required />
                  <Input label="Correo electrónico" type="email" placeholder="tu@email.com" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} required />
                  <Input label="Teléfono" placeholder="5512345678" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} required minLength={10} />

                  {property.listingType === "for_sale" ? (
                    <>
                      <Input
                        label="Monto de la oferta (MXN)"
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        required
                      />
                      <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">Financiamiento</label>
                        <select value={financing} onChange={(e) => setFinancing(e.target.value)} className="w-full rounded-lg border border-sand-dark/30 bg-white px-4 py-2.5 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay">
                          {FINANCING_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                      </div>

                      {financing === "paymentPlan" && (
                        <div className="grid grid-cols-2 gap-3 bg-sand-light/30 rounded-lg p-3">
                          <Input label="Enganche (MXN)" type="number" value={enganche} onChange={(e) => setEnganche(e.target.value)} />
                          <Input label="Plazo (meses)" type="number" value={plazoMeses} onChange={(e) => setPlazoMeses(e.target.value)} />
                          <Input label="Cuota mensual" type="number" value={cuotaMensual} onChange={(e) => setCuotaMensual(e.target.value)} />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Input
                        label="Renta mensual ofrecida (MXN)"
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        required
                      />
                      <Input
                        label="Depósito ofrecido (MXN)"
                        type="number"
                        value={offerDeposit}
                        onChange={(e) => setOfferDeposit(e.target.value)}
                      />
                      <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">Duración del contrato</label>
                        <select value={leaseTerm} onChange={(e) => setLeaseTerm(e.target.value)} className="w-full rounded-lg border border-sand-dark/30 bg-white px-4 py-2.5 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay">
                          <option value="6">6 meses</option>
                          <option value="12">12 meses</option>
                          <option value="24">24 meses</option>
                          <option value="36">36 meses</option>
                        </select>
                      </div>
                    </>
                  )}

                  <Input
                    label="Mensaje (opcional)"
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="Me interesa esta propiedad..."
                  />

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      loading={offerSending}
                      onClick={async () => {
                        setOfferSending(true)
                        try {
                          if (property.listingType === "for_rent") {
                            await createApplication.mutateAsync({
                              propertyId: property.id,
                              fullName: buyerName,
                              email: buyerEmail,
                              phone: buyerPhone,
                              employer: "",
                              jobTitle: "",
                              monthlyIncome: 0,
                              employmentDuration: "1 año",
                              desiredMoveInDate: new Date().toISOString(),
                              desiredLeaseTerm: Number(leaseTerm) || 12,
                              numberOfOccupants: 1,
                              reference1Name: "N/A",
                              reference1Phone: "5512345678",
                              offeredMonthlyRent: Number(offerAmount) || undefined,
                              messageToLandlord: offerMessage || undefined,
                            })
                          } else {
                            const body: Record<string, unknown> = {
                              propertyId: property.id,
                              offerAmount: Number(offerAmount),
                              financing,
                              buyerName,
                              buyerEmail,
                              buyerPhone,
                              message: offerMessage || undefined,
                            }
                            if (financing === "paymentPlan") {
                              if (enganche) body.enganche = Number(enganche)
                              if (plazoMeses) body.plazoMeses = Number(plazoMeses)
                              if (cuotaMensual) body.cuotaMensual = Number(cuotaMensual)
                            }
                            await makeOffer.mutateAsync(body)
                          }
                          setShowOfferForm(false)
                          setOfferSent(true)
                        } catch {}
                        finally { setOfferSending(false) }
                      }}
                    >
                      Enviar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowOfferForm(false)}>Cancelar</Button>
                  </div>
                </div>
              )}

              <ContactOwner property={property} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
