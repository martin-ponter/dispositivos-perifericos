import { useEffect, useState } from "react";

export default function EditAssetModal({ asset, onClose }) {
  const [form, setForm] = useState({
    state: "",
    location: "",
    invoice: "",
    observations: "",
  });

  useEffect(() => {
    if (!asset) return;

    setForm({
      state: asset.state || "",
      location: asset.location || "",
      invoice: asset.invoice || "",
      observations: "",
    });
  }, [asset]);

  if (!asset) return null;

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSave() {
    alert(
      `Aquí luego conectaremos la edición real del activo ${asset.id}, incluida la factura.`
    );
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
            <p className="mt-1 text-sm text-slate-600">ID: {asset.id}</p>
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
              <option value="Disponible">Disponible</option>
              <option value="Asignado">Asignado</option>
              <option value="Averiado">Averiado</option>
              <option value="En reparación">En reparación</option>
              <option value="Baja">Baja</option>
            </select>
          </Field>

          <Field label="Ubicación">
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
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            />
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

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Guardar cambios
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