/**
 * Shared portal permission helpers.
 * Roles come from /api/me as role_name strings from the roles table.
 */

const MANAGE_PORTAL_ROLES = new Set(["hr", "marketing"]);

export function normalizeRole(role: unknown): string {
  return String(role ?? "")
    .trim()
    .toLowerCase();
}

/** HR or Marketing may access Manage Portal + content admin tools. */
export function canManagePortal(roles: unknown): boolean {
  if (!Array.isArray(roles)) return false;
  return roles.some((role) => MANAGE_PORTAL_ROLES.has(normalizeRole(role)));
}

export function isHrRole(roles: unknown): boolean {
  if (!Array.isArray(roles)) return false;
  return roles.some((role) => normalizeRole(role) === "hr");
}
