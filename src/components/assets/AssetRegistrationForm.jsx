import { useMemo, useState } from "react";
import { BITRIX_APP_CONFIG } from "../../config/bitrixConfig";
import { createSpaItem } from "../../lib/bitrix/spa";
import SectionCard from "./SectionCard";
import { InputField, SelectField, TextareaField } from "./Field";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function buildInternalId() {
  const stamp = Date.now();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `ACT-${stamp}-${random}`;
}

function getAssetTypeLabel(value) {
  const map = {
    "4814": "Portátil",
    "4815": "Sobremesa",
    "4816": "Monitor",
    "4817": "Teclado",
    "4818": "Ratón",
    "4819": "Cascos",
    "4820": "Cable",
    "4821": "Adaptador",
    "4822": "Otro",
  };

  return map[String(value)] || "Sin tipo";
}

function initialState(user) {
  return {
    employeeName: user?.name || "",
    employeeEmail: user?.email || "",
    employeeBitrixId: String(user?.id || ""),

    assetType: "",
    state: BITRIX_APP_CONFIG.DEFAULTS.ESTADO,
    registrationDate: getTodayDate(),
    physicalLocation: "",
    serialNumber: "",
    brand: "",
    model: "",
    invoice: "",
    observations: "",
    operatingSystem: "",
    ram: "",
    connectorType: "",
    invoiceFile: null,
  };
}

