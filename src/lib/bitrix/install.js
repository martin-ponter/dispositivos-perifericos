import { isInstallMode } from "./bootstrap";

export function tryFinishInstall() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.BX24) {
      resolve({ attempted: false, success: false });
      return;
    }

    if (!isInstallMode()) {
      resolve({ attempted: false, success: false });
      return;
    }

    if (typeof window.BX24.installFinish !== "function") {
      resolve({ attempted: true, success: false });
      return;
    }

    try {
      window.BX24.installFinish(() => {
        resolve({ attempted: true, success: true });
      });
    } catch (error) {
      console.warn("No se pudo completar installFinish:", error);
      resolve({ attempted: true, success: false });
    }
  });
}