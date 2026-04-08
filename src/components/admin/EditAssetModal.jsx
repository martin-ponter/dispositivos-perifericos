import { useEffect, useState } from "react";
import { BITRIX_APP_CONFIG } from "../../config/bitrixConfig";
import { buildHistoryMovementFields } from "../../lib/bitrix/history";
import { createHistoryItem, updateSpaItem } from "../../lib/bitrix/spa";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () =>
      reject(reader.error || new Error("No se pudo leer el archivo"));

    reader.readAsDataURL(file);
  });
}

function buildEditHistoryActions(asset, form, adminUser) {
  const actions = [];
  const previousState = String(asset.stateId || "");
  const nextState = String(form.state || "");
  const previousLocation = String(asset.location || "").trim();
  const nextLocation = String(form.location || "").trim();
  const previousInvoice = String(asset.invoice || "").trim();
  const nextInvoice = String(form.invoice || "").trim();
  const hadInvoiceFile = Boolean(asset.invoiceFile?.url || asset.invoiceFile?.id);
  const hasNewInvoiceFile = Boolean(form.invoiceFile);
  const invoiceChanged =
    previousInvoice !== nextInvoice || hasNewInvoiceFile;
  const hadInvoice = Boolean(previousInvoice || hadInvoiceFile);
  const hasInvoiceNow = Boolean(nextInvoice || hasNewInvoiceFile || hadInvoiceFile);
  const observationsChanged =
    String(asset.observations || "") !== String(form.observations || "");

  if (previousState !== nextState) {
    actions.push({
      movementTypeId: BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.CambioEstado,
      previousStateId: previousState,
      newStateId: nextState,
      performedById: adminUser?.id,
      detail: "Cambio de estado realizado desde el panel admin",
    });
  }

  if (previousLocation !== nextLocation) {
    actions.push({
      movementTypeId:
        BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.CambioUbicacion,
      previousLocation,
      newLocation: nextLocation,
      performedById: adminUser?.id,
      detail: "Cambio de ubicacion realizado desde el panel admin",
    });
  }

  if (invoiceChanged && !hadInvoice && hasInvoiceNow) {
    actions.push({
      movementTypeId:
        BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.FacturaAnadida,
      performedById: adminUser?.id,
      detail: "Factura anadida desde el panel admin",
    });
  } else if (invoiceChanged && hadInvoice) {
    actions.push({
      movementTypeId:
        BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.FacturaReemplazada,
      performedById: adminUser?.id,
      detail: "Factura reemplazada desde el panel admin",
    });
  }

  if (!actions.length && (invoiceChanged || observationsChanged)) {
    actions.push({
      movementTypeId: BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.Edicion,
      performedById: adminUser?.id,
      detail: "Edicion manual del activo desde el panel admin",
    });
  }

  return actions;
}

export default function EditAssetModal({ asset, user, onClose, onSaved }) {
  const [form, setForm] = useState({
    state: "",
    location: "",
    invoice: "",
    observations: "",
    invoiceFile: null,
  });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!asset) return;

    setForm({
      state: asset.stateId || "",
      location: asset.location || "",
      invoice: asset.invoice || "",
      observations: asset.observations || "",
      invoiceFile: null,
    });
    setErrorMessage("");
  }, [asset]);

  if (!asset) return null;

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      setErrorMessage("");

      const fields = {
        [BITRIX_APP_CONFIG.FIELDS.ESTADO]: form.state,
        [BITRIX_APP_CONFIG.FIELDS.UBICACION_FISICA]: form.location,
        [BITRIX_APP_CONFIG.FIELDS.FACTURA]: form.invoice,
        [BITRIX_APP_CONFIG.FIELDS.OBSERVACIONES]: form.observations,
      };

      if (form.invoiceFile) {
        fields[BITRIX_APP_CONFIG.FIELDS.FACTURA_ARCHIVO] = [
          form.invoiceFile.name,
          await fileToBase64(form.invoiceFile),
        ];
      }

      const historyActions = buildEditHistoryActions(asset, form, user);

      await updateSpaItem(asset.itemId, fields);

      for (const action of historyActions) {
        try {
          await createHistoryItem(buildHistoryMovementFields(asset, action));
        } catch (historyError) {
          console.error("Error creando historial de edicion:", historyError);
        }
      }

      await onSaved?.();
    } catch (error) {
      console.error("Error actualizando activo:", error);
      setErrorMessage(
        error?.description ||
          error?.error_description ||
          error?.message ||
          "No se han podido guardar los cambios."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Editar activo</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {asset.brand} {asset.model}
            </h2>
            <p className="mt-1 text-sm text-slate-600">ID: {asset.idInterno}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Estado">
            <select
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
            >
              {BITRIX_APP_CONFIG.ENUM_OPTIONS.ESTADO.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Ubicacion">
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
            />
          </Field>

          <Field label="Factura">
            <input
              type="text"
              value={form.invoice}
              onChange={(e) => updateField("invoice", e.target.value)}
              placeholder="Ej. FAC-2026-0015"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
            />
          </Field>

          <Field label="Subir archivo de factura">
            <input
              type="file"
              onChange={(e) =>
                updateField("invoiceFile", e.target.files?.[0] || null)
              }
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            />
            {asset.invoiceFile?.url ? (
              <a
                href={asset.invoiceFile.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-medium text-slate-900 underline"
              >
                Ver factura actual
              </a>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Sin factura</p>
            )}
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Observaciones">
            <textarea
              rows={4}
              value={form.observations}
              onChange={(e) => updateField("observations", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
            />
          </Field>
        </div>

        {errorMessage ? (
          <p className="mt-4 text-sm font-medium text-rose-600">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