export default function AssetRegistrationForm({ user, isAdmin = false }) {
  const [form, setForm] = useState(initialState(user));
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const summary = useMemo(() => {
    return [
      getAssetTypeLabel(form.assetType),
      form.brand || "Sin marca",
      form.model || "Sin modelo",
    ].join(" · ");
  }, [form]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!String(form.assetType).trim()) {
      nextErrors.assetType = "Selecciona el tipo de activo.";
    }

    if (!String(form.state).trim()) {
      nextErrors.state = "Selecciona el estado.";
    }

    if (!String(form.registrationDate).trim()) {
      nextErrors.registrationDate = "Selecciona la fecha.";
    }

    if (!String(form.physicalLocation).trim()) {
      nextErrors.physicalLocation = "Indica la ubicación.";
    }

    if (!String(form.serialNumber).trim()) {
      nextErrors.serialNumber = "Indica el número de serie.";
    }

    if (!String(form.brand).trim()) {
      nextErrors.brand = "Indica la marca.";
    }

    if (!String(form.model).trim()) {
      nextErrors.model = "Indica el modelo.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validate()) return;

    try {
      setSending(true);

      const internalId = buildInternalId();

      const observationsParts = [
        `Registrado por: ${form.employeeName}`,
        form.employeeEmail ? `Email: ${form.employeeEmail}` : "",
        form.employeeBitrixId ? `Bitrix ID: ${form.employeeBitrixId}` : "",
        form.operatingSystem ? `SO: ${form.operatingSystem}` : "",
        form.ram ? `RAM: ${form.ram}` : "",
        form.connectorType ? `Conector: ${form.connectorType}` : "",
        form.invoiceFile ? `Archivo factura: ${form.invoiceFile.name}` : "",
        form.observations ? `Notas: ${form.observations}` : "",
      ].filter(Boolean);

      const fields = {
        [BITRIX_APP_CONFIG.FIELDS.ID_INTERNO]: internalId,
        [BITRIX_APP_CONFIG.FIELDS.TIPO_ACTIVO]: form.assetType,
        [BITRIX_APP_CONFIG.FIELDS.VINCULADO_A]: Number(user.id),
        [BITRIX_APP_CONFIG.FIELDS.ESTADO]: form.state,
        [BITRIX_APP_CONFIG.FIELDS.FECHA_REGISTRO]: form.registrationDate,
        [BITRIX_APP_CONFIG.FIELDS.UBICACION_FISICA]: form.physicalLocation,
        [BITRIX_APP_CONFIG.FIELDS.NUMERO_SERIE]: form.serialNumber,
        [BITRIX_APP_CONFIG.FIELDS.MARCA]: form.brand,
        [BITRIX_APP_CONFIG.FIELDS.MODELO]: form.model,
        [BITRIX_APP_CONFIG.FIELDS.FACTURA]: form.invoice,
        [BITRIX_APP_CONFIG.FIELDS.OBSERVACIONES]: observationsParts.join(" | "),
        [BITRIX_APP_CONFIG.FIELDS.SISTEMA_OPERATIVO]: form.operatingSystem,
        [BITRIX_APP_CONFIG.FIELDS.MEMORIA_RAM]: form.ram,
        [BITRIX_APP_CONFIG.FIELDS.TIPO_CONECTOR]: form.connectorType,
      };

      await createSpaItem(fields);

      setSuccessMessage("Activo registrado correctamente en Bitrix.");
      setForm(initialState(user));
      setErrors({});
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error?.description ||
          error?.error_description ||
          error?.message ||
          "No se ha podido guardar el activo en el SPA."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <SectionCard
        title="Registro del activo"
        description="Completa la información del dispositivo o periférico."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SelectField
            label="Tipo de activo"
            value={form.assetType}
            onChange={(value) => updateField("assetType", value)}
            error={errors.assetType}
            options={[
              { value: "", label: "Selecciona un tipo" },
              { value: "4814", label: "Portátil" },
              { value: "4815", label: "Sobremesa" },
              { value: "4816", label: "Monitor" },
              { value: "4817", label: "Teclado" },
              { value: "4818", label: "Ratón" },
              { value: "4819", label: "Cascos" },
              { value: "4820", label: "Cable" },
              { value: "4821", label: "Adaptador" },
              { value: "4822", label: "Otro" },
            ]}
          />

          <SelectField
            label="Estado"
            value={form.state}
            onChange={(value) => updateField("state", value)}
            error={errors.state}
            options={[
              { value: "4823", label: "Disponible" },
              { value: "4824", label: "Ocupado" },
              { value: "4825", label: "Desechado" },
              { value: "4826", label: "En reparación" },
            ]}
          />

          <InputField
            label="Fecha de registro"
            type="date"
            value={form.registrationDate}
            onChange={(value) => updateField("registrationDate", value)}
            error={errors.registrationDate}
          />

          <InputField
            label="Ubicación física"
            value={form.physicalLocation}
            onChange={(value) => updateField("physicalLocation", value)}
            error={errors.physicalLocation}
            placeholder="Ej. Madrid - Planta 2 - Mesa 14"
          />

          <InputField
            label="Número de serie"
            value={form.serialNumber}
            onChange={(value) => updateField("serialNumber", value)}
            error={errors.serialNumber}
            placeholder="Ej. SN-001245"
          />

          <InputField
            label="Marca"
            value={form.brand}
            onChange={(value) => updateField("brand", value)}
            error={errors.brand}
            placeholder="Ej. Lenovo"
          />

          <InputField
            label="Modelo"
            value={form.model}
            onChange={(value) => updateField("model", value)}
            error={errors.model}
            placeholder="Ej. ThinkPad E14"
          />

          <InputField
            label="Factura"
            value={form.invoice}
            onChange={(value) => updateField("invoice", value)}
            placeholder="Ej. FAC-2026-0007"
          />

          <InputField
            label="Sistema operativo"
            value={form.operatingSystem}
            onChange={(value) => updateField("operatingSystem", value)}
            placeholder="Ej. Windows 11 Pro"
          />

          <InputField
            label="Memoria RAM"
            value={form.ram}
            onChange={(value) => updateField("ram", value)}
            placeholder="Ej. 16 GB"
          />

          <InputField
            label="Tipo de conector"
            value={form.connectorType}
            onChange={(value) => updateField("connectorType", value)}
            placeholder="Ej. USB-C, HDMI, DisplayPort"
          />
        </div>

        {isAdmin && (
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Subir factura
            </label>
            <input
              type="file"
              onChange={(e) =>
                updateField("invoiceFile", e.target.files?.[0] || null)
              }
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            />
            {form.invoiceFile && (
              <p className="mt-2 text-sm text-slate-600">
                Archivo seleccionado: {form.invoiceFile.name}
              </p>
            )}
          </div>
        )}

        <div className="mt-4">
          <TextareaField
            label="Observaciones"
            value={form.observations}
            onChange={(value) => updateField("observations", value)}
            placeholder="Información adicional del activo"
          />
        </div>
      </SectionCard>

      <SectionCard title="Resumen">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Vista rápida
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {summary}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Registro para
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {user.name}
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          {successMessage ? (
            <p className="text-sm font-medium text-emerald-600">
              {successMessage}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="text-sm font-medium text-rose-600">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={sending}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Guardando..." : "Guardar en Bitrix"}
        </button>
      </div>
    </form>
  );
}