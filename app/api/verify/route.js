import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { getClientIp } from "@/lib/geolocation/get-client-ip";
import { geolocateIP } from "@/lib/geolocation/service";

export async function POST(req) {
  try {
    // CSRF / Origin Protection
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    
    // In production, enforce origin matching
    if (process.env.NODE_ENV === "production" && origin) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json({ error: "Invalid Origin", details: `Origin ${originHost} !== ${host}` }, { status: 403 });
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
    
    const claimObj = claims[body.code];
    const claimToken = claimObj?.token || (typeof claimObj === 'string' ? claimObj : null);

    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
    if (!adminApiUrl) {
      return NextResponse.json({ error: "Admin API URL not configured" }, { status: 500 });
    }

    // 1. Geolocate on the trusted Public Server boundary
    let ip, location;
    try {
      ip = getClientIp(req);
      location = await geolocateIP(ip);
    } catch (e) {
      throw new Error("Geolocation failed: " + e.message);
    }
    
    const payload = {
      code: body.code,
      claimToken,
      verificationContext: {
        location: location || {
          displayName: "Unknown Location",
          source: "NONE",
          status: "UNRESOLVED",
          reason: "NO_RECORD"
        }
      }
    };
    
    const payloadString = JSON.stringify(payload);

    // 2. Sign the request
    const secret = process.env.INTERNAL_SERVICE_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "INTERNAL_SERVICE_SECRET is missing" }, { status: 500 });
    }

    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const method = "POST";
    const path = "/api/public/verify"; // Target path on Admin
    const bodyHash = crypto.createHash('sha256').update(payloadString).digest('hex');
    
    const canonicalString = `${method}\n${path}\n${timestamp}\n${nonce}\n${bodyHash}`;
    const signature = crypto.createHmac('sha256', secret).update(canonicalString).digest('hex');

    // 3. Forward to Admin API with Authentication
    let res;
    try {
      res = await fetch(`${adminApiUrl}/verify`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Internal-Timestamp": timestamp,
          "X-Internal-Nonce": nonce,
          "X-Internal-Signature": signature,
          "User-Agent": req.headers.get("user-agent") || ""
        },
        body: payloadString,
      });
    } catch (e) {
      throw new Error(`Fetch to Admin API failed: ${e.message}`);
    }

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Admin API returned invalid JSON. Status: ${res.status}. Body: ${text.substring(0, 200)}`);
    }

    // If Admin API explicitly returns an error status without catching it correctly
    if (!res.ok) {
      // Return the error from Admin API but keep it as 200/400 to let frontend parse it
      // Wait, we should forward the status.
      return NextResponse.json(data, { status: res.status });
    }

    const response = NextResponse.json(data);

        // If a new claim token is provided, update the cookie
    if (data.certificate?.claimToken) {
      claims[body.code] = {
        token: data.certificate.claimToken,
        publicId: data.certificate.publicId,
        timestamp: Date.now()
      };
      
      // Limit to 5 most recent claims to prevent 4096-byte cookie overflow
      const claimKeys = Object.keys(claims);
      if (claimKeys.length > 5) {
        const sortedKeys = claimKeys.sort((a, b) => {
          return (claims[b].timestamp || 0) - (claims[a].timestamp || 0);
        });
        const newClaims = {};
        for (let i = 0; i < 5; i++) {
          newClaims[sortedKeys[i]] = claims[sortedKeys[i]];
        }
        claims = newClaims;
      }
      
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
    return NextResponse.json({ error: "Internal server error", details: error?.message || String(error) }, { status: 500 });
  }
}
