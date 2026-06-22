import { NextResponse } from 'next/server';
import { deleteRowInSheet } from '@/lib/googleSheets';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetName = searchParams.get('sheetName');
    const keyColName = searchParams.get('keyColName');
    const keyVal = searchParams.get('keyVal');

    if (!sheetName || !keyColName || !keyVal) {
      return NextResponse.json({ detail: "Missing required query parameters" }, { status: 400 });
    }

    await deleteRowInSheet(sheetName, keyColName, keyVal);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
