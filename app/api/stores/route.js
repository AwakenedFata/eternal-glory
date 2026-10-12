import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (uri) {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

export async function GET() {
  try {
    if (!clientPromise) {
      return NextResponse.json({ error: "MONGODB_URI is not set" }, { status: 500 });
    }
    const client = await clientPromise;
    const db = client.db();
    const stores = await db
      .collection("stores")
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .project({ name: 1, mark: 1, logoUrl: 1, storeUrl: 1, sortOrder: 1, isActive: 1 })
      .toArray();

    return NextResponse.json(
      { data: stores },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("API /api/stores error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
