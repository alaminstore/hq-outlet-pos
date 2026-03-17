import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchMasterMenu, type MasterMenuItem } from "../../api/masterMenu";
import {
  createOutletMenuConfigsBatch,
  fetchOutletMenuConfigs,
} from "../../api/outletMenuConfigs";

type SelectState = Record<number, { selected: boolean; stock_level: string }>;

function AddOutletItemsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const outletIdParam = searchParams.get("outlet_id");
  const outletId = outletIdParam ? Number(outletIdParam) : NaN;

  const [menuItems, setMenuItems] = useState<MasterMenuItem[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [selection, setSelection] = useState<SelectState>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isFinite(outletId) || outletId <= 0) return;

    let isActive = true;
    setLoading(true);
    setError("");

    Promise.all([fetchMasterMenu(1, 200), fetchOutletMenuConfigs(outletId, 1, 500)])
      .then(([master, configs]) => {
        if (!isActive) return;
        setMenuItems(master.items);
        setAssignedIds(
          new Set(configs.items.map((item) => item.menu_item_id))
        );
      })
      .catch(() => {
        if (isActive) setError("Unable to load menu items.");
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [outletId]);

  const availableItems = useMemo(
    () => menuItems.filter((item) => !assignedIds.has(item.id)),
    [menuItems, assignedIds]
  );

  const toggleSelect = (id: number, selected: boolean) => {
    setSelection((prev) => ({
      ...prev,
      [id]: {
        selected,
        stock_level: prev[id]?.stock_level ?? "0",
      },
    }));
  };

  const updateStock = (id: number, value: string) => {
    setSelection((prev) => ({
      ...prev,
      [id]: {
        selected: prev[id]?.selected ?? false,
        stock_level: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!Number.isFinite(outletId) || outletId <= 0) return;

    const updates = availableItems
      .filter((item) => selection[item.id]?.selected)
      .map((item) => {
        const stockValue = Number(selection[item.id]?.stock_level ?? "0");
        if (!Number.isInteger(stockValue) || stockValue < 0) {
          throw new Error("Stock level must be a non-negative integer.");
        }
        return {
          menu_item_id: item.id,
          stock_level: stockValue,
        };
      });

    if (updates.length === 0) {
      setError("Select at least one item.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await createOutletMenuConfigsBatch(outletId, updates);
      navigate("/hq", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to save items.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!Number.isFinite(outletId) || outletId <= 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">
            Add Items to Outlet
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Outlet ID is missing. Go back and select an outlet first.
          </p>
          <button
            type="button"
            onClick={() => navigate("/hq", { replace: true })}
            className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Back to HQ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Add Items to Outlet
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Outlet ID: {outletId}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate("/hq")}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Saving..." : "Save Selected"}
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Select</th>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Base Price</th>
                <th className="px-4 py-3 font-semibold">Stock Level</th>
              </tr>
            </thead>
            <tbody>
              {availableItems.map((item) => {
                const row = selection[item.id] ?? {
                  selected: false,
                  stock_level: "0",
                };
                return (
                  <tr key={item.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={(event) =>
                          toggleSelect(item.id, event.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-slate-900"
                      />
                    </td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 text-slate-500">{item.sku}</td>
                    <td className="px-4 py-3 text-slate-500">
                      ${item.basePrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={row.stock_level}
                        onChange={(event) =>
                          updateStock(item.id, event.target.value)
                        }
                        disabled={!row.selected}
                        className="w-24 rounded-md border border-slate-200 px-2 py-1 text-sm disabled:bg-slate-100"
                      />
                    </td>
                  </tr>
                );
              })}
              {!loading && availableItems.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    All master menu items are already assigned to this outlet.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    Loading menu items...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default AddOutletItemsPage;
