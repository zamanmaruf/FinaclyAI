import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  throw new Error("FATAL: STRIPE_SECRET_KEY is required but not set in environment");
}

// Singleton Stripe client with explicit API version pinning for production stability
export const stripe = new Stripe(apiKey, {
  apiVersion: "2023-10-16", // Pin to stable version, update intentionally
  typescript: true,
  telemetry: false,
  maxNetworkRetries: 3,
  timeout: 30000,
});
