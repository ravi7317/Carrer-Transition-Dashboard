import { NextResponse } from 'next/server';
import { readRowsFromSheet, upsertRowInSheet } from '@/lib/googleSheets';

export async function GET() {
  try {
    const data = await readRowsFromSheet("Daily_Progress");
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.date) {
      return NextResponse.json({ detail: "Date is required" }, { status: 400 });
    }
    const result = await upsertRowInSheet("Daily_Progress", "date", body.date, body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
