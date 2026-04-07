export default function AuthGate({ error }) {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-xl">
        ⛔
      </div>

      <h1 className="text-2xl font-bold text-slate-900">
        Acceso no permitido
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>

      <p className="mt-4 text-sm text-slate-500">
        Debes abrir esta app desde Bitrix24.
      </p>
    </section>
  );
}