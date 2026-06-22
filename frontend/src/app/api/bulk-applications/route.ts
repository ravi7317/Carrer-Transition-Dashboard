import { NextResponse } from 'next/server';
import { readRowsFromSheet, upsertRowInSheet } from '@/lib/googleSheets';

export async function GET() {
  try {
    const data = await readRowsFromSheet("Bulk_Applications");
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const date = body.date;
    if (!date) {
      throw new Error("Date is required for bulk applications");
    }
    // We update the row if the date matches, or insert a new one
    const result = await upsertRowInSheet("Bulk_Applications", "date", date, body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
