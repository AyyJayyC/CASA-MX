import type { GetServerSideProps, GetServerSidePropsContext } from "next"

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export function withAdmin(gssp?: GetServerSideProps): GetServerSideProps {
  return async (ctx: GetServerSidePropsContext) => {
    const token = ctx.req.cookies.token || null
    if (!token) {
      return { redirect: { destination: "/login?redirect=" + encodeURIComponent(ctx.resolvedUrl), permanent: false } }
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        return { redirect: { destination: "/login?redirect=" + encodeURIComponent(ctx.resolvedUrl), permanent: false } }
      }
      const { user } = await res.json() as { user?: { roles?: Array<{ roleName: string; status: string }> } }
      const roles = user?.roles ?? []
      const isAdmin = roles.some((r) => r.status === "approved" && r.roleName === "admin")
      if (!isAdmin) {
        return { redirect: { destination: "/dashboard", permanent: false } }
      }
    } catch {
      return { redirect: { destination: "/dashboard", permanent: false } }
    }

    if (gssp) return gssp(ctx)
    return { props: {} }
  }
}
