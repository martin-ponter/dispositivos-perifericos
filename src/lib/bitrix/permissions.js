import { BITRIX_APP_CONFIG } from "../../config/bitrixConfig";

export function canAccessAdminPanel(user) {
  if (!user) return false;

  const appAdminIds = BITRIX_APP_CONFIG.APP_ADMIN_IDS || [];
  return user.isPortalAdmin || appAdminIds.includes(Number(user.id));
}