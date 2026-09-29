import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  const data = await req.json();
  fs.appendFileSync(path.join(process.cwd(), 'perf.log'), JSON.stringify(data) + '\n');
  return NextResponse.json({ success: true });
}
