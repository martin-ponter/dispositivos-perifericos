import { useMemo, useState } from "react";
import { BITRIX_APP_CONFIG } from "../../config/bitrixConfig";
import { buildHistoryMovementFields } from "../../lib/bitrix/history";
import { createHistoryItem, createSpaItem } from "../../lib/bitrix/spa";
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

function getAssetTypeLabel(value) {
  const map = {
    "4814": "Portatil",
    "4815": "Sobremesa",
    "4816": "Monitor",
    "4817": "Teclado",
    "4818": "Raton",
    "4819": "Cascos",
    "4820": "Cable",
    "4821": "Adaptador",
    "4822": "Otro",
  };

  return map[String(value)] || "Sin tipo";
}

function isFullAssetType(assetType) {
  return [
    BITRIX_APP_CONFIG.ENUMS.TIPO_ACTIVO.Portatil,
    BITRIX_APP_CONFIG.ENUMS.TIPO_ACTIVO.Sobremesa,
  ].includes(String(assetType));
}

function shouldShowWindowsHelp(assetType) {
  return isFullAssetType(assetType);
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

export default function AssetRegistrationForm({
  user,
  isAdmin = false,
  onSuccess,
}) {
  const [form, setForm] = useState(initialState(user));
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const showFullFields = isFullAssetType(form.assetType);
  const showWindowsHelp = shouldShowWindowsHelp(form.assetType);

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
      nextErrors.physicalLocation = "Indica la ubicacion.";
    }

    if (!String(form.serialNumber).trim()) {
      nextErrors.serialNumber = "Indica el numero de serie.";
    }

    if (showFullFields) {
      if (!String(form.brand).trim()) {
        nextErrors.brand = "Indica la marca.";
      }

      if (!String(form.model).trim()) {
        nextErrors.model = "Indica el modelo.";
      }
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
      const invoiceFileValue = form.invoiceFile
        ? [form.invoiceFile.name, await fileToBase64(form.invoiceFile)]
        : undefined;

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

      if (invoiceFileValue) {
        fields[BITRIX_APP_CONFIG.FIELDS.FACTURA_ARCHIVO] = invoiceFileValue;
      }

      const created = await createSpaItem(fields);
      const createdId = created?.item?.id || created?.id || created;

      if (createdId) {
        try {
          await createHistoryItem(
            buildHistoryMovementFields(
              {
                itemId: createdId,
                idInterno: internalId,
                serialNumber: form.serialNumber,
                brand: form.brand,
                model: form.model,
                typeId: form.assetType,
                linkedToId: user?.id,
                stateId: form.state,
                location: form.physicalLocation,
              },
              {
                movementTypeId:
                  BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.Alta,
                newUserId: user?.id,
                performedById: user?.id,
                newStateId: form.state,
                newLocation: form.physicalLocation,
                detail: "Alta inicial del activo",
              }
            )
          );
        } catch (historyError) {
          console.error("Error creando historial de alta:", historyError);
        }
      }

      setSuccessMessage("Activo registrado correctamente en Bitrix.");
      setForm(initialState(user));
      setErrors({});
      await onSuccess?.(created);
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
        description="Completa la informacion del dispositivo o periferico."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SelectField
            label="Tipo de activo"
            value={form.assetType}
            onChange={(value) => updateField("assetType", value)}
            error={errors.assetType}
            options={[
              { value: "", label: "Selecciona un tipo" },
              { value: "4814", label: "Portatil" },
              { value: "4815", label: "Sobremesa" },
              { value: "4816", label: "Monitor" },
              { value: "4817", label: "Teclado" },
              { value: "4818", label: "Raton" },
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
              { value: "4826", label: "En reparacion" },
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
            label="Ubicacion fisica"
            value={form.physicalLocation}
            onChange={(value) => updateField("physicalLocation", value)}
            error={errors.physicalLocation}
            placeholder="Ej. Madrid - Planta 2 - Mesa 14"
          />

          <InputField
            label="Numero de serie"
            value={form.serialNumber}
            onChange={(value) => updateField("serialNumber", value)}
            error={errors.serialNumber}
            placeholder="Ej. SN-001245"
          />

          <InputField
            label="Factura"
            value={form.invoice}
            onChange={(value) => updateField("invoice", value)}
            placeholder="Ej. FAC-2026-0007"
          />

          <InputField
            label="Tipo de conector"
            value={form.connectorType}
            onChange={(value) => updateField("connectorType", value)}
            placeholder="Ej. USB-C, HDMI, DisplayPort"
          />

          {showFullFields ? (
            <>
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
            </>
          ) : null}
        </div>

        {showWindowsHelp ? (
          <div className="mt-5 rounded-3xl border border-sky-200 bg-sky-50/70 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-lg text-sky-700 shadow-sm">
                i
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    ¿Cómo sacar los datos de tu equipo en Windows?
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Esta ayuda te sirve para completar los campos del portátil o sobremesa sin salirte del flujo.
                  </p>
                </div>

                <div className="space-y-2 text-sm text-slate-700">
                  <p>
                    Para ver el <span className="font-semibold">modelo del equipo</span>, pulsa <span className="rounded bg-white px-2 py-0.5 font-mono text-xs text-slate-900">Win + R</span>, escribe <span className="rounded bg-white px-2 py-0.5 font-mono text-xs text-slate-900">msinfo32</span> y pulsa Enter.
                  </p>
                  <p>
                    En <span className="font-semibold">Información del sistema</span> podrás ver el modelo del equipo, la memoria RAM instalada y la versión de Windows o sistema operativo.
                  </p>
                  <p>
                    Para ver el <span className="font-semibold">número de serie</span>, abre <span className="font-semibold">Símbolo del sistema</span> y ejecuta <span className="rounded bg-white px-2 py-0.5 font-mono text-xs text-slate-900">wmic bios get serialnumber</span>.
                  </p>
                  <p>
                    Para revisar conectores o más detalles de hardware, abre <span className="font-semibold">Administrador de dispositivos</span> o consulta las especificaciones del fabricante si tienes dudas.
                  </p>
                </div>

                <p className="text-sm font-medium text-slate-600">
                  Si algún dato no te aparece o no estás seguro, rellena lo que conozcas y consulta con IT.
                </p>
              </div>
            </div>
          </div>
        ) : null}

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
            placeholder="Informacion adicional del activo"
          />
        </div>
      </SectionCard>

      <SectionCard title="Resumen">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Vista rapida
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

