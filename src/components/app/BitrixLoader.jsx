export default function BitrixLoader() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-200" />
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Cargando aplicación
          </h1>
          <p className="text-sm text-slate-600">
            Inicializando Bitrix24 y validando permisos...
          </p>
        </div>
      </div>
    </div>
  );
}