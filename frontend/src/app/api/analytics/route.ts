import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/services';

export async function GET() {
  try {
    const data = await getAnalytics();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
