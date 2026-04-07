export default function AdminTabs({ activeTab, onChange }) {
  const tabs = [
    { id: "inventory", label: "Ver inventario" },
    { id: "register", label: "Registrar dispositivo" },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}