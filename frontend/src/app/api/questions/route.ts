import { NextResponse } from 'next/server';
import { readRowsFromSheet, upsertRowInSheet, getNextId } from '@/lib/googleSheets';

export async function GET() {
  try {
    const data = await readRowsFromSheet("Interview_Questions");
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let id = body.id;
    if (!id) {
      id = await getNextId("Interview_Questions");
      body.id = id;
    }
    const result = await upsertRowInSheet("Interview_Questions", "id", id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
