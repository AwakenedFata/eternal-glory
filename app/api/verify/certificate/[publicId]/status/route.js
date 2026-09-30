import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req, { params }) {
  try {
    const { publicId } = await params;
    if (!publicId) {
      return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const claimsCookie = cookieStore.get("eg_claims")?.value;
    let claims = {};
    try {
      if (claimsCookie) claims = JSON.parse(claimsCookie);
    } catch (e) {
      claims = {};
    }

    let token = null;
    for (const key in claims) {
      if (claims[key].publicId === publicId) {
        token = claims[key].token;
        break;
      }
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized access to certificate status" }, { status: 403 });
    }

    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
    if (!adminApiUrl) {
      return NextResponse.json({ error: "Admin API URL not configured" }, { status: 500 });
    }

    // Call Admin API securely Server-to-Server
    const res = await fetch(`${adminApiUrl}/certificates/${publicId}/status`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      // Ensure we don't cache polling requests
      cache: "no-store"
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: "Admin API error", details: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Status BFF error:", error);
    return NextResponse.json({ error: "Internal server error", details: error?.message || String(error) }, { status: 500 });
  }
}
