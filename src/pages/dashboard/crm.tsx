import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { CRMBoard } from "@/components/dashboard/CRMBoard"
import { BuyerManager } from "@/components/dashboard/BuyerManager"
import Link from "next/link"

export const getServerSideProps = withAuth()

export default function CRMPage() {
  return (
    <Layout>
      <div className="max-w-full mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-ink">Pipeline CRM</h1>
          <Link href="/dashboard" className="text-sm text-clay hover:text-clay-dark">&larr; Panel</Link>
        </div>

        <section className="mb-10">
          <CRMBoard />
        </section>

        <section className="max-w-3xl">
          <BuyerManager />
        </section>
      </div>
    </Layout>
  )
}
