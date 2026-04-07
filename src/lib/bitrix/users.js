import { callBitrixMethod } from "./methods";

function normalizeCompanyUser(user) {
  return {
    id: Number(user.ID || user.id || 0),
    name:
      user.NAME && user.LAST_NAME
        ? `${user.NAME} ${user.LAST_NAME}`.trim()
        : user.FULL_NAME || user.NAME || user.name || "Usuario",
    email: user.EMAIL || "",
    active: user.ACTIVE !== false && user.ACTIVE !== "N",
    raw: user,
  };
}

export async function getAllBitrixUsers() {
  const collected = [];

  await new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.BX24) {
      reject(new Error("BX24 no disponible"));
      return;
    }

    function requestPage() {
      window.BX24.callMethod(
        "user.get",
        { sort: { ID: "ASC" } },
        function (result) {
          if (result.error()) {
            reject(result.error());
            return;
          }

          const pageData = result.data() || [];
          collected.push(...pageData);

          if (result.more()) {
            result.next();
            return;
          }

          resolve();
        }
      );
    }

    requestPage();
  });

  return collected
    .map(normalizeCompanyUser)
    .filter((user) => user.id > 0 && user.active)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}