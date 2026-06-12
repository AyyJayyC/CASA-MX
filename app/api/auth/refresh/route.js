const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function POST(request) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const backendRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const data = await backendRes.json();
    return Response.json(data, { status: backendRes.status });
  } catch {
    return Response.json({ success: false }, { status: 500 });
  }
}
