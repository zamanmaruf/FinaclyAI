import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY!;
if (!apiKey) throw new Error("Missing STRIPE_SECRET_KEY");

export const stripe = new Stripe(apiKey, {
  apiVersion: "2025-09-30.clover",
  typescript: true,
  telemetry: false,
});
