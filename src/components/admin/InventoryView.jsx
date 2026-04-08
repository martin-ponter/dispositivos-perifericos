import { useEffect, useMemo, useState } from "react";
import { BITRIX_APP_CONFIG } from "../../config/bitrixConfig";
import { listSpaItems } from "../../lib/bitrix/spa";
import { getAllBitrixUsers } from "../../lib/bitrix/users";
import TimelineModal from "./TimelineModal";
import EditAssetModal from "./EditAssetModal";

function getItemCollection(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.item)) return response.item;
  if (Array.isArray(response?.result?.items)) return response.result.items;
  return [];
}

function getFieldValue(item, fieldName) {
  return item?.[fieldName] ?? item?.fields?.[fieldName] ?? "";
}

function normalizeFileValue(fileValue) {
  if (!fileValue) return null;

  if (typeof fileValue === "object" && !Array.isArray(fileValue)) {
    return {
      id: fileValue.id || fileValue.ID || null,
      url: fileValue.url || fileValue.URL || "",
      name: fileValue.name || fileValue.NAME || "Factura",
    };
  }

  return null;
}

function normalizeInventoryItem(item, userMap) {
  const itemId = String(item?.id || item?.ID || item?.item?.id || "");
  const typeId = String(
    getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.TIPO_ACTIVO) || ""
  );
  const stateId = String(
    getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.ESTADO) || ""
  );
  const linkedToIdRaw = getFieldValue(
    item,
    BITRIX_APP_CONFIG.FIELDS.VINCULADO_A
  );
  const linkedToId = linkedToIdRaw ? Number(linkedToIdRaw) : null;

  return {
    raw: item,
    itemId,
    idInterno:
      getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.ID_INTERNO) || itemId || "-",
    typeId,
    type: BITRIX_APP_CONFIG.ENUM_LABELS.TIPO_ACTIVO[typeId] || "Sin tipo",
    brand: getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.MARCA) || "-",
    model: getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.MODELO) || "-",
    serialNumber:
      getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.NUMERO_SERIE) || "-",
    stateId,
    state: BITRIX_APP_CONFIG.ENUM_LABELS.ESTADO[stateId] || "Sin estado",
    location:
      getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.UBICACION_FISICA) || "-",
    operatingSystem:
      getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.SISTEMA_OPERATIVO) || "-",
    ram: getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.MEMORIA_RAM) || "-",
    connectorType:
      getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.TIPO_CONECTOR) || "-",
    invoice: getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.FACTURA) || "",
    invoiceFile: normalizeFileValue(
      getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.FACTURA_ARCHIVO)
    ),
    observations:
      getFieldValue(item, BITRIX_APP_CONFIG.FIELDS.OBSERVACIONES) || "",
    linkedToId,
    linkedTo: linkedToId
      ? userMap.get(linkedToId)?.name || `ID ${linkedToId}`
      : "-",
    timeline: [],
  };
}

function hasUsefulValue(value) {
  return Boolean(value && value !== "-");
}

function getAssetDisplayTitle(asset) {
  const hasBrand = hasUsefulValue(asset.brand);
  const hasModel = hasUsefulValue(asset.model);
  const hasType = hasUsefulValue(asset.type);
  const hasSerialNumber = hasUsefulValue(asset.serialNumber);
  const hasInternalId = hasUsefulValue(asset.idInterno);

  if (hasBrand && hasModel) {
    return `${asset.brand} ${asset.model}`;
  }

  if (hasBrand) {
    return asset.brand;
  }

  if (hasType && hasSerialNumber) {
    return `${asset.type} · ${asset.serialNumber}`;
  }

  if (hasType && hasInternalId) {
    return `${asset.type} · ${asset.idInterno}`;
  }

  return "Activo sin nombre";
}

export default function InventoryView({ user, refreshToken = 0 }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [selectedTimelineAsset, setSelectedTimelineAsset] = useState(null);
  const [selectedEditAsset, setSelectedEditAsset] = useState(null);

  async function fetchInventory() {
    try {
      setLoading(true);
      setError("");

      const [spaResponse, users] = await Promise.all([
        listSpaItems({ order: { id: "desc" } }),
        getAllBitrixUsers(),
      ]);

      const userMap = new Map(
        users.map((currentUser) => [currentUser.id, currentUser])
      );

      setItems(
        getItemCollection(spaResponse).map((item) =>
          normalizeInventoryItem(item, userMap)
        )
      );
    } catch (loadError) {
      console.error("Error cargando inventario:", loadError);
      setError(
        loadError?.description ||
          loadError?.error_description ||
          loadError?.message ||
          "No se ha podido cargar el inventario real del SPA."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, [refreshToken]);

  const filteredAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((asset) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          asset.itemId,
          asset.idInterno,
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

      const matchesType = !typeFilter || asset.typeId === typeFilter;
      const matchesState = !stateFilter || asset.stateId === stateFilter;

      return matchesSearch && matchesType && matchesState;
    });
  }, [items, search, typeFilter, stateFilter]);

  function handleAssetUpdated() {
    fetchInventory();
    setSelectedEditAsset(null);
    setSelectedTimelineAsset(null);
  }

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">Inventario</h2>
          <p className="mt-1 text-sm text-slate-600">
            Consulta todos los dispositivos registrados, filtra resultados y accede a sus acciones.
          </p>
          <p className="mt-2 text-xs text-slate-500">Sesión admin: {user.name}</p>
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
              {BITRIX_APP_CONFIG.ENUM_OPTIONS.TIPO_ACTIVO.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              {BITRIX_APP_CONFIG.ENUM_OPTIONS.ESTADO.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              Cargando inventario...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              {error}
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No hay resultados con los filtros actuales.
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <article
                key={asset.itemId}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                          {asset.type}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {asset.state}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-semibold text-slate-900">
                        {getAssetDisplayTitle(asset)}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        ID Bitrix: {asset.itemId} · ID interno: {asset.idInterno}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:flex-row lg:shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedTimelineAsset(asset)}
                        className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Timeline
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedEditAsset(asset)}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Editar
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Spec label="Número de serie" value={asset.serialNumber} />
                    <Spec label="Ubicación" value={asset.location} />
                    <Spec label="Sistema operativo" value={asset.operatingSystem} />
                    <Spec label="RAM" value={asset.ram} />
                    <Spec label="Conector" value={asset.connectorType} />
                    <Spec label="Factura" value={asset.invoice || "-"} />
                    <Spec label="Vinculado ahora a" value={asset.linkedTo || "-"} />
                    <Spec label="Factura archivo">
                      {asset.invoiceFile?.url ? (
                        <a
                          href={asset.invoiceFile.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-slate-900 underline"
                        >
                          Ver factura
                        </a>
                      ) : (
                        <span>Sin factura</span>
                      )}
                    </Spec>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <TimelineModal
        asset={selectedTimelineAsset}
        user={user}
        onClose={() => setSelectedTimelineAsset(null)}
        onSaved={handleAssetUpdated}
      />

      <EditAssetModal
        asset={selectedEditAsset}
        user={user}
        onClose={() => setSelectedEditAsset(null)}
        onSaved={handleAssetUpdated}
      />
    </>
  );
}

function Spec({ label, value, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-900">
        {children || value}
      </div>
    </div>
  );
}
