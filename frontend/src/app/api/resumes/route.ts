import { NextResponse } from 'next/server';
import { readRowsFromSheet, upsertRowInSheet, getNextId } from '@/lib/googleSheets';

export async function GET() {
  try {
    const data = await readRowsFromSheet("Resumes");
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
      id = await getNextId("Resumes");
      body.id = id;
    }
    const result = await upsertRowInSheet("Resumes", "id", id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
