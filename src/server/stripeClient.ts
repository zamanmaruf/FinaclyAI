import Stripe from "stripe";
import { env, isProductionMode } from "@/env";
import { db } from "./db";
import { decrypt } from "./crypto";

/**
 * Get Stripe client for the current tenant.
 * 
 * In production mode: uses Stripe Connect OAuth token from database
 * In internal mode: uses environment STRIPE_SECRET_KEY
 */
export async function getStripeClient(ownerId: string = '1'): Promise<Stripe> {
  if (isProductionMode()) {
    // Production mode: use Stripe Connect token from database
    const connection = await db.stripeConnect.findFirst({
      where: { ownerId },
      orderBy: { updatedAt: 'desc' },
    });
    
    if (!connection) {
      throw new Error('No Stripe Connect account linked. Please connect Stripe first.');
    }
    
    // Decrypt access token
    const accessToken = decrypt(connection.accessTokenEncrypted);
    
    return new Stripe(accessToken, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
      telemetry: false,
      maxNetworkRetries: 3,
      timeout: 30000,
    });
  } else {
    // Internal mode: use environment secret key
    return stripe;
  }
}

// Singleton Stripe client for internal mode (env-based key)
// Only used when PUBLIC_MODE=internal
const apiKey = env.STRIPE_SECRET_KEY;
if (!apiKey) {
  throw new Error("FATAL: STRIPE_SECRET_KEY is required but not set in environment");
}

export const stripe = new Stripe(apiKey, {
  apiVersion: "2024-11-20.acacia", // Pin to stable version, update intentionally
  typescript: true,
  telemetry: false,
  maxNetworkRetries: 3,
  timeout: 30000,
});
