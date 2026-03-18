import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchRevenueByOutlet,
  type RevenueByOutletItem,
} from "../../api/reports";
import RevenueByOutletReport from "../../component/reports/RevenueByOutletReport";
import TopItemsByOutletReport from "../../component/reports/TopItemsByOutletReport";

function useRevenueReport() {
  const [data, setData] = useState<{
    items: RevenueByOutletItem[];
    page: number;
    totalPages: number;
  }>({ items: [], page: 1, totalPages: 1 });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRevenueByOutlet(page, 10);
      setData({
        items: result.data,
        page: result.pagination.page,
        totalPages: result.pagination.total_pages,
      });
    } catch {
      setError("Could not load revenue report.");
    } finally {
      setLoading(false);
    }
  };

  return { ...data, loading, error, load };
}

export default function HqReportsPage() {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState<
    "revenue" | "top-items" | null
  >(null);
  const revenue = useRevenueReport();

  const handleShowRevenue = () => {
    setActiveReport("revenue");
    revenue.load(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
            <p className="mt-1 text-sm text-slate-600">
              HQ reporting dashboard.
            </p>
          </div>
          <button
            onClick={() => navigate("/hq")}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Back to HQ
          </button>
        </header>

        <nav className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ReportTabButton
            onClick={handleShowRevenue}
            active={activeReport === "revenue"}
            label="Total revenue by outlet"
          />
          <ReportTabButton
            onClick={() => setActiveReport("top-items")}
            active={activeReport === "top-items"}
            label="Top 5 selling items per outlet"
          />
        </nav>

        <main className="space-y-6">
          {activeReport === "revenue" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">
                Total Revenue by Outlet
              </h2>
              <RevenueByOutletReport
                items={revenue.items}
                loading={revenue.loading}
                error={revenue.error}
                page={revenue.page}
                totalPages={revenue.totalPages}
                onPrev={() => revenue.load(revenue.page - 1)}
                onNext={() => revenue.load(revenue.page + 1)}
              />
            </section>
          )}

          {activeReport === "top-items" && <TopItemsByOutletReport />}
        </main>
      </div>
    </div>
  );
}

function ReportTabButton({
  onClick,
  label,
  active,
}: {
  onClick: () => void;
  label: string;
  active: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border p-4 text-left text-sm font-semibold transition ${
        active
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      {label}
    </button>
  );
}
