import { BITRIX_APP_CONFIG } from "../../config/bitrixConfig";

export function getBitrixItemCollection(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.item)) return response.item;
  if (Array.isArray(response?.result?.items)) return response.result.items;
  return [];
}

export function getBitrixFieldValue(item, fieldName) {
  return item?.[fieldName] ?? item?.fields?.[fieldName] ?? "";
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function getHistoryTimestampParts(date = new Date()) {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  const hours = padDatePart(date.getHours());
  const minutes = padDatePart(date.getMinutes());
  const seconds = padDatePart(date.getSeconds());

  return {
    date: `${year}-${month}-${day}`,
    dateTime: `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`,
    timeLabel: `${hours}:${minutes}`,
  };
}

function normalizeEmployeeValue(value) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function normalizeTextValue(value) {
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : undefined;
}

export function mapAssetTypeToHistoryEnum(assetTypeId) {
  const sourceEntries = Object.entries(BITRIX_APP_CONFIG.ENUMS.TIPO_ACTIVO);
  const targetEntries = BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_ACTIVO;

  const matchedEntry = sourceEntries.find(([, value]) => String(value) === String(assetTypeId));
  if (!matchedEntry) {
    return "";
  }

  return targetEntries[matchedEntry[0]] || "";
}

export function mapStateToHistoryEnum(stateId, fieldKey) {
  const sourceEntries = Object.entries(BITRIX_APP_CONFIG.ENUMS.ESTADO);
  const targetEntries = BITRIX_APP_CONFIG.HISTORY.ENUMS[fieldKey] || {};
  const matchedEntry = sourceEntries.find(([, value]) => String(value) === String(stateId));

  if (!matchedEntry) {
    return "";
  }

  return targetEntries[matchedEntry[0]] || "";
}

export function buildHistoryMovementFields(asset, action) {
  const timestamp = getHistoryTimestampParts(action.movedAt);
  const fields = {
    [BITRIX_APP_CONFIG.HISTORY.FIELDS.ID_INTERNO_ACTIVO]:
      normalizeTextValue(action.idInternoActivo || asset.idInterno) || "",
    [BITRIX_APP_CONFIG.HISTORY.FIELDS.ID_ITEM_ACTIVO]:
      normalizeTextValue(action.idItemActivo || asset.itemId) || "",
    [BITRIX_APP_CONFIG.HISTORY.FIELDS.NUMERO_SERIE]:
      normalizeTextValue(action.serialNumber || asset.serialNumber) || "",
    [BITRIX_APP_CONFIG.HISTORY.FIELDS.MARCA]:
      normalizeTextValue(action.brand || asset.brand) || "",
    [BITRIX_APP_CONFIG.HISTORY.FIELDS.MODELO]:
      normalizeTextValue(action.model || asset.model) || "",
    [BITRIX_APP_CONFIG.HISTORY.FIELDS.TIPO_ACTIVO]:
      String(action.assetTypeId || mapAssetTypeToHistoryEnum(asset.typeId) || ""),
    [BITRIX_APP_CONFIG.HISTORY.FIELDS.TIPO_MOVIMIENTO]: String(
      action.movementTypeId || ""
    ),
    [BITRIX_APP_CONFIG.HISTORY.FIELDS.FECHA_MOVIMIENTO]: timestamp.date,
    [BITRIX_APP_CONFIG.HISTORY.FIELDS.HORA_MOVIMIENTO]: timestamp.dateTime,
    [BITRIX_APP_CONFIG.HISTORY.FIELDS.DETALLE]:
      normalizeTextValue(action.detail) || "",
  };

  const previousUserId = normalizeEmployeeValue(action.previousUserId);
  const newUserId = normalizeEmployeeValue(action.newUserId);
  const performedById = normalizeEmployeeValue(action.performedById);
  const previousStateId = normalizeTextValue(
    action.previousStateId
      ? mapStateToHistoryEnum(action.previousStateId, "ESTADO_ANTERIOR")
      : ""
  );
  const newStateId = normalizeTextValue(
    action.newStateId ? mapStateToHistoryEnum(action.newStateId, "ESTADO_NUEVO") : ""
  );
  const previousLocation = normalizeTextValue(action.previousLocation);
  const newLocation = normalizeTextValue(action.newLocation);

  if (previousUserId) {
    fields[BITRIX_APP_CONFIG.HISTORY.FIELDS.USUARIO_ANTERIOR] = previousUserId;
  }

  if (newUserId) {
    fields[BITRIX_APP_CONFIG.HISTORY.FIELDS.USUARIO_NUEVO] = newUserId;
  }

  if (performedById) {
    fields[BITRIX_APP_CONFIG.HISTORY.FIELDS.REALIZADO_POR] = performedById;
  }

  if (previousStateId) {
    fields[BITRIX_APP_CONFIG.HISTORY.FIELDS.ESTADO_ANTERIOR] = previousStateId;
  }

  if (newStateId) {
    fields[BITRIX_APP_CONFIG.HISTORY.FIELDS.ESTADO_NUEVO] = newStateId;
  }

  if (previousLocation) {
    fields[BITRIX_APP_CONFIG.HISTORY.FIELDS.UBICACION_ANTERIOR] = previousLocation;
  }

  if (newLocation) {
    fields[BITRIX_APP_CONFIG.HISTORY.FIELDS.UBICACION_NUEVA] = newLocation;
  }

  return fields;
}

function resolveUserName(userId, userMap) {
  const normalizedId = normalizeEmployeeValue(userId);

  if (!normalizedId) {
    return "";
  }

  return userMap.get(normalizedId)?.name || `ID ${normalizedId}`;
}

function getMovementOccurredAt(item) {
  const dateValue = getBitrixFieldValue(
    item,
    BITRIX_APP_CONFIG.HISTORY.FIELDS.FECHA_MOVIMIENTO
  );
  const timeValue = getBitrixFieldValue(
    item,
    BITRIX_APP_CONFIG.HISTORY.FIELDS.HORA_MOVIMIENTO
  );

  const baseValue = timeValue || dateValue;
  const parsed = baseValue ? new Date(baseValue) : null;

  return {
    dateValue: dateValue || "",
    timeValue: timeValue || "",
    sortValue:
      parsed && !Number.isNaN(parsed.getTime()) ? parsed.getTime() : 0,
  };
}

export function normalizeHistoryItem(item, userMap = new Map()) {
  const movementTypeId = String(
    getBitrixFieldValue(item, BITRIX_APP_CONFIG.HISTORY.FIELDS.TIPO_MOVIMIENTO) || ""
  );
  const previousStateId = String(
    getBitrixFieldValue(item, BITRIX_APP_CONFIG.HISTORY.FIELDS.ESTADO_ANTERIOR) || ""
  );
  const newStateId = String(
    getBitrixFieldValue(item, BITRIX_APP_CONFIG.HISTORY.FIELDS.ESTADO_NUEVO) || ""
  );
  const occurredAt = getMovementOccurredAt(item);

  return {
    id: String(item?.id || item?.ID || ""),
    movementTypeId,
    movementTypeLabel:
      BITRIX_APP_CONFIG.HISTORY.ENUM_LABELS.TIPO_MOVIMIENTO[movementTypeId] ||
      "Movimiento",
    detail:
      getBitrixFieldValue(item, BITRIX_APP_CONFIG.HISTORY.FIELDS.DETALLE) || "",
    previousUser: resolveUserName(
      getBitrixFieldValue(item, BITRIX_APP_CONFIG.HISTORY.FIELDS.USUARIO_ANTERIOR),
      userMap
    ),
    newUser: resolveUserName(
      getBitrixFieldValue(item, BITRIX_APP_CONFIG.HISTORY.FIELDS.USUARIO_NUEVO),
      userMap
    ),
    performedBy: resolveUserName(
      getBitrixFieldValue(item, BITRIX_APP_CONFIG.HISTORY.FIELDS.REALIZADO_POR),
      userMap
    ),
    previousState:
      BITRIX_APP_CONFIG.HISTORY.STATE_LABELS[previousStateId] || "",
    newState: BITRIX_APP_CONFIG.HISTORY.STATE_LABELS[newStateId] || "",
    previousLocation:
      getBitrixFieldValue(
        item,
        BITRIX_APP_CONFIG.HISTORY.FIELDS.UBICACION_ANTERIOR
      ) || "",
    newLocation:
      getBitrixFieldValue(item, BITRIX_APP_CONFIG.HISTORY.FIELDS.UBICACION_NUEVA) ||
      "",
    dateValue: occurredAt.dateValue,
    timeValue: occurredAt.timeValue,
    sortValue: occurredAt.sortValue,
  };
}

export function sortHistoryItemsDesc(items) {
  return [...items].sort((a, b) => {
    if (b.sortValue !== a.sortValue) {
      return b.sortValue - a.sortValue;
    }

    return String(b.id).localeCompare(String(a.id), "es");
  });
}
