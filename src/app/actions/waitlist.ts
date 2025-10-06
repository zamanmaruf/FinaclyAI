"use server";

import { z } from "zod";
import { db } from "@/server/db";

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  source: z.string().optional(),
});

export async function joinWaitlist(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const source = formData.get("source") as string || "unknown";

    const validatedData = waitlistSchema.parse({ email, source });

    // Check if email already exists
    const existingSignup = await db.waitlistSignup.findUnique({
      where: { email: validatedData.email },
    });

    if (existingSignup) {
      return { success: false, error: "This email is already on our waitlist!" };
    }

    // Create new signup
    await db.waitlistSignup.create({
      data: {
        email: validatedData.email,
        source: validatedData.source,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Invalid input" };
    }
    
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "This email is already on our waitlist!" };
    }

    console.error("Waitlist signup error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
