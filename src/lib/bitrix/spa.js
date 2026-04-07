import { BITRIX_APP_CONFIG } from "../../config/bitrixConfig";
import { callBitrixMethod } from "./methods";

export function assertEntityTypeIdConfigured() {
  if (!BITRIX_APP_CONFIG.ENTITY_TYPE_ID || BITRIX_APP_CONFIG.ENTITY_TYPE_ID <= 0) {
    throw new Error(
      "Falta configurar ENTITY_TYPE_ID en src/config/bitrixConfig.js"
    );
  }
}

export async function getSpaFields() {
  assertEntityTypeIdConfigured();

  return await callBitrixMethod("crm.item.fields", {
    entityTypeId: BITRIX_APP_CONFIG.ENTITY_TYPE_ID,
  });
}

export async function createSpaItem(fields) {
  assertEntityTypeIdConfigured();

  return await callBitrixMethod("crm.item.add", {
    entityTypeId: BITRIX_APP_CONFIG.ENTITY_TYPE_ID,
    fields,
  });
}