import { useMemo, useState } from "react";
import TimelineModal from "./TimelineModal";
import EditAssetModal from "./EditAssetModal";

const MOCK_ASSETS = [
  {
    id: "ACT-10001",
    type: "Portátil",
    brand: "Lenovo",
    model: "ThinkPad E14",
    serialNumber: "SN-LEN-001",
    state: "Asignado",
    location: "Madrid - Planta 2",
    operatingSystem: "Windows 11 Pro",
    ram: "16 GB",
    connectorType: "USB-C",
    invoice: "FAC-2026-001",
    linkedTo: "Marta Pérez",
    linkedToId: 21,
    timeline: [
      { date: "2026-01-10", action: "Alta de activo", user: "Admin Sistemas" },
      { date: "2026-01-12", action: "Asignado", user: "Marta Pérez" },
    ],
  },
  {
    id: "ACT-10002",
    type: "Monitor",
    brand: "Dell",
    model: "P2422H",
    serialNumber: "SN-DEL-883",
    state: "Disponible",
    location: "Toledo - Sala Fiscal",
    operatingSystem: "-",
    ram: "-",
    connectorType: "HDMI",
    invoice: "FAC-2026-002",
    linkedTo: "-",
    linkedToId: null,
    timeline: [
      { date: "2026-01-08", action: "Alta de activo", user: "Admin Sistemas" },
    ],
  },
  {
    id: "ACT-10003",
    type: "Ratón",
    brand: "Logitech",
    model: "M185",
    serialNumber: "SN-LOG-321",
    state: "Disponible",
    location: "Alcobendas - Armario IT",
    operatingSystem: "-",
    ram: "-",
    connectorType: "USB-A",
    invoice: "",
    linkedTo: "-",
    linkedToId: null,
    timeline: [
      { date: "2026-02-01", action: "Alta de activo", user: "Admin Sistemas" },
    ],
  },
];

export default function InventoryView() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [selectedTimelineAsset, setSelectedTimelineAsset] = useState(null);
  const [selectedEditAsset, setSelectedEditAsset] = useState(null);

  const filteredAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return MOCK_ASSETS.filter((asset) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          asset.id,
          asset.type,
          asset.brand,
          asset.model,
          asset.serialNumber,
          asset.location,
          asset.linkedTo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesType = !typeFilter || asset.type === typeFilter;
      const matchesState = !stateFilter || asset.state === stateFilter;

      return matchesSearch && matchesType && matchesState;
    });
  }, [search, typeFilter, stateFilter]);

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">Inventario</h2>
          <p className="mt-1 text-sm text-slate-600">
            Consulta todos los dispositivos registrados, filtra resultados y accede a sus acciones.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Buscar
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ID, marca, modelo, serie..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Filtrar por tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
            >
              <option value="">Todos</option>
              <option value="Portátil">Portátil</option>
              <option value="Monitor">Monitor</option>
              <option value="Ratón">Ratón</option>
              <option value="Teclado">Teclado</option>
              <option value="Cable">Cable</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Filtrar por estado
            </label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
            >
              <option value="">Todos</option>
              <option value="Disponible">Disponible</option>
              <option value="Asignado">Asignado</option>
              <option value="Averiado">Averiado</option>
              <option value="En reparación">En reparación</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredAssets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No hay resultados con los filtros actuales.
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <article
                key={asset.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {asset.type}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                        {asset.state}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-slate-900">
                      {asset.brand} {asset.model}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      ID: {asset.id}
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <Spec label="Número de serie" value={asset.serialNumber} />
                      <Spec label="Ubicación" value={asset.location} />
                      <Spec label="Sistema operativo" value={asset.operatingSystem} />
                      <Spec label="RAM" value={asset.ram} />
                      <Spec label="Conector" value={asset.connectorType} />
                      <Spec label="Factura" value={asset.invoice || "-"} />
                      <Spec label="Vinculado ahora a" value={asset.linkedTo || "-"} />
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:w-56">
                    <button
                      type="button"
                      onClick={() => setSelectedTimelineAsset(asset)}
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Ver vinculaciones / timeline
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedEditAsset(asset)}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <TimelineModal
        asset={selectedTimelineAsset}
        onClose={() => setSelectedTimelineAsset(null)}
      />

      <EditAssetModal
        asset={selectedEditAsset}
        onClose={() => setSelectedEditAsset(null)}
      />
    </>
  );
}

function Spec({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}