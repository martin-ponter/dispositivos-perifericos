export function InputField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
  error = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${
          disabled ? "cursor-not-allowed bg-slate-100" : ""
        } ${
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            : "border-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
        }`}
      />
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  error = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            : "border-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
      />
    </div>
  );
}