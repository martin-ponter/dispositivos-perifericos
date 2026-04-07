import { callBitrixMethod } from "./methods";

export async function getCurrentBitrixUserRaw() {
  return await callBitrixMethod("user.current");
}

export function normalizeBitrixUser(rawUser) {
  if (!rawUser) return null;

  const id = Number(rawUser.ID || rawUser.id || 0);

  return {
    id,
    name:
      rawUser.NAME && rawUser.LAST_NAME
        ? `${rawUser.NAME} ${rawUser.LAST_NAME}`.trim()
        : rawUser.FULL_NAME || rawUser.NAME || rawUser.name || "Usuario",
    firstName: rawUser.NAME || "",
    lastName: rawUser.LAST_NAME || "",
    email: rawUser.EMAIL || rawUser.email || "",
    isPortalAdmin: isPortalAdmin(rawUser),
    raw: rawUser,
  };
}

export function isPortalAdmin(rawUser) {
  const values = [
    rawUser?.ADMIN,
    rawUser?.IS_ADMIN,
    rawUser?.admin,
    rawUser?.isAdmin,
  ];

  return values.some(
    (value) =>
      value === true ||
      value === "Y" ||
      value === "y" ||
      value === "true" ||
      value === 1
  );
}