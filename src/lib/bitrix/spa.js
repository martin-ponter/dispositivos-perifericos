import { BITRIX_APP_CONFIG } from "../../config/bitrixConfig";
import { callBitrixMethod } from "./methods";

export function assertEntityTypeIdConfigured() {
  if (!BITRIX_APP_CONFIG.ENTITY_TYPE_ID || BITRIX_APP_CONFIG.ENTITY_TYPE_ID <= 0) {
    throw new Error(
      "Falta configurar ENTITY_TYPE_ID en src/config/bitrixConfig.js"
    );
  }
}

export function assertHistoryEntityTypeIdConfigured() {
  if (
    !BITRIX_APP_CONFIG.HISTORY?.ENTITY_TYPE_ID ||
    BITRIX_APP_CONFIG.HISTORY.ENTITY_TYPE_ID <= 0
  ) {
    throw new Error(
      "Falta configurar HISTORY.ENTITY_TYPE_ID en src/config/bitrixConfig.js"
    );
  }
}

export async function getSpaFields() {
  assertEntityTypeIdConfigured();

  return await callBitrixMethod("crm.item.fields", {
    entityTypeId: BITRIX_APP_CONFIG.ENTITY_TYPE_ID,
  });
}

export async function listSpaItems(params = {}) {
  assertEntityTypeIdConfigured();

  return await callBitrixMethod("crm.item.list", {
    entityTypeId: BITRIX_APP_CONFIG.ENTITY_TYPE_ID,
    ...params,
  });
}

export async function createSpaItem(fields) {
  assertEntityTypeIdConfigured();

  return await callBitrixMethod("crm.item.add", {
    entityTypeId: BITRIX_APP_CONFIG.ENTITY_TYPE_ID,
    fields,
  });
}

export async function getSpaItem(id) {
  assertEntityTypeIdConfigured();

  return await callBitrixMethod("crm.item.get", {
    entityTypeId: BITRIX_APP_CONFIG.ENTITY_TYPE_ID,
    id,
  });
}

export async function updateSpaItem(id, fields) {
  assertEntityTypeIdConfigured();

  return await callBitrixMethod("crm.item.update", {
    entityTypeId: BITRIX_APP_CONFIG.ENTITY_TYPE_ID,
    id,
    fields,
  });
}

export async function createHistoryItem(fields) {
  assertHistoryEntityTypeIdConfigured();

  return await callBitrixMethod("crm.item.add", {
    entityTypeId: BITRIX_APP_CONFIG.HISTORY.ENTITY_TYPE_ID,
    fields,
  });
}

export async function listHistoryItems(filter = {}) {
  assertHistoryEntityTypeIdConfigured();

  return await callBitrixMethod("crm.item.list", {
    entityTypeId: BITRIX_APP_CONFIG.HISTORY.ENTITY_TYPE_ID,
    filter,
  });
}
