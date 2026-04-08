import { useState } from "react";
import AdminTabs from "../admin/AdminTabs";
import InventoryView from "../admin/InventoryView";
import RegisterDeviceView from "../admin/RegisterDeviceView";

export default function AdminView({ user, installInfo }) {
  const [activeTab, setActiveTab] = useState("inventory");
  const [inventoryRefreshToken, setInventoryRefreshToken] = useState(0);

  function handleInventoryChanged() {
    setInventoryRefreshToken((currentValue) => currentValue + 1);
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-emerald-600">Acceso administrador</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Panel de inventario IT
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Bienvenido, {user.name}. Desde aquí puedes consultar el inventario,
          editar registros, revisar vinculaciones y registrar nuevos dispositivos.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Info label="Usuario" value={user.name} />
          <Info label="Email" value={user.email || "-"} />
          <Info label="ID Bitrix" value={String(user.id)} />
        </div>

        {installInfo?.attempted && (
          <p className="mt-4 text-xs text-slate-500">
            Instalación detectada: {installInfo.success ? "finalizada" : "no confirmada"}.
          </p>
        )}
      </div>

      <AdminTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "inventory" ? (
        <InventoryView
          user={user}
          refreshToken={inventoryRefreshToken}
        />
      ) : (
        <RegisterDeviceView
          user={user}
          onAssetCreated={handleInventoryChanged}
        />
      )}
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
