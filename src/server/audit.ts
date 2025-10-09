/**
 * Audit Logging System
 * Tracks all critical actions for compliance and debugging
 */

import { prisma } from './db';

export type AuditAction =
  | 'STRIPE_SYNC'
  | 'PLAID_SYNC'
  | 'QBO_SYNC'
  | 'MATCH_RUN'
  | 'QBO_DEPOSIT_CREATED'
  | 'QBO_DEPOSIT_UPDATED'
  | 'EXCEPTION_CREATED'
  | 'EXCEPTION_RESOLVED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'SETTINGS_UPDATED'
  | 'SYNC_STARTED'
  | 'SYNC_COMPLETED'
  | 'FIX_EXECUTED';

export type AuditStatus = 'SUCCESS' | 'FAILURE' | 'PENDING';

interface AuditLogParams {
  action: AuditAction;
  resource?: string; // e.g., "payout:po_123", "exception:ex_456"
  status: AuditStatus;
  userId?: string;
  ownerId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: AuditLogParams) {
  try {
    const log = await prisma.auditLog.create({
      data: {
        action: params.action,
        resource: params.resource || null,
        status: params.status,
        userId: params.userId || null,
        ownerId: params.ownerId || null,
        metadata: params.metadata || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
    
    return log;
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('[AuditLog] Failed to create audit log:', error);
    return null;
  }
}

/**
 * Convenience wrapper for successful actions
 */
export async function logSuccess(
  action: AuditAction,
  resource?: string,
  metadata?: Record<string, any>
) {
  return createAuditLog({
    action,
    resource,
    status: 'SUCCESS',
    metadata,
  });
}

/**
 * Convenience wrapper for failed actions
 */
export async function logFailure(
  action: AuditAction,
  error: Error | string,
  resource?: string
) {
  return createAuditLog({
    action,
    resource,
    status: 'FAILURE',
    metadata: {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    },
  });
}

/**
 * Get recent audit logs
 */
export async function getRecentAuditLogs(limit: number = 100) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get audit logs for a specific action
 */
export async function getAuditLogsByAction(action: AuditAction, limit: number = 50) {
  return prisma.auditLog.findMany({
    where: { action },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get audit logs for a specific resource
 */
export async function getAuditLogsByResource(resource: string) {
  return prisma.auditLog.findMany({
    where: { resource },
    orderBy: { createdAt: 'desc' },
  });
}

