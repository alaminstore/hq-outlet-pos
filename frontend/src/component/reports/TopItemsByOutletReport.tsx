import { useEffect, useState } from "react";
import { fetchOutlets, type Outlet } from "../../api/outlets";
import {
  fetchTopItemsByOutlet,
  type TopItemByOutletItem,
} from "../../api/reports";

export default function TopItemsByOutletReport() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [items, setItems] = useState<TopItemByOutletItem[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<number | "">("");

  const [status, setStatus] = useState({
    loading: false,
    outletsLoading: false,
    error: null as string | null,
  });

  const getOutlets = async () => {
    setStatus((prev) => ({ ...prev, outletsLoading: true }));
    try {
      const data = await fetchOutlets();
      setOutlets(data);
    } catch {
      setStatus((prev) => ({ ...prev, error: "Failed to load outlets." }));
    } finally {
      setStatus((prev) => ({ ...prev, outletsLoading: false }));
    }
  };

  const getReport = async (id: number) => {
    setStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetchTopItemsByOutlet(id);
      setItems(res.items);
    } catch {
      setItems([]);
      setStatus((prev) => ({ ...prev, error: "Error fetching report data." }));
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    getOutlets();
  }, []);

  const handleOutletChange = (id: string) => {
    const val = id ? Number(id) : "";
    setSelectedOutlet(val);

    if (val) {
      getReport(val);
    } else {
      setItems([]);
    }
  };

  const renderPlaceholder = () => {
    if (status.loading) return "Loading report...";
    if (status.error) return status.error;
    if (!selectedOutlet) return "Select an outlet to view results.";
    if (items.length === 0) return "No data found for this outlet.";
    return null;
  };

  const placeholder = renderPlaceholder();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Top 5 Selling Items
          </h2>
          <p className="text-sm text-slate-500">
            Performance breakdown per location.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
          <label
            htmlFor="outlet-select"
            className="text-[10px] font-black text-slate-400 uppercase"
          >
            Outlet
          </label>
          <select
            id="outlet-select"
            value={selectedOutlet}
            onChange={(e) => handleOutletChange(e.target.value)}
            disabled={status.outletsLoading}
            className="bg-transparent text-sm font-semibold outline-none cursor-pointer text-slate-700"
          >
            <option value="">
              {status.outletsLoading ? "Loading..." : "Choose Outlet"}
            </option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5">Item Name</th>
              <th className="px-4 py-3.5">SKU</th>
              <th className="px-4 py-3.5 text-right">Qty</th>
              <th className="px-4 py-3.5 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {placeholder ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-slate-400 italic"
                >
                  {placeholder}
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.menu_item_id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {row.item_name}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                    {row.sku}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 font-medium">
                    {row.total_quantity.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-900 font-semibold">
                    {Number(row.total_revenue).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    <span className="text-[10px] text-slate-400 ml-1">BDT</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
