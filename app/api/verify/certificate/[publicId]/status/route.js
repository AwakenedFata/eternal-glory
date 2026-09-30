import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { publicId } = await params;
    if (!publicId) {
      return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
    }

    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
    if (!adminApiUrl) {
      return NextResponse.json({ error: "Admin API URL not configured" }, { status: 500 });
    }

    const secret = process.env.INTERNAL_SERVICE_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Service secret not configured" }, { status: 500 });
    }

    // Use INTERNAL_SERVICE_SECRET for server-to-server auth
    // This is a trusted BFF route running on Vercel, not exposed to the browser
    const res = await fetch(`${adminApiUrl}/certificates/${publicId}/status`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${secret}`
      },
      cache: "no-store"
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[BFF Status] Admin API error:", res.status, errorText);
      return NextResponse.json({ error: "Admin API error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Status BFF error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
