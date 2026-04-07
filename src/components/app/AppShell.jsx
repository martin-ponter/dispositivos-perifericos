import { useEffect, useState } from "react";
import AuthGate from "./AuthGate";
import BitrixLoader from "./BitrixLoader";
import UserFormView from "./UserFormView";
import AdminView from "./AdminView";
import { initBitrix, isInsideBitrix } from "../../lib/bitrix/bootstrap";
import { tryFinishInstall } from "../../lib/bitrix/install";
import { getCurrentBitrixUserRaw, normalizeBitrixUser } from "../../lib/bitrix/user";
import { canAccessAdminPanel } from "../../lib/bitrix/permissions";

export default function AppShell() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [installInfo, setInstallInfo] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        setError("");

        if (!isInsideBitrix()) {
          setError("Esta aplicación solo puede abrirse desde Bitrix24.");
          return;
        }

        await initBitrix();

        const installResult = await tryFinishInstall();
        setInstallInfo(installResult);

        const rawUser = await getCurrentBitrixUserRaw();
        const normalizedUser = normalizeBitrixUser(rawUser);

        if (!normalizedUser?.id) {
          setError("No se ha podido identificar al usuario de Bitrix.");
          return;
        }

        setUser({
          ...normalizedUser,
          canAccessAdminPanel: canAccessAdminPanel(normalizedUser),
        });
      } catch (err) {
        console.error("Error inicializando la app:", err);
        setError(
          err?.description ||
            err?.error_description ||
            err?.message ||
            "No se ha podido inicializar la app dentro de Bitrix."
        );
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  if (loading) {
    return <BitrixLoader />;
  }

  if (error || !user) {
    return <AuthGate error={error || "Acceso no válido."} />;
  }

  if (user.canAccessAdminPanel) {
    return <AdminView user={user} installInfo={installInfo} />;
  }

  return <UserFormView user={user} installInfo={installInfo} />;
}