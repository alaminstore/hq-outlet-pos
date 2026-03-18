import type { RevenueByOutletItem } from "../../api/reports";

interface RevenueReportProps {
  items: RevenueByOutletItem[];
  loading: boolean;
  error?: string | null;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function RevenueByOutletReport({
  items,
  loading,
  error,
  page,
  totalPages,
  onPrev,
  onNext,
}: RevenueReportProps) {
  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td
            colSpan={2}
            className="px-4 py-10 text-center text-slate-400 italic"
          >
            Loading report...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td
            colSpan={2}
            className="px-4 py-10 text-center text-red-500 italic"
          >
            {error}
          </td>
        </tr>
      );
    }

    if (items.length === 0) {
      return (
        <tr>
          <td
            colSpan={2}
            className="px-4 py-10 text-center text-slate-400 italic"
          >
            No data available.
          </td>
        </tr>
      );
    }

    return items.map((item) => (
      <tr key={item.outlet_id} className="hover:bg-slate-50/50">
        <td className="px-4 py-3 font-medium text-slate-700">
          {item.outlet_name}
        </td>
        <td className="px-4 py-3 text-right text-slate-900 font-semibold">
          {Number(item.total_revenue).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          <span className="text-[10px] text-slate-400 ml-1">BDT</span>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Outlet</th>
              <th className="px-4 py-3 text-right">Total Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {renderTableContent()}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={onPrev}
              disabled={page <= 1 || loading}
              className="px-4 py-1.5 border rounded-md hover:bg-slate-50 disabled:opacity-40 text-xs font-medium transition-colors"
            >
              Previous
            </button>
            <button
              onClick={onNext}
              disabled={page >= totalPages || loading}
              className="px-4 py-1.5 border rounded-md hover:bg-slate-50 disabled:opacity-40 text-xs font-medium transition-colors"
            >
              Next
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
