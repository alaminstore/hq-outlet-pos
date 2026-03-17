import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOutlets, type Outlet } from "../../api/outlets";
import {
  fetchOutletMenuConfigs,
  updateOutletMenuConfigsBatch,
  updateOutletMenuConfig,
  type OutletMenuConfigItem,
} from "../../api/outletMenuConfigs";
import OutletAssignmentTable from "./OutletAssignmentTable";

interface Props {
  onBackToMasterMenu: () => void;
}

export default function OutletAssignmentSection({ onBackToMasterMenu }: Props) {
  const navigate = useNavigate();

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [configs, setConfigs] = useState<OutletMenuConfigItem[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<number | "">("");
  const [editValues, setEditValues] = useState<
    Record<number, { outlet_price: string; stock_level: string }>
  >({});

  const [loading, setLoading] = useState({ outlets: false, configs: false });
  const [saving, setSaving] = useState<{ id: number | null; batch: boolean }>({
    id: null,
    batch: false,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    msg: string;
  } | null>(null);

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const loadOutlets = async () => {
    setLoading((prev) => ({ ...prev, outlets: true }));
    try {
      const data = await fetchOutlets();
      setOutlets(data);
    } catch {
      setFeedback({ type: "error", msg: "Could not load outlets list." });
    } finally {
      setLoading((prev) => ({ ...prev, outlets: false }));
    }
  };

  const loadConfigs = useCallback(async () => {
    if (!selectedOutlet) return;

    setLoading((prev) => ({ ...prev, configs: true }));
    try {
      const { items, total_pages } = await fetchOutletMenuConfigs(
        selectedOutlet,
        page,
        5,
      );
      setConfigs(items);
      setTotalPages(total_pages || 1);
      setEditValues({});
    } catch {
      setFeedback({ type: "error", msg: "Failed to fetch assignments." });
    } finally {
      setLoading((prev) => ({ ...prev, configs: false }));
    }
  }, [selectedOutlet, page]);

  useEffect(() => {
    loadOutlets();
  }, []);

  useEffect(() => {
    if (selectedOutlet) loadConfigs();
    else {
      setConfigs([]);
      setPage(1);
    }
  }, [selectedOutlet, page, loadConfigs]);

  const handleUpdateSingle = async (
    config: OutletMenuConfigItem,
    price: string,
    stock: string,
  ) => {
    const p = parseFloat(price);
    const s = parseInt(stock, 10);

    if (isNaN(p) || isNaN(s) || p < 0 || s < 0) {
      return setFeedback({
        type: "error",
        msg: "Please enter positive quantity.",
      });
    }

    setSaving({ id: config.id, batch: false });
    try {
      const updated = await updateOutletMenuConfig(
        selectedOutlet as number,
        config.id,
        p,
        s,
      );
      setConfigs((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      notify("Item updated successfully");
    } catch {
      setFeedback({ type: "error", msg: "Save failed." });
    } finally {
      setSaving({ id: null, batch: false });
    }
  };

  const handleSaveAll = async () => {
    if (!selectedOutlet) return;

    const updates = configs.map((c) => {
      const edited = editValues[c.id];
      return {
        config_id: c.id,
        outlet_price: edited
          ? parseFloat(edited.outlet_price)
          : Number(c.outlet_price),
        stock_level: edited
          ? parseInt(edited.stock_level, 10)
          : Number(c.stock_level),
      };
    });

    setSaving({ id: null, batch: true });
    try {
      const updatedItems = await updateOutletMenuConfigsBatch(
        selectedOutlet as number,
        updates,
      );
      // Merging logic that looks cleaner
      setConfigs((prev) =>
        prev.map((item) => updatedItems.find((u) => u.id === item.id) || item),
      );
      setEditValues({});
      notify("Bulk update complete");
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message || "Bulk save failed." });
    } finally {
      setSaving({ id: null, batch: false });
    }
  };

  return (
    <section className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Outlet Assignment
          </h2>
          <p className="text-sm text-slate-500">
            Configure menu availability and pricing per location.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToMasterMenu}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
          >
            ← Back
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Outlet:
            </span>
            <select
              value={selectedOutlet}
              onChange={(e) => {
                setSelectedOutlet(e.target.value ? Number(e.target.value) : "");
                setPage(1);
              }}
              className="bg-transparent text-sm font-medium outline-none cursor-pointer"
            >
              <option value="">Choose an outlet...</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate(`/hq/add-item?outlet_id=${selectedOutlet}`)}
          disabled={!selectedOutlet}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-300"
        >
          + Add Item from Master Menu
        </button>
      </div>

      <OutletAssignmentTable
        configs={configs}
        editValues={editValues}
        setEditValues={setEditValues}
        selectedOutlet={selectedOutlet}
        loadingConfigs={loading.configs}
        savingId={saving.id}
        savingBatch={saving.batch}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        onUpdateConfig={handleUpdateSingle}
        onSaveAll={handleSaveAll}
      />

      {feedback && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs text-center font-medium border ${
            feedback.type === "error"
              ? "bg-red-50 border-red-100 text-red-700"
              : "bg-emerald-50 border-emerald-100 text-emerald-700"
          }`}
        >
          {feedback.msg}
        </div>
      )}
    </section>
  );
}
