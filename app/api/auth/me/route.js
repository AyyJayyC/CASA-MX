const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(request) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const backendRes = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Cookie: cookie },
    });

    const data = await backendRes.json();
    return Response.json(data, { status: backendRes.status });
  } catch {
    return Response.json({ user: null }, { status: 401 });
  }
}
