import { useEffect, useMemo, useRef, useState } from "react";
import { BITRIX_APP_CONFIG } from "../../config/bitrixConfig";
import {
  buildHistoryMovementFields,
  getBitrixItemCollection,
  normalizeHistoryItem,
  sortHistoryItemsDesc,
} from "../../lib/bitrix/history";
import { createHistoryItem, listHistoryItems, updateSpaItem } from "../../lib/bitrix/spa";
import { getAllBitrixUsers } from "../../lib/bitrix/users";

function formatMovementDate(item) {
  if (!item?.dateValue && !item?.timeValue) {
    return "Sin fecha";
  }

  const baseValue = item.timeValue || item.dateValue;
  const parsed = new Date(baseValue);

  if (Number.isNaN(parsed.getTime())) {
    return item.timeValue || item.dateValue;
  }

  return parsed.toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: item.timeValue ? "short" : undefined,
  });
}

function hasUsefulValue(value) {
  return Boolean(value && value !== "-");
}

function getAssetDisplayTitle(asset) {
  const hasBrand = hasUsefulValue(asset?.brand);
  const hasModel = hasUsefulValue(asset?.model);
  const hasType = hasUsefulValue(asset?.type);
  const hasSerialNumber = hasUsefulValue(asset?.serialNumber);
  const hasInternalId = hasUsefulValue(asset?.idInterno);

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

export default function TimelineModal({ asset, user, onClose, onSaved }) {
  const [users, setUsers] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const containerRef = useRef(null);

  useEffect(() => {
    if (!asset) return;

    let cancelled = false;

    async function loadModalData() {
      setLoadingUsers(true);
      setLoadingHistory(true);
      setUsersError("");
      setHistoryError("");

      let nextUsers = [];

      try {
        nextUsers = (await getAllBitrixUsers()) || [];
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
          setUsers(nextUsers);
          setLoadingUsers(false);
        }
      }

      try {
        const historyResponse = await listHistoryItems({
          [BITRIX_APP_CONFIG.HISTORY.FIELDS.ID_INTERNO_ACTIVO]: asset.idInterno,
        });

        if (cancelled) return;

        const userMap = new Map(
          nextUsers.map((currentUser) => [currentUser.id, currentUser])
        );

        setHistoryItems(
          sortHistoryItemsDesc(
            getBitrixItemCollection(historyResponse).map((item) =>
              normalizeHistoryItem(item, userMap)
            )
          )
        );
      } catch (error) {
        console.error("Error cargando historial real:", error);
        if (!cancelled) {
          setHistoryError(
            error?.description ||
              error?.error_description ||
              error?.message ||
              "No se ha podido cargar el historial de movimientos."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    }

    loadModalData();

    return () => {
      cancelled = true;
    };
  }, [asset]);

  useEffect(() => {
    if (!asset) return;

    setSearchUser("");
    setSelectedUser(null);
    setDropdownOpen(false);
    setSaveError("");
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

    return users.filter((currentUser) =>
      [currentUser.name, currentUser.email, String(currentUser.id)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [users, searchUser]);

  if (!asset) return null;

  function handleSelectUser(nextUser) {
    setSelectedUser(nextUser);
    setSearchUser(nextUser.name);
    setDropdownOpen(false);
  }

  async function handleAssign() {
    if (!selectedUser) return;

    try {
      setSaving(true);
      setSaveError("");

      await updateSpaItem(asset.itemId, {
        [BITRIX_APP_CONFIG.FIELDS.VINCULADO_A]: selectedUser.id,
      });

      try {
        await createHistoryItem(
          buildHistoryMovementFields(asset, {
            movementTypeId:
              BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.Reasignacion,
            previousUserId: asset.linkedToId,
            newUserId: selectedUser.id,
            performedById: user?.id,
            detail: "Reasignado manualmente desde panel admin",
          })
        );
      } catch (historyError) {
        console.error("Error creando historial de reasignacion:", historyError);
      }

      await onSaved?.();
    } catch (error) {
      console.error("Error reasignando activo:", error);
      setSaveError(
        error?.description ||
          error?.error_description ||
          error?.message ||
          "No se ha podido reasignar el dispositivo."
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
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Vinculaciones y timeline</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {getAssetDisplayTitle(asset)}
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Vinculacion actual
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
                      filteredUsers.map((currentUser) => (
                        <button
                          key={currentUser.id}
                          type="button"
                          onClick={() => handleSelectUser(currentUser)}
                          className="flex w-full flex-col items-start gap-1 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                        >
                          <span className="text-sm font-semibold text-slate-900">
                            {currentUser.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {currentUser.email || "Sin email"} · ID {currentUser.id}
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
                disabled={!selectedUser || saving}
                className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Reasignando..." : "Reasignar dispositivo"}
              </button>

              {saveError ? (
                <p className="mt-3 text-sm font-medium text-rose-600">
                  {saveError}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>

            <div className="mt-4 space-y-3">
              {loadingHistory ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  Cargando historial...
                </div>
              ) : historyError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {historyError}
                </div>
              ) : historyItems.length ? (
                historyItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {formatMovementDate(item)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {item.movementTypeLabel}
                    </p>
                    {item.detail ? (
                      <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
                    ) : null}
                    {item.previousUser || item.newUser ? (
                        <p className="mt-2 text-sm text-slate-600">
                          Usuario: {item.previousUser || "-"} {"→"} {item.newUser || "-"}
                        </p>
                      ) : null}

                      {item.previousState || item.newState ? (
                        <p className="mt-1 text-sm text-slate-600">
                          Estado: {item.previousState || "-"} {"→"} {item.newState || "-"}
                        </p>
                      ) : null}

                      {item.previousLocation || item.newLocation ? (
                        <p className="mt-1 text-sm text-slate-600">
                          Ubicacion: {item.previousLocation || "-"} {"→"} {item.newLocation || "-"}
                        </p>
                      ) : null}
                    {item.performedBy ? (
                      <p className="mt-1 text-sm text-slate-500">
                        Realizado por: {item.performedBy}
                      </p>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  Este activo todavia no tiene movimientos registrados.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

