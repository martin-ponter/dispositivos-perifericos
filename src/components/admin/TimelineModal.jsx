import { useEffect, useMemo, useRef, useState } from "react";
import { getAllBitrixUsers } from "../../lib/bitrix/users";

export default function TimelineModal({ asset, onClose }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    if (!asset) return;

    let cancelled = false;

    async function loadUsers() {
      try {
        setLoadingUsers(true);
        setUsersError("");

        const companyUsers = await getAllBitrixUsers();

        if (cancelled) return;

        setUsers(companyUsers);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        if (!cancelled) {
          setUsersError(
            error?.description ||
              error?.error_description ||
              error?.message ||
              "No se han podido cargar los usuarios de Bitrix."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingUsers(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [asset]);

  useEffect(() => {
    if (!asset) return;

    if (asset.linkedTo && asset.linkedTo !== "-") {
      setSearchUser("");
    } else {
      setSearchUser("");
    }

    setSelectedUser(null);
    setDropdownOpen(false);
  }, [asset]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

 const filteredUsers = useMemo(() => {
  const normalizedSearch = searchUser.trim().toLowerCase();

  if (!normalizedSearch) {
    return users;
  }

  return users.filter((user) =>
    [user.name, user.email, String(user.id)]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch)
  );
}, [users, searchUser]);

  if (!asset) return null;

  function handleSelectUser(user) {
    setSelectedUser(user);
    setSearchUser(user.name);
    setDropdownOpen(false);
  }

  function handleAssign() {
    if (!selectedUser) return;

    alert(
      `Aquí luego conectaremos la asignación real del activo ${asset.id} al usuario ${selectedUser.name} (${selectedUser.id}).`
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Vinculaciones y timeline</p>
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Vinculación actual
            </h3>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Usuario actual
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {asset.linkedTo || "Sin asignar"}
              </p>
            </div>

            <div className="mt-4" ref={containerRef}>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Asignar a otro usuario
              </label>

              <input
                type="text"
                value={searchUser}
                onChange={(e) => {
                  setSearchUser(e.target.value);
                  setSelectedUser(null);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Escribe nombre, email o ID del usuario"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
              />

              <div className="relative">
                {dropdownOpen && (
                  <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                    {loadingUsers ? (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        Cargando usuarios...
                      </div>
                    ) : usersError ? (
                      <div className="px-4 py-3 text-sm text-rose-600">
                        {usersError}
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        No se han encontrado usuarios.
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="flex w-full flex-col items-start gap-1 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                        >
                          <span className="text-sm font-semibold text-slate-900">
                            {user.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {user.email || "Sin email"} · ID {user.id}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedUser && (
                <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-emerald-700">
                    Usuario seleccionado
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedUser.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {selectedUser.email || "Sin email"} · ID {selectedUser.id}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleAssign}
                disabled={!selectedUser}
                className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reasignar dispositivo
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>

            <div className="mt-4 space-y-3">
              {asset.timeline.map((item, index) => (
                <div
                  key={`${item.date}-${item.action}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {item.date}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {item.action}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{item.user}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}