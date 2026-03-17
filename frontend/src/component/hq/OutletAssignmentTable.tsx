import type { Dispatch, SetStateAction } from "react";
import type { OutletMenuConfigItem } from "../../api/outletMenuConfigs";

type EditMap = Record<number, { outlet_price: string; stock_level: string }>;

interface Props {
  configs: OutletMenuConfigItem[];
  editValues: EditMap;
  setEditValues: Dispatch<SetStateAction<EditMap>>;
  selectedOutlet: number | "";
  loadingConfigs: boolean;
  savingId: number | null;
  savingBatch: boolean;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  onUpdateConfig: (
    config: OutletMenuConfigItem,
    price: string,
    stock: string,
  ) => void;
  onSaveAll: () => void;
}

export default function OutletAssignmentTable({
  configs,
  editValues,
  setEditValues,
  selectedOutlet,
  loadingConfigs,
  savingId,
  savingBatch,
  page,
  totalPages,
  setPage,
  onUpdateConfig,
  onSaveAll,
}: Props) {
  const updateField = (
    id: number,
    field: "outlet_price" | "stock_level",
    value: string,
  ) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {
          outlet_price:
            configs.find((c) => c.id === id)?.outlet_price.toString() || "0",
          stock_level:
            configs.find((c) => c.id === id)?.stock_level.toString() || "0",
        }),
        [field]: value,
      },
    }));
  };

  const isSelectionEmpty = selectedOutlet === "";
  const noData = !loadingConfigs && configs.length === 0;

  return (
    <div className="mt-6">
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Item Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Base Price</th>
              <th className="px-4 py-3">Outlet Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {configs.map((config) => {
              const rowState = editValues[config.id] || {
                outlet_price: Number(config.outlet_price).toFixed(2),
                stock_level: String(config.stock_level),
              };

              const isSaving = savingId === config.id;

              return (
                <tr
                  key={config.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {config.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {config.sku}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    ${Number(config.base_price).toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={rowState.outlet_price}
                      onChange={(e) =>
                        updateField(config.id, "outlet_price", e.target.value)
                      }
                      className="w-24 rounded border border-slate-200 px-2 py-1 outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={rowState.stock_level}
                      onChange={(e) =>
                        updateField(config.id, "stock_level", e.target.value)
                      }
                      className="w-20 rounded border border-slate-200 px-2 py-1 outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400"
                    />
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        onUpdateConfig(
                          config,
                          rowState.outlet_price,
                          rowState.stock_level,
                        )
                      }
                      disabled={isSaving}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-300"
                    >
                      {isSaving ? "Saving..." : "Update"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {(isSelectionEmpty || noData || loadingConfigs) && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-slate-400 italic"
                >
                  {isSelectionEmpty
                    ? "Please select an outlet to continue"
                    : loadingConfigs
                      ? "Fetching assignments..."
                      : "No items found for this outlet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || isSelectionEmpty}
              className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-40 text-xs"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || isSelectionEmpty}
              className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-40 text-xs"
            >
              Next
            </button>
          </div>
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
        </div>

        <button
          onClick={onSaveAll}
          disabled={isSelectionEmpty || loadingConfigs || savingBatch}
          className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all"
        >
          {savingBatch ? "Syncing..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
