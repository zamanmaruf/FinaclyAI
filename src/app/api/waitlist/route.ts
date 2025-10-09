import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { env } from "@/env";

export async function POST(req: Request) {
  try {
    const { name, company, email, source } = await req.json();
    
    // Validate required fields
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
    }
    
    if (!company || company.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Company name is required" }, { status: 400 });
    }

    // Check if email already exists
    const existingSignup = await db.waitlistSignup.findUnique({
      where: { email },
    });

    if (existingSignup) {
      return NextResponse.json({ ok: false, error: "This email is already on our waitlist!" }, { status: 400 });
    }

    // Create new signup
    const signup = await db.waitlistSignup.create({
      data: {
        name: name.trim(),
        company: company.trim(),
        email: email.trim().toLowerCase(),
        source: source || "landing_page",
      },
    });

    console.log('[waitlist] ✅ New signup:', email, 'from', company);

    // Send email notification (if Resend is configured)
    if (env.RESEND_API_KEY) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'FinaclyAI <noreply@finacly.ai>',
            to: env.NOTIFICATION_EMAIL,
            subject: `New Waitlist Signup: ${company}`,
            html: `
              <h2>New Waitlist Signup</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Company:</strong> ${company}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Signed up:</strong> ${new Date().toLocaleString()}</p>
            `,
          }),
        });

        if (emailResponse.ok) {
          console.log('[waitlist] ✅ Email notification sent');
        } else {
          console.warn('[waitlist] ⚠️  Email notification failed');
        }
      } catch (emailError) {
        console.warn('[waitlist] ⚠️  Email error:', emailError);
        // Don't fail the signup if email fails
      }
    } else {
      console.log('[waitlist] ℹ️  Email notifications not configured (RESEND_API_KEY not set)');
    }

    return NextResponse.json({ ok: true, id: signup.id });
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}