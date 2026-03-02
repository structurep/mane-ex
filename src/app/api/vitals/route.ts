import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log(
      "[web-vital]",
      JSON.stringify({
        name: body.name,
        value: body.value,
        rating: body.rating,
        delta: body.delta,
        id: body.id,
        navigationType: body.navigationType,
        pathname: body.pathname,
        timestamp: body.timestamp,
      })
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
