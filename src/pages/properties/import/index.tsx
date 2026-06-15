import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { useState } from "react"
import Link from "next/link"

export const getServerSideProps = withAuth()

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [importing, setImporting] = useState(false)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const MAX_SIZE = 5 * 1024 * 1024
    if (f.type !== "text/csv" && f.type !== "application/vnd.ms-excel" && !f.name.endsWith(".csv")) return
    if (f.size > MAX_SIZE) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const rows = text.split("\n").slice(0, 6).map((r) => r.split(",").map((c) => c.trim().replace(/^"|"$/g, "")))
      setPreview(rows)
    }
    reader.readAsText(f)
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-6">Importar propiedades</h1>

        <div className="bg-white border border-sand-dark/30 rounded-2xl p-8">
          {!file ? (
            <div className="text-center">
              <p className="text-5xl mb-4">\uD83D\uDCC4</p>
              <h2 className="text-xl font-semibold text-ink mb-2">Arrastra tu archivo CSV</h2>
              <p className="text-ink-muted text-sm mb-6">
                Columnas esperadas: title, price, listingType, estado, ciudad, propertyType, bedrooms, bathrooms, squareMeters, description
              </p>
              <label className="inline-block px-6 py-3 bg-clay text-white font-medium rounded-lg hover:bg-clay-dark cursor-pointer transition-colors">
                Seleccionar archivo
                <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">{file.name}</p>
                <button onClick={() => { setFile(null); setPreview([]) }} className="text-sm text-ink-muted hover:text-ink">Cambiar</button>
              </div>

              {preview.length > 0 && (
                <div className="overflow-x-auto border border-sand-dark/20 rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-sand-light/50">
                        {preview[0].map((h, i) => <th key={i} className="px-3 py-2 text-left font-medium text-ink">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(1).map((row, ri) => (
                        <tr key={ri} className="border-t border-sand-dark/10">
                          {row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-ink-light">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-xs text-ink-muted">Vista previa: primeras {preview.length - 1} filas de {preview.length > 0 ? "??" : "0"}.</p>

              <Button disabled className="w-full opacity-50 cursor-not-allowed">
                Importación masiva próximamente
              </Button>
            </div>
          )}
        </div>

        <Link href="/dashboard/properties" className="block mt-4 text-sm text-clay hover:text-clay-dark">&larr; Mis propiedades</Link>
      </div>
    </Layout>
  )
}
