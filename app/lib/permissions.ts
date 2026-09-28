/**
 * Shared portal permission helpers.
 * Roles come from /api/me as role_name strings from the roles table.
 */

const CONTENT_ADMIN_ROLES = new Set([
  "hr",
  "sales/marketing",
  "sales",
  "marketing",
]);

export function normalizeRole(role: unknown): string {
  return String(role ?? "")
    .trim()
    .toLowerCase();
}

function hasContentAdminRole(roles: unknown): boolean {
  if (!Array.isArray(roles)) return false;
  return roles.some((role) => CONTENT_ADMIN_ROLES.has(normalizeRole(role)));
}

/** HR or Sales/Marketing may access Manage Portal + content admin tools. */
export function canManagePortal(roles: unknown): boolean {
  return hasContentAdminRole(roles);
}

/** HR or Sales/Marketing may create events. */
export function canCreateEvent(roles: unknown): boolean {
  return hasContentAdminRole(roles);
}

export function isHrRole(roles: unknown): boolean {
  if (!Array.isArray(roles)) return false;
  return roles.some((role) => normalizeRole(role) === "hr");
}
