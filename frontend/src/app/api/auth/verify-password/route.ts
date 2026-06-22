import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const correctPassword = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || 'switch2026';
    
    if (body.password === correctPassword) {
      return NextResponse.json({ detail: "Authorized" });
    } else {
      return NextResponse.json({ detail: "Invalid password" }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
