import type { GetServerSideProps, GetServerSidePropsContext } from "next"

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export function withAuth(gssp?: GetServerSideProps): GetServerSideProps {
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
    } catch {
      // backend unreachable - allow through so user can see cached UI
    }

    if (gssp) return gssp(ctx)
    return { props: {} }
  }
}
