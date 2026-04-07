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
      reject(new Error("BX24 no está disponible"));
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
await debugSpaEnumFields(1062, [
  "UF_CRM_23_1775560905",
  "UF_CRM_23_1775560990",
]);

export function callBitrixMethod(method, params = {}) {
  return new Promise((resolve, reject) => {
    if (!hasBX24()) {
      reject(new Error("BX24 no está disponible"));
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

/**
 * Devuelve todos los campos del SPA
 * @param {number} entityTypeId
 */
export async function getSpaFields(entityTypeId) {
  if (!entityTypeId || Number(entityTypeId) <= 0) {
    throw new Error("entityTypeId no válido");
  }

  return await callBitrixMethod("crm.item.fields", {
    entityTypeId: Number(entityTypeId),
  });
}

/**
 * Busca la configuración de un campo UF_CRM_* y devuelve su config completa
 * @param {string} fieldName
 */
export async function getUserFieldConfig(fieldName) {
  if (!fieldName) {
    throw new Error("fieldName es obligatorio");
  }

  const configs = await callBitrixMethod("userfieldconfig.list", {
    moduleId: "crm",
    filter: {
      fieldName,
    },
  });

  const configId = configs?.[0]?.id;

  if (!configId) {
    throw new Error(`No se encontró configuración para el campo ${fieldName}`);
  }

  const detail = await callBitrixMethod("userfieldconfig.get", {
    id: configId,
  });

  return detail;
}

/**
 * Devuelve solo las opciones enum de un campo tipo lista
 * @param {string} fieldName
 */
export async function getFieldEnumOptions(fieldName) {
  const detail = await getUserFieldConfig(fieldName);
  return detail?.enum || [];
}

/**
 * Devuelve un mapa más cómodo:
 * {
 *   byId: { "123": {...}, "124": {...} },
 *   byValue: { "Disponible": {...}, "Asignado": {...} },
 *   raw: [...]
 * }
 * @param {string} fieldName
 */
export async function getFieldEnumMap(fieldName) {
  const options = await getFieldEnumOptions(fieldName);

  const byId = {};
  const byValue = {};

  for (const option of options) {
    const id = String(option.ID || option.id || option.XML_ID || "");
    const value = String(option.VALUE || option.value || "").trim();

    if (id) {
      byId[id] = option;
    }

    if (value) {
      byValue[value] = option;
    }
  }

  return {
    byId,
    byValue,
    raw: options,
  };
}

/**
 * Helper de debug para sacar por consola los enums de varios campos
 * @param {number} entityTypeId
 * @param {string[]} fieldNames
 */
export async function debugSpaEnumFields(entityTypeId, fieldNames = []) {
  try {
    const fields = await getSpaFields(entityTypeId);
    console.log("Campos del SPA:", fields);

    for (const fieldName of fieldNames) {
      try {
        const enumMap = await getFieldEnumMap(fieldName);
        console.log(`Enum del campo ${fieldName}:`, enumMap.raw);
      } catch (fieldError) {
        console.error(`Error leyendo enum de ${fieldName}:`, fieldError);
      }
    }

    return true;
  } catch (error) {
    console.error("Error en debugSpaEnumFields:", error);
    return false;
  }
}