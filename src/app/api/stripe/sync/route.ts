import { NextResponse } from "next/server";
import { syncStripeAll } from "@/server/stripeSync";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const accountId = url.searchParams.get("accountId") || "acct_1"; // replace with your connected account if needed
  const days = Number(url.searchParams.get("days") ?? "30");

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ ok: false, error: "Missing STRIPE_SECRET_KEY" }, { status: 400 });
  }

  try {
    const result = await syncStripeAll({ accountId, days });
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message ?? "Sync failed" }, { status: 500 });
  }
}
