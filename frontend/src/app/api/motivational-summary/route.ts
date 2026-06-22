import { NextResponse } from 'next/server';
import { getAnalytics, generateMotivationalSummary } from '@/lib/services';

export async function GET() {
  try {
    const analytics = await getAnalytics();
    const summary = await generateMotivationalSummary(analytics);
    return NextResponse.json({ summary });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
