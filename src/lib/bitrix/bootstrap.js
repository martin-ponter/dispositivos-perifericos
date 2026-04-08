export function hasBX24() {
  return typeof window !== "undefined" && typeof window.BX24 !== "undefined";
}

export function getQueryParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URL(window.location.href).searchParams;
}

export function isInsideBitrix() {
  if (typeof window === "undefined") return false;

  const params = getQueryParams();
  const knownParams = [
    "DOMAIN",
    "AUTH_ID",
    "AUTH_EXPIRES",
    "APP_SID",
    "PLACEMENT",
    "PROTOCOL",
    "LANG",
    "member_id",
  ];

  return hasBX24() || knownParams.some((key) => params.has(key));
}

export function isInstallMode() {
  const params = getQueryParams();

  const placement = (params.get("PLACEMENT") || "").toLowerCase();
  const installFlag = (params.get("install") || "").toLowerCase();

  return (
    placement.includes("install") ||
    installFlag === "y" ||
    installFlag === "yes" ||
    installFlag === "true" ||
    installFlag === "1"
  );
}

export function initBitrix() {
  return new Promise((resolve, reject) => {
    if (!hasBX24()) {
      reject(new Error("BX24 no esta disponible"));
      return;
    }

    try {
      window.BX24.init(() => {
        resolve(window.BX24);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function callBitrixMethod(method, params = {}) {
  return new Promise((resolve, reject) => {
    if (!hasBX24()) {
      reject(new Error("BX24 no esta disponible"));
      return;
    }

    window.BX24.callMethod(method, params, function (result) {
      if (result.error()) {
        reject(result.error());
        return;
      }

      resolve(result.data());
    });
  });
}

export async function getSpaFields(entityTypeId) {
  if (!entityTypeId || Number(entityTypeId) <= 0) {
    throw new Error("entityTypeId no valido");
  }

  return await callBitrixMethod("crm.item.fields", {
    entityTypeId: Number(entityTypeId),
  });
}
