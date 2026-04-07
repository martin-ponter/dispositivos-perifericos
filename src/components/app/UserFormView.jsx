import AssetRegistrationForm from "../assets/AssetRegistrationForm";

export default function UserFormView({ user, installInfo }) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Usuario identificado</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Hola, {user.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Puedes registrar tu equipo, monitor y periféricos.
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

      <AssetRegistrationForm user={user} />
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