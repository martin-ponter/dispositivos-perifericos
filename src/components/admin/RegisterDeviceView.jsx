import AssetRegistrationForm from "../assets/AssetRegistrationForm";

export default function RegisterDeviceView({ user, onAssetCreated }) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Registrar dispositivo
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Desde aquí puedes dar de alta nuevos dispositivos, periféricos y añadir
          información más completa, incluida la factura.
        </p>
      </div>

      <AssetRegistrationForm user={user} isAdmin onSuccess={onAssetCreated} />
    </section>
  );
}
