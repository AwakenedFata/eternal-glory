import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    // CSRF / Origin Protection
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    
    // In production, enforce origin matching
    if (process.env.NODE_ENV === "production" && origin) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json({ error: "Invalid Origin" }, { status: 403 });
      }
    }

    const body = await req.json();
    const cookieStore = await cookies();
    const claimsCookie = cookieStore.get("eg_claims")?.value;
    let claims = {};
    try {
      if (claimsCookie) claims = JSON.parse(claimsCookie);
    } catch (e) {
      claims = {};
    }
    
    const claimToken = claims[body.code];

    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
    if (!adminApiUrl) {
      return NextResponse.json({ error: "Admin API URL not configured" }, { status: 500 });
    }

    // Forward to Admin API
    const res = await fetch(`${adminApiUrl}/verify`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Forwarded-For": req.headers.get("x-forwarded-for") || "",
        "User-Agent": req.headers.get("user-agent") || ""
      },
      body: JSON.stringify({ code: body.code, claimToken }),
    });

    const data = await res.json();
    const response = NextResponse.json(data);

    // If a new claim token is provided, update the cookie
    if (data.certificate?.claimToken) {
      claims[body.code] = {
        token: data.certificate.claimToken,
        publicId: data.certificate.publicId
      };
      
      response.cookies.set({
        name: "eg_claims",
        value: JSON.stringify(claims),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
      // Optionally remove it from the JSON payload being sent back to the browser for security
      delete data.certificate.claimToken;
    }

    return response;
  } catch (error) {
    console.error("Verification BFF error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
