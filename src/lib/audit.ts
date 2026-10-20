import "server-only";
import { getDb } from "@/db";
import { auditLogs, securityEvents } from "@/db/schema";
import { getClientFingerprint } from "./request";

export type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "login_locked"
  | "rate_limited"
  | "access_denied"
  | "password_changed"
  | "session_revoked"
  | "logout"
  | "inquiry_spam_blocked";

export async function logSecurityEvent(input: {
  type: SecurityEventType;
  email?: string | null;
  userId?: string | null;
  detail?: string;
}) {
  try {
    const { ipHash, userAgent } = await getClientFingerprint();
    await getDb()
      .insert(securityEvents)
      .values({
        type: input.type,
        email: input.email ?? null,
        userId: input.userId ?? null,
        detail: (input.detail ?? "").slice(0, 500),
        ipHash,
        userAgent,
      });
  } catch (err) {
    // Logging must never break the request that triggered it.
    console.error("[security-log] failed", err);
  }
}

export async function logAudit(
  actor: { id: string; email: string },
  action: string,
  entityType: string,
  entityId: string | null,
  summary: string,
) {
  try {
    const { ipHash } = await getClientFingerprint();
    await getDb()
      .insert(auditLogs)
      .values({ actorId: actor.id, actorEmail: actor.email, action, entityType, entityId, summary: summary.slice(0, 500), ipHash });
  } catch (err) {
    console.error("[audit-log] failed", err);
  }
}
