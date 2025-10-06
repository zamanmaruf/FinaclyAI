import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    // Check if email already exists
    const existingSignup = await db.waitlistSignup.findUnique({
      where: { email },
    });

    if (existingSignup) {
      return NextResponse.json({ ok: false, error: "This email is already on our waitlist!" }, { status: 400 });
    }

    // Create new signup
    await db.waitlistSignup.create({
      data: {
        email,
        source: source || "api",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}